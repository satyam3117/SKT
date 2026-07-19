package com.skt.product_service.dto;

import com.skt.product_service.model.ProductType;

import java.math.BigDecimal;

public record ProductRequest(
        String name,
        String description,
        BigDecimal price,
        String productType,
        String brandName,


        // Laptop specific fields (Optional depending on productType)
        String processor,
        String ramGb,
        String storageGb,
        String graphics,

        String mouse,
        String keyboard


) {}
