package com.skt.product_service.dto;

import java.math.BigDecimal;

public record LaptopResponse(
        String id,
        String name,
        String description,
        BigDecimal price,
        String productType,
        String processor,
        String ramGb,
        String storageGb,
        String screenSize,
        String graphics

) implements ProductResponse {}