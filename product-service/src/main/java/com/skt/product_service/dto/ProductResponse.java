package com.skt.product_service.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "productType",       // Jackson will automatically insert "type": "laptop" or "type": "base"
        visible = false           // Setting this to true allows you to keep the type field in the JSON seamlessly
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = LaptopResponse.class, name = "laptop"),
        @JsonSubTypes.Type(value = BaseProductResponse.class, name = "base")
})
public sealed interface ProductResponse
        permits BaseProductResponse, LaptopResponse {}