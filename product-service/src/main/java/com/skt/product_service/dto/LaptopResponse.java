package com.skt.product_service.dto;

import com.skt.product_service.model.ProductImage;
import com.skt.product_service.model.ProductCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record LaptopResponse(

        String id,
        String skuCode,
        Instant createdAt,
        Instant updatedAt,
        String name,
        String description,
        BigDecimal price,
        String processor,
        String ramGb,
        String storageGb,
        String screenSize,
        String graphics,
        String brandName,
        String categoryId,
        List<ProductImage> productImages

) implements ProductResponse {

    @Override
    public String productCategory() {
        return ProductCategory.LAPTOP.name().toLowerCase();
    }
}