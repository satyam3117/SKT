package com.skt.product_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skt.product_service.model.ProductType;

import java.math.BigDecimal;

public record LaptopResponse(

        String id,
        String name,
        String description,
        BigDecimal price,
        String processor,
        String ramGb,
        String storageGb,
        String screenSize,
        String graphics,
        String brandName

) implements ProductResponse {

    @Override
    public String productType() {
        return ProductType.LAPTOP.name().toLowerCase();
    }
}