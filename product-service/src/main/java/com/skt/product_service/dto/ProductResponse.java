package com.skt.product_service.dto;

import com.skt.product_service.model.Product;

import java.math.BigDecimal;

public record ProductResponse(String id, String name, String description, BigDecimal price) {

    public static ProductResponse fromProduct(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice()
        );
    }
}