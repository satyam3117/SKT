package com.skt.product_service.dto;

import com.skt.product_service.model.ProductCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank
        @Size(max = 50)
        String name,

        @NotBlank
        @Size(max = 300)
        String description,

        @NotNull
        @DecimalMin(
                value = "0.0",
                inclusive = false,
                message = "Price must be greater than 0"
        )
        @Digits(integer = 10, fraction = 2)
        BigDecimal price,

        @Min(value = 0, message = "Warranty months cannot be negative")
        Integer warrantyInMonth,

        @NotNull(message = "productCategory is required")
        ProductCategory productCategory,

        @NotBlank(message = "brandId is required")
        String brandId,

        @NotBlank(message = "categoryId is required")
        String categoryId,

        // Laptop / Computer-specific fields
        String processor,
        String ramGb,
        String storageGb,
        String graphics,
        String screenSize,
        String mouse,
        String keyboard
) {}