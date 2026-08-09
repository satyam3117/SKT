package com.skt.product_service.service;

import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.exception.ProductNotFoundException;
import com.skt.product_service.model.Product;
import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductQueryService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Cacheable(value = "products_v4", key = "#id")
    public CachedProduct getCachedProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[GET] Product not found id={}", id);
                    return new ProductNotFoundException(id);
                });

        log.info("[GET] Product fetched successfully id={}", id);
        return productMapper.toCachedProduct(product);
    }
}
