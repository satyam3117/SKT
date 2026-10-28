package com.skt.product_service.dto;

import com.skt.product_service.model.ProductImage;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ProductResponse(
        String id,
        String skuCode,
        Instant createdAt,
        Instant updatedAt,

        String name,
        String description,
        BigDecimal price,
        Integer warrantyInMonth,

        String productCategory,

        String brandId,
        String categoryId,

        String status,

        List<ProductImage> productImages,

        Map<String, Object> attributes
) {}