package com.skt.product_service.service;

import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.exception.ProductNotFoundException;
import com.skt.product_service.model.Product;
import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductQueryService {

    public static final String PRODUCT_CACHE = "products";

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    /**
     * Read product from Redis first.
     *
     * Cache key:
     * products::{productId}
     */
    @Cacheable(value = PRODUCT_CACHE, key = "#id")
    public CachedProduct getCachedProductById(String id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[GET] Product not found id={}", id);
                    return new ProductNotFoundException(id);
                });

        log.info("[GET] Product fetched successfully id={}", id);

        return productMapper.toCachedProduct(product);
    }

    /**
     * Explicitly populate/update the product-by-id cache.
     *
     * Used after successful product creation.
     *
     * This method is intentionally in a separate Spring bean from
     * ProductService so @CachePut is intercepted by Spring's cache proxy.
     */
    @CachePut(value = PRODUCT_CACHE, key = "#id")
    public CachedProduct putProductInCache(
            String id,
            CachedProduct cachedProduct
    ) {

        log.debug("[CACHE PUT] Populating product cache id={}", id);

        return cachedProduct;
    }
}