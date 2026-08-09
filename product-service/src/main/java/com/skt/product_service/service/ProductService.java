package com.skt.product_service.service;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.event.ProductCreatedEvent;
import com.skt.product_service.exception.ProductNotFoundException;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.util.ProductUtil;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductBrand;
import com.skt.product_service.model.ProductCategoryEntity;
import com.skt.product_service.repository.ProductBrandRepository;
import com.skt.product_service.repository.ProductRepository;
import com.skt.product_service.repository.ProductCategoryRepository;

import com.skt.product_service.service.factory.ProductFactoryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductBrandRepository productBrandRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductFactoryRegistry factoryRegistry;
    private final ProductUtil productUtil;
    private final ProductMapper productMapper;
    private final ProductQueryService productQueryService;
    @Autowired
    private KafkaTemplate<String, ProductCreatedEvent> kafkaTemplate;
    public static final String PRODUCT_CREATED_TOPIC = "product-created-topic";

    // ========================= GET =========================
    public ProductResponse getProductById(String id) {
        CachedProduct cachedProduct = productQueryService.getCachedProductById(id);
        return productMapper.toProductResponse(cachedProduct);
    }

    // ========================= CREATE =========================
    public ProductResponse createProduct(ProductRequest productRequest) {

        long start = System.currentTimeMillis();
        validateCreateRequest(productRequest);

        log.info("[CREATE] Creating product name={}, type={}",
                productRequest.name(), productRequest.productCategory());

        log.debug("[CREATE] Payload={}", productRequest);

        Product product = createProductFromFactory(productRequest);

        ProductBrand brand = getOrCreateBrand(product.getBrandName());
        ProductCategoryEntity productCategory = getOrCreateProductCategory(product.getProductCategory());

        product.setBrandName(brand.getBrandName());
        product.setProductCategory(productCategory.getProductCategory());
        product.setSkuCode(productUtil.generateUniqueSkuCode(product.getProductCategory()));

        Product savedProduct = saveProduct(product);

        log.info("[CREATE] Product created id={}", savedProduct.getId());

        // ✅ 🔥 PUBLISH EVENT HERE
        publishProductCreatedEvent(savedProduct);

        log.debug("[PERF] createProduct took {} ms",
                System.currentTimeMillis() - start);

        return productMapper.toProductResponse(
                productMapper.toCachedProduct(savedProduct)
        );
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
    public ProductResponse updateProduct(String id, ProductRequest productRequest) {

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

    private ProductBrand getOrCreateBrand(String brandName) {

        return productBrandRepository
                .findByBrandName(brandName)
                .orElseGet(() -> {
                    log.debug("[BRAND] Creating new brand name={}", brandName);

                    ProductBrand brand = new ProductBrand();
                    brand.setBrandName(brandName);

                    ProductBrand saved = productBrandRepository.save(brand);

                    log.info("[BRAND] Created brand name={} id={}",
                            brandName, saved.getId());

                    return saved;
                });
    }

    private ProductCategoryEntity getOrCreateProductCategory(String productCategory) {

        return productCategoryRepository
                .findByProductCategory(productCategory)
                .orElseGet(() -> {
                    log.debug("[TYPE] Creating new Product Category={}", productCategory);

                    ProductCategoryEntity type = new ProductCategoryEntity();
                    type.setProductCategory(productCategory);

                    ProductCategoryEntity saved = productCategoryRepository.save(type);

                    log.info("[TYPE] Created Product Category={} id={}",
                            productCategory, saved.getId());

                    return saved;
                });
    }

    public List<BaseProductResponse> getProductsByCategory(String productCategory) {
        return productRepository.findAllByProductCategoryIgnoreCase(productCategory).stream()
                .map(productMapper::toBaseResponse)
                .toList();

    }

    public List<BaseProductResponse> getProductByBrand(String productBrand) {
        return productRepository.findAllByBrandNameIgnoreCase(productBrand).stream()
                .map(productMapper::toBaseResponse)
                .toList();
    }

    public List<BaseProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toBaseResponse)
                .toList();
    }


    private Product createProductFromFactory(ProductRequest request) {

        log.debug("[FACTORY] Resolving factory for Product Category={}", request.productCategory());

        ProductFactory factory = factoryRegistry.getFactory(request.productCategory());

        return factory.create(request);
    }

    private void validateCreateRequest(ProductRequest request) {
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
    }

    private void validateUpdateRequest(ProductRequest request) {
        if (request.productCategory() == null) {
            throw new IllegalArgumentException("productCategory is required");
        }
    }

}