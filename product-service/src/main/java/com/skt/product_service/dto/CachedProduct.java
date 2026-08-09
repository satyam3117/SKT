package com.skt.product_service.dto;

public record CachedProduct(
        String productCategory, // "laptop" or "base"
        LaptopResponse laptop,
        BaseProductResponse base
) implements java.io.Serializable {}
