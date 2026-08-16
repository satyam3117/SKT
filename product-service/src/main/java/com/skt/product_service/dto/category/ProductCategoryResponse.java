package com.skt.product_service.dto.category;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ProductCategoryResponse {

    private String id;

    private String name;

    private String slug;

    private String parentId;

    private Integer level;

    private Boolean active;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;
}

//{
//  "id": "gaming-laptops-id",
//  "name": "Gaming Laptops",
//  "slug": "gaming-laptops",
//  "parentId": "laptops-id",
//  "level": 3,
//  "active": true,
//  "sortOrder": 0,
//  "createdAt": "2026-08-16T10:00:00Z",
//  "updatedAt": "2026-08-16T10:00:00Z"
//}