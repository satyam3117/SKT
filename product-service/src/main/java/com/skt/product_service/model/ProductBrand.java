package com.skt.product_service.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "product_brand")
@Getter
@Setter
public class ProductBrand {

    @Id
    private String id;

    /**
     * Display name of the brand.
     *
     * Example:
     * Dell
     * HP
     * Lenovo
     * Apple
     */
    @NotBlank(message = "Brand name cannot be blank")
    @Field("name")
    private String name;

    /**
     * URL-friendly unique identifier.
     *
     * Example:
     * dell
     * hp
     * lenovo
     * apple
     */
    @NotBlank(message = "Brand slug cannot be blank")
    @Indexed(unique = true)
    @Field("slug")
    private String slug;

    /**
     * Whether this brand can currently be assigned
     * to new products.
     */
    @Field("active")
    private Boolean active = true;

    /**
     * Controls ordering in UI.
     */
    @Field("sort_order")
    private Integer sortOrder = 0;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    public ProductBrand() {
    }

    public ProductBrand(
            String name,
            String slug
    ) {
        this.name = name;
        this.slug = slug;
        this.active = true;
        this.sortOrder = 0;
    }
}