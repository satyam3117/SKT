package com.skt.product_service.dto;

import java.math.BigDecimal;

public record BaseProductResponse
        (
        String id,
        String name,
        String description,
        BigDecimal price,
        String productType
) implements ProductResponse {}