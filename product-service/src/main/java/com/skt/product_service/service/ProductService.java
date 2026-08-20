package com.skt.product_service.service;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.dto.ProductFormConfig;
import com.skt.product_service.dto.ProductPageResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.event.ProductCreatedEvent;
import com.skt.product_service.exception.ProductCreationException;
import com.skt.product_service.exception.ProductNotFoundException;
import com.skt.product_service.service.brand.ProductBrandService;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.util.ProductUtil;
import com.skt.product_service.model.Product;

import com.skt.product_service.model.ProductCategory;
import com.skt.product_service.repository.ProductRepository;

import com.skt.product_service.service.factory.ProductFactoryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductFactoryRegistry factoryRegistry;
    private final ProductUtil productUtil;
    private final ProductMapper productMapper;
    private final ProductQueryService productQueryService;
    private final ProductPageRequestService productPageRequestService;
    private final ProductFormConfigService productFormConfigService;
    private final ProductBrandService productBrandService;

    @Autowired
    private KafkaTemplate<String, ProductCreatedEvent> kafkaTemplate;
    public static final String PRODUCT_CREATED_TOPIC = "product-created-topic";

    // ========================= GET =========================
    public ProductResponse getProductById(String id) {
        CachedProduct cachedProduct = productQueryService.getCachedProductById(id);
        return productMapper.toProductResponse(cachedProduct);
    }

    // ========================= CREATE =========================
    public ProductResponse createProduct(ProductRequest productRequest, List<MultipartFile> productImages)  {

        long start = System.currentTimeMillis();
        validateCreateRequest(productRequest, productImages);

        log.info("[CREATE] Creating product name={}, type={}",
                productRequest.name(), productRequest.productCategory());

        log.debug("[CREATE] Payload={}", productRequest);

        try {
            Product product = createProductFromFactory(productRequest);

            productBrandService.validateActiveBrand(productRequest.brandId());

            product.setBrandId(product.getBrandId());
            product.setProductCategory(product.getProductCategory());
            product.setSkuCode(productUtil.generateUniqueSkuCode(product.getProductCategory()));
            product.setProductImages(productUtil.uploadProductImages(productImages, product.getSkuCode(), product.getCategoryId()));

            Product savedProduct = saveProduct(product);

            log.info("[CREATE] Product created id={}", savedProduct.getId());
            publishProductCreatedEvent(savedProduct);

            return productMapper.toProductResponse(
                    productMapper.toCachedProduct(savedProduct)
            );
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new ProductCreationException("Error in creating product", ex);
        } finally {
            log.debug("[PERF] createProduct took {} ms",
                    System.currentTimeMillis() - start);
        }
    }

    private void publishProductCreatedEvent(Product savedProduct) {

        try {
            ProductCreatedEvent event = ProductCreatedEvent.newBuilder()
                    .setProductId(savedProduct.getId())
                    .setSkuCode(savedProduct.getSkuCode())
                    .setInitialQuantity(0)   // default stock
                    .build();

            kafkaTemplate.send(PRODUCT_CREATED_TOPIC, savedProduct.getId(), event);

            log.info("[KAFKA] ProductCreatedEvent sent for productId={}", savedProduct.getId());

        } catch (Exception ex) {
            log.error("[KAFKA] Failed to publish ProductCreatedEvent for productId={}",
                    savedProduct.getId(), ex);

            // ⚠️ Do NOT fail product creation because of Kafka
            // (eventual consistency)
        }
    }
    // ========================= UPDATE =========================
    @CacheEvict(value = "products_v4", key = "#id")
    public ProductResponse updateProduct(String id, ProductRequest productRequest, List<MultipartFile> productImages) {

        log.info("[UPDATE] Updating product id={}", id);
        log.debug("[UPDATE] Payload={}", productRequest);
        validateUpdateRequest(productRequest);

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[UPDATE] Product not found id={}", id);
                    return new ProductNotFoundException(id);
                });

        String existingCategory = existingProduct.getProductCategory();
        if (existingCategory != null
                && productRequest.productCategory() != null
                && !existingCategory.equalsIgnoreCase(productRequest.productCategory().name())) {
            throw new IllegalArgumentException("Changing productCategory is not supported for existing products");
        }

        ProductFactory factory = factoryRegistry.getFactory(existingCategory);
        Product updatedProduct = factory.update(existingProduct, productRequest);
        updatedProduct.setSkuCode(existingProduct.getSkuCode());
        updatedProduct.setCreatedAt(existingProduct.getCreatedAt());
        if (productImages != null && !productImages.isEmpty()) {
            updatedProduct.setProductImages(productUtil.uploadProductImages(productImages, updatedProduct.getSkuCode(), updatedProduct.getCategoryId()));
        } else {
            updatedProduct.setProductImages(existingProduct.getProductImages());
        }

        Product savedProduct = productRepository.save(updatedProduct);

        log.info("[UPDATE] Product updated id={}", id);

        return productMapper.toProductResponse(productMapper.toCachedProduct(savedProduct));
    }

    // ========================= DELETE =========================
    @CacheEvict(value = "products_v4", key = "#id")
    public void deleteProduct(String id) {

        log.info("[DELETE] Deleting product id={}", id);

        if (!productRepository.existsById(id)) {
            log.warn("[DELETE] Product not found id={}", id);
            throw new ProductNotFoundException(id);
        }

        productRepository.deleteById(id);

        log.info("[DELETE] Product deleted id={}", id);
    }

    // ========================= INTERNAL =========================
    private Product saveProduct(Product product) {

        log.debug("[SAVE] Persisting product name={}, type={}",
                product.getName(), product.getProductCategory());

        Product savedProduct = productRepository.save(product);

        log.info("[SAVE] {} created id={}",
                savedProduct.getProductCategory(), savedProduct.getId());

        return savedProduct;
    }

    public List<BaseProductResponse> getProductsByCategory(String productCategory) {
        return productRepository.findAllByProductCategoryIgnoreCase(productCategory).stream()
                .map(productMapper::toBaseResponse)
                .toList();

    }

    public List<BaseProductResponse> getProductByBrand(String productBrand) {
        return productRepository.findAllBybrandIdIgnoreCase(productBrand).stream()
                .map(productMapper::toBaseResponse)
                .toList();
    }

    public List<BaseProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toBaseResponse)
                .toList();
    }

    public ProductPageResponse getProductsPage(
            int page,
            int size,
            String categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            String direction
    ) {
        ProductPageRequestService.ProductPagingOptions pagingOptions =
                productPageRequestService.resolvePagingOptions(page, size, minPrice, maxPrice, sort, direction);

        String normalizedCategoryId = productPageRequestService.normalizeOptional(categoryId);
        String normalizedBrand = productPageRequestService.normalizeOptional(brand);

        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (normalizedCategoryId != null) {
            criteriaList.add(Criteria.where("categoryId").is(normalizedCategoryId));
        }

        if (normalizedBrand != null) {
            criteriaList.add(Criteria.where("brandId").regex("^" + Pattern.quote(normalizedBrand) + "$", "i"));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria.gte(minPrice.doubleValue());
            }
            if (maxPrice != null) {
                priceCriteria.lte(maxPrice.doubleValue());
            }
            criteriaList.add(priceCriteria);
        }

        criteriaList.forEach(query::addCriteria);

        return productPageRequestService.fetchPage(query, pagingOptions);
    }

    public ProductPageResponse searchProducts(
            String q,
            String categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sort,
            String direction
    ) {
        if (q == null || q.trim().isEmpty()) {
            throw new IllegalArgumentException("q must not be blank");
        }

        ProductPageRequestService.ProductPagingOptions pagingOptions =
                productPageRequestService.resolvePagingOptions(page, size, minPrice, maxPrice, sort, direction);
        String normalizedQ = q.trim();
        String normalizedCategoryId = productPageRequestService.normalizeOptional(categoryId);
        String normalizedBrand = productPageRequestService.normalizeOptional(brand);

        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        criteriaList.add(new Criteria().orOperator(
                Criteria.where("name").regex(Pattern.quote(normalizedQ), "i"),
                Criteria.where("description").regex(Pattern.quote(normalizedQ), "i"),
                Criteria.where("skuCode").regex(Pattern.quote(normalizedQ), "i"),
                Criteria.where("brandId").regex(Pattern.quote(normalizedQ), "i")
        ));

        if (normalizedCategoryId != null) {
            criteriaList.add(Criteria.where("categoryId").is(normalizedCategoryId));
        }

        if (normalizedBrand != null) {
            criteriaList.add(Criteria.where("brandId").regex("^" + Pattern.quote(normalizedBrand) + "$", "i"));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria.gte(minPrice.doubleValue());
            }
            if (maxPrice != null) {
                priceCriteria.lte(maxPrice.doubleValue());
            }
            criteriaList.add(priceCriteria);
        }

        criteriaList.forEach(query::addCriteria);

        return productPageRequestService.fetchPage(query, pagingOptions);
    }

    public ProductFormConfig getProductFormConfig(String productCategory) {
        return productFormConfigService.getProductFormConfig(productCategory);
    }


    private Product createProductFromFactory(ProductRequest request) {

        log.debug("[FACTORY] Resolving factory for Product Category={}", request.productCategory());

        ProductFactory factory = factoryRegistry.getFactory(request.productCategory());

        return factory.create(request);
    }

    private void validateCreateRequest(ProductRequest request, List<MultipartFile> productImages) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.description() == null || request.description().isBlank()) {
            throw new IllegalArgumentException("description is required");
        }
        if (request.price() == null) {
            throw new IllegalArgumentException("price is required");
        }
        if (request.categoryId() == null || request.categoryId().isBlank()) {
            throw new IllegalArgumentException("categoryId is required");
        }
        if (request.brandId() == null || request.brandId().isBlank()) {
            throw new IllegalArgumentException("brandId is required");
        }

        if (productImages == null || productImages.isEmpty()) {
            throw new IllegalArgumentException("productImages are required");
        }
        validateCategorySpecificFields(request);
    }

    private void validateUpdateRequest(ProductRequest request) {
        if (request.productCategory() == null) {
            throw new IllegalArgumentException("productCategory is required");
        }
    }

    private void validateCategorySpecificFields(ProductRequest request) {
        List<String> missingFields = new java.util.ArrayList<>();

        if (request.productCategory() == ProductCategory.LAPTOP) {
            addMissing(missingFields, "processor", request.processor());
            addMissing(missingFields, "ramGb", request.ramGb());
            addMissing(missingFields, "storageGb", request.storageGb());
            addMissing(missingFields, "screenSize", request.screenSize());
            addMissing(missingFields, "graphics", request.graphics());
        }

        if (request.productCategory() == ProductCategory.COMPUTER) {
            addMissing(missingFields, "processor", request.processor());
            addMissing(missingFields, "ramGb", request.ramGb());
            addMissing(missingFields, "storageGb", request.storageGb());
            addMissing(missingFields, "screenSize", request.screenSize());
            addMissing(missingFields, "graphics", request.graphics());
            addMissing(missingFields, "mouse", request.mouse());
            addMissing(missingFields, "keyboard", request.keyboard());
        }

        if (!missingFields.isEmpty()) {
            throw new IllegalArgumentException("Missing required fields for "
                    + request.productCategory().name().toLowerCase(java.util.Locale.ROOT)
                    + ": " + String.join(", ", missingFields));
        }
    }

    private void addMissing(List<String> missingFields, String fieldName, String value) {
        if (value == null || value.isBlank()) {
            missingFields.add(fieldName);
        }
    }

}