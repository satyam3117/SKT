package com.skt.product_service.service;

import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.dto.ProductFormConfig;
import com.skt.product_service.dto.ProductPageResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.event.ProductCreatedEvent;
import com.skt.product_service.exception.BadRequestException;
import com.skt.product_service.exception.ProductCreationException;
import com.skt.product_service.exception.ProductNotFoundException;
import com.skt.product_service.model.ProductImage;
import com.skt.product_service.model.ProductStatus;
import com.skt.product_service.service.brand.ProductBrandService;
import com.skt.product_service.service.category.ProductCategoryService;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.util.ProductUtil;
import com.skt.product_service.model.Product;
import org.springframework.dao.DuplicateKeyException;
import com.skt.product_service.model.ProductCategory;
import com.skt.product_service.repository.ProductRepository;

import com.skt.product_service.service.factory.ProductFactoryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    private final ProductCategoryService productCategoryService;
    private final ProductRequestValidator productRequestValidator;

    @Value("${app.product.images.max-count:8}")
    private int maxImageCount;

    @Value("${app.product.images.max-size-bytes:5242880}")
    private long maxImageSizeBytes;


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

            // New products remain visible in the catalog by default.
            product.setStatus(ProductStatus.ACTIVE);

            productBrandService.validateActiveBrand(productRequest.brandId());
            productCategoryService.validateActiveCategory(productRequest.categoryId());
            validatePrice(productRequest.price());

            product.setBrandId(product.getBrandId());
            product.setProductCategory(product.getProductCategory());
            product.setSkuCode(productUtil.generateUniqueSkuCode(product.getProductCategory()));
            product.setProductImages(productUtil.uploadProductImages(productImages, product.getSkuCode(), product.getCategoryId()));

            Product savedProduct = saveProductWithSkuRetry(product);

            CachedProduct cachedProduct = productMapper.toCachedProduct(savedProduct);

            productQueryService.putProductInCache(
                    savedProduct.getId(),
                    cachedProduct
            );

            log.info("[CREATE] Product created id={}", savedProduct.getId());
            publishProductCreatedEvent(savedProduct);

            return productMapper.toProductResponse(
                    productMapper.toCachedProduct(savedProduct)
            );
        } catch (BadRequestException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new ProductCreationException("Error in creating product", ex);
        } finally {
            log.debug("[PERF] createProduct took {} ms",
                    System.currentTimeMillis() - start);
        }
    }

    private void publishProductCreatedEvent(Product savedProduct) {
        ProductCreatedEvent event = ProductCreatedEvent.newBuilder()
                .setProductId(savedProduct.getId())
                .setSkuCode(savedProduct.getSkuCode())
                .setInitialQuantity(0)
                .build();

        kafkaTemplate.send(
                PRODUCT_CREATED_TOPIC,
                savedProduct.getId(),
                event
        ).whenComplete((result, exception) -> {
            if (exception != null) {
                log.error(
                        "[KAFKA] Publish failed. productId={}, skuCode={}",
                        savedProduct.getId(),
                        savedProduct.getSkuCode(),
                        exception
                );
                return;
            }

            log.info(
                    "[KAFKA] Publish acknowledged. productId={}, topic={}, partition={}, offset={}",
                    savedProduct.getId(),
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset()
            );
        });
    }
    // ========================= UPDATE =========================
    @CacheEvict(value = ProductQueryService.PRODUCT_CACHE, key = "#id")
    public ProductResponse updateProduct(String id, ProductRequest productRequest, List<MultipartFile> productImages) {

        log.info("[UPDATE] Updating product id={}", id);
        log.debug("[UPDATE] Payload={}", productRequest);
        validateUpdateRequest(productRequest);
        validatePrice(productRequest.price());

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[UPDATE] Product not found id={}", id);
                    return new ProductNotFoundException(id);
                });

        String effectiveCategoryId =
                productRequest.categoryId() != null
                        ? productRequest.categoryId().trim()
                        : existingProduct.getCategoryId();

        String effectiveBrandId =
                productRequest.brandId() != null
                        ? productRequest.brandId().trim()
                        : existingProduct.getBrandId();

        BigDecimal effectivePrice = productRequest.price() != null
                ? productRequest.price()
                : existingProduct.getPrice();

        validatePrice(effectivePrice);

        productCategoryService.validateActiveCategory(effectiveCategoryId);

        productBrandService.validateActiveBrand(effectiveBrandId);

        ProductFactory factory =
                factoryRegistry.getFactory(productRequest.productCategory());
        Product updatedProduct = factory.update(existingProduct, productRequest);
        updatedProduct.setStatus(existingProduct.getStatus());
        updatedProduct.setSkuCode(existingProduct.getSkuCode());
        updatedProduct.setCreatedAt(existingProduct.getCreatedAt());

        if (productImages != null && !productImages.isEmpty()) {

            validateProductImages(productImages);

            List<ProductImage> oldImages = existingProduct.getProductImages();

            List<ProductImage> newImages =
                    productUtil.uploadProductImages(
                            productImages,
                            updatedProduct.getSkuCode(),
                            updatedProduct.getCategoryId()
                    );

            updatedProduct.setProductImages(newImages);

            Product savedProduct = productRepository.save(updatedProduct);

            productUtil.deleteProductImages(
                    oldImages,
                    existingProduct.getSkuCode(),
                    existingProduct.getCategoryId()
            );

            return productMapper.toProductResponse(
                    productMapper.toCachedProduct(savedProduct)
            );
        }

        Product savedProduct = productRepository.save(updatedProduct);

        log.info("[UPDATE] Product updated id={}", id);

        return productMapper.toProductResponse(productMapper.toCachedProduct(savedProduct));
    }

    // ========================= DELETE =========================
    @CacheEvict(
            value = ProductQueryService.PRODUCT_CACHE,
            key = "#id"
    )
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setStatus(ProductStatus.ARCHIVED);
        productRepository.save(product);

        log.info("[DELETE] Product archived id={}", id);
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

    public ProductPageResponse getProductsByCategory(
            String productCategory,
            int page,
            int size,
            String sort,
            String direction
    ) {
        String normalizedCategory =
                productPageRequestService.normalizeRequired(productCategory, "productCategory");

        ProductPageRequestService.ProductPagingOptions pagingOptions =
                productPageRequestService.resolvePagingOptions(
                        page,
                        size,
                        null,
                        null,
                        sort,
                        direction
                );

        Query query = new Query(
                Criteria.where("productCategory").is(normalizedCategory)
        );

        return productPageRequestService.fetchPage(
                query,
                pagingOptions
        );
    }

    public List<ProductResponse> getProductByBrand(String productBrand) {
        return productRepository.findAllBybrandIdIgnoreCase(productBrand)
                .stream()
                .filter(product -> product.getStatus() == ProductStatus.ACTIVE)
                .map(productMapper::toProductResponse)
                .toList();
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .filter(product -> product.getStatus() == ProductStatus.ACTIVE)
                .map(productMapper::toProductResponse)
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

        String normalizedCategoryId =
                productPageRequestService.normalizeAndValidateFilter(
                        categoryId,
                        "categoryId",
                        100
                );

        String normalizedBrand =
                productPageRequestService.normalizeAndValidateFilter(
                        brand,
                        "brand",
                        100
                );

        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (normalizedCategoryId != null) {
            criteriaList.add(Criteria.where("categoryId").is(normalizedCategoryId));
        }

        if (normalizedBrand != null) {
            criteriaList.add(Criteria.where("brandId").is(normalizedBrand));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria.gte(minPrice);
            }

            if (maxPrice != null) {
                priceCriteria.lte(maxPrice);
            }
            criteriaList.add(priceCriteria);
        }

        criteriaList.forEach(query::addCriteria);

        return productPageRequestService.fetchPage(query, pagingOptions);
    }


    private Product saveProductWithSkuRetry(Product product) {
        final int maxAttempts = 5;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return productRepository.save(product);
            } catch (DuplicateKeyException ex) {
                if (attempt == maxAttempts) {
                    throw ex;
                }

                log.warn(
                        "[SKU] Duplicate key during product save; attempt {}/{}",
                        attempt,
                        maxAttempts
                );

                product.setSkuCode(
                        productUtil.generateUniqueSkuCode(
                                product.getProductCategory()
                        )
                );
            }
        }

        throw new IllegalStateException("Unreachable SKU retry state");
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

        productPageRequestService.normalizeRequired(q, "q");
        String normalizedQ;

        ProductPageRequestService.ProductPagingOptions pagingOptions =
                productPageRequestService.resolvePagingOptions(page, size, minPrice, maxPrice, sort, direction);
        normalizedQ = q.trim();
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
            criteriaList.add(Criteria.where("brandId").is(normalizedBrand));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria.gte(minPrice);
            }

            if (maxPrice != null) {
                priceCriteria.lte(maxPrice);
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



    private void validateUpdateRequest(ProductRequest request) {
        productRequestValidator.validate(request);
    }




    private static final BigDecimal MAX_PRODUCT_PRICE =
            new BigDecimal("100000000.00");

    private void validatePrice(BigDecimal price) {
        if (price == null) {
            throw new BadRequestException("Price is required");
        }

        if (price.signum() <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }

        if (price.compareTo(MAX_PRODUCT_PRICE) > 0) {
            throw new BadRequestException(
                    "Price cannot exceed " + MAX_PRODUCT_PRICE
            );
        }

        if (price.scale() > 2) {
            throw new BadRequestException(
                    "Price can have at most 2 decimal places"
            );
        }
    }

    private void validateProductImages(
            List<MultipartFile> images
    ) {

        if (images == null || images.isEmpty()) {
            throw new BadRequestException(
                    "At least one product image is required"
            );
        }

        if (images.size() > maxImageCount) {
            throw new BadRequestException(
                    "Maximum " + maxImageCount +
                            " images are allowed"
            );
        }

        for (MultipartFile image : images) {

            if (image == null || image.isEmpty()) {
                throw new BadRequestException(
                        "Product image cannot be empty"
                );
            }

            if (image.getSize() > maxImageSizeBytes) {
                throw new BadRequestException(
                        "Each image must be smaller than "
                                + maxImageSizeBytes
                                + " bytes"
                );
            }
        }
    }

    public ProductPageResponse getProductsByBrand(
            String productBrand,
            int page,
            int size,
            String sort,
            String direction
    ) {
        String normalizedBrand =
                productPageRequestService.normalizeRequired(
                        productBrand,
                        "productBrand"
                );

        ProductPageRequestService.ProductPagingOptions pagingOptions =
                productPageRequestService.resolvePagingOptions(
                        page,
                        size,
                        null,
                        null,
                        sort,
                        direction
                );

        Query query = new Query(
                Criteria.where("brandId").is(normalizedBrand)
        );

        return productPageRequestService.fetchPage(
                query,
                pagingOptions
        );
    }

    private void validateCreateRequest(
            ProductRequest request,
            List<MultipartFile> productImages
    ) {

        productRequestValidator.validate(request);

        validateProductImages(productImages);

        validatePrice(request.price());
    }
}