package com.skt.product_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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
        String graphics

) implements ProductResponse {

    @JsonProperty("productType")
    public String productType() {
        return "laptop";
    }
}