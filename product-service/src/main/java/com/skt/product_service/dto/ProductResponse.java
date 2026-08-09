package com.skt.product_service.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public sealed interface ProductResponse
        permits BaseProductResponse, LaptopResponse {

    String id();
    String skuCode();
    Instant createdAt();
    Instant updatedAt();
    String name();
    String description();
    BigDecimal price();
    String productCategory();
    String categoryId();
    List<String> categoryPath();
}