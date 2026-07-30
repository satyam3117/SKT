package com.skt.product_service.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.math.BigDecimal;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "productType"    // Jackson will automatically insert "type": "laptop" or "type": "base"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = LaptopResponse.class, name = "laptop"),
})
public sealed interface ProductResponse
        permits BaseProductResponse, LaptopResponse {

    String id();
    String name();
    String description();
    BigDecimal price();
    String productType();
}