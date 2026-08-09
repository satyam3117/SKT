package com.skt.product_service.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BaseProductResponse(
        String id,
        String skuCode,
        Instant createdAt,
        Instant updatedAt,
        String name,
        String description,
        BigDecimal price,
        String productCategory,
        String brandName,
        String categoryId,
        List<String> categoryPath
) implements ProductResponse {}