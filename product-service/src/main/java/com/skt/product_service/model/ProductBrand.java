package com.skt.product_service.model;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "product_brand")
@Getter
@Setter
public class ProductBrand {

    @Id
    private String id;

    @Field("brand_name")
    @NotNull(message = "Brand name cannot be null")
    private String brandName;

    @CreatedDate
    @Field("created_at")
    @NotNull // Application-level check
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    @NotNull // Application-level check
    private Instant updatedAt;
}