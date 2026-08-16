package com.skt.product_service.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "product_category")
@Getter
@Setter
public class ProductCategoryEntity {

    @Id
    private String id;

    /**
     * Display name of the category.
     * Example: "Gaming Laptops"
     */
    @NotBlank(message = "Category name cannot be blank")
    @Field("name")
    private String name;

    /**
     * URL-friendly unique identifier.
     * Example: "gaming-laptops"
     */
    @NotBlank(message = "Category slug cannot be blank")
    @Indexed(unique = true)
    @Field("slug")
    private String slug;

    /**
     * Parent category ID.
     *
     * null  -> root category
     * e.g. "computers" -> child of Computers
     */
    @Field("parent_id")
    private String parentId;

    /**
     * Hierarchy level.
     *
     * 0 -> Electronics
     * 1 -> Computers
     * 2 -> Laptops
     * 3 -> Gaming Laptops
     */
    @NotNull(message = "Category level cannot be null")
    @Field("level")
    private Integer level;

    /**
     * Whether this category can currently be used.
     */
    @Field("active")
    private Boolean active = true;

    /**
     * Controls category ordering in UI.
     */
    @Field("sort_order")
    private Integer sortOrder = 0;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    public ProductCategoryEntity() {
    }

    public ProductCategoryEntity(
            String name,
            String slug,
            String parentId,
            Integer level
    ) {
        this.name = name;
        this.slug = slug;
        this.parentId = parentId;
        this.level = level;
        this.active = true;
        this.sortOrder = 0;
    }
}