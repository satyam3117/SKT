package com.skt.product_service.dto;

public record CachedProduct(
        String productCategory,
        ProductResponse product
) {
}