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
public class ProductTypeEntity {

    @Id
    private String id;

    @Field("product_type")
    @NotBlank(message = "Product type name cannot be blank")
    private String productType;

    @CreatedDate
    @Field("created_at")
    @NotNull
    private Instant createdAt;

    // Standard Boilerplate (Boots up default constructor and getters/setters)
    public ProductTypeEntity() {}

    public ProductTypeEntity(String productType) {
        this.productType = productType;
        // Spring Auditing will populate createdAt automatically,
        // but setting it here provides a safe fallback for manual creation.
        this.createdAt = Instant.now();
    }
}