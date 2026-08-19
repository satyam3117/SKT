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
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@NoArgsConstructor
@SuperBuilder // Required for inheritance builders
@Data
@TypeAlias("product")
@Document(collection = "product")
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