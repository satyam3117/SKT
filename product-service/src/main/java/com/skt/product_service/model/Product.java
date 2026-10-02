package com.skt.product_service.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@NoArgsConstructor
@SuperBuilder // Required for inheritance builders
@Data
@TypeAlias("product")
@Document(collection = "product")
@CompoundIndexes({
        @CompoundIndex(
                name = "category_created_idx",
                def = "{'categoryId': 1, 'createdAt': -1}"
        ),
        @CompoundIndex(
                name = "brand_created_idx",
                def = "{'brandId': 1, 'createdAt': -1}"
        ),
        @CompoundIndex(
                name = "product_category_created_idx",
                def = "{'productCategory': 1, 'createdAt': -1}"
        )
})
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "productCategory"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Laptop.class, name = "laptop"),
        @JsonSubTypes.Type(value = Computer.class, name = "computer")
})
public class Product {

    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;

    @Indexed(unique = true)
    private String skuCode;
    private String brandId;
    private String productCategory; // Helps easily identify the type programmatically
    
    // Category support
    @NotNull(message = "Category ID is required")
    private String categoryId; // Leaf category ID for DB relations and filtering (e.g., "business-laptop-id")

    private List<ProductImage> productImages; // List of product images
    
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}