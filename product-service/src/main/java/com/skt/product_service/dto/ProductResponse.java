package com.skt.product_service.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "typeInfo"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = LaptopResponse.class, name = "laptop"),
        @JsonSubTypes.Type(value = BaseProductResponse.class, name = "base")
})
public sealed interface ProductResponse
        permits BaseProductResponse, LaptopResponse {}