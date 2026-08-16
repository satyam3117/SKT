package com.skt.product_service.dto;

import com.skt.product_service.model.ProductCategory;
import com.skt.product_service.model.ProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        String name,
        String description,
        @DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than 0")
        BigDecimal price,
        @NotNull(message = "productCategory is required")
        ProductCategory productCategory,
        String brandName,

        @NotBlank(message = "categoryId is required")
        String categoryId,

        // Laptop / Computer specific fields (Optional depending on productCategory)
        String processor,
        String ramGb,
        String storageGb,
        String graphics,
        String screenSize,

        String mouse,
        String keyboard

) {}
