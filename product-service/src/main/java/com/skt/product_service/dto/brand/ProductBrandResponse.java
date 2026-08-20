package com.skt.product_service.dto.brand;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ProductBrandResponse {

    private String id;

    private String name;

    private String slug;

    private Boolean active;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;
}