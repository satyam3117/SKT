package com.skt.product_service.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Document(collection = "product_type")
@Getter
@Setter
public class ProductCategoryEntity {

    @Id
    private String id;

    @Field("product_type")
    @NotBlank(message = "Product Category name cannot be blank")
    private String productCategory;

    @CreatedDate
    @Field("created_at")
    @NotNull
    private Instant createdAt;

    // Standard Boilerplate (Boots up default constructor and getters/setters)
    public ProductCategoryEntity() {}

    public ProductCategoryEntity(String productCategory) {
        this.productCategory = productCategory;
        // Spring Auditing will populate createdAt automatically,
        // but setting it here provides a safe fallback for manual creation.
        this.createdAt = Instant.now();
    }
}