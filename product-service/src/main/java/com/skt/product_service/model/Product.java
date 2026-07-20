package com.skt.product_service.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@NoArgsConstructor
@SuperBuilder // Required for inheritance builders
@Data
@TypeAlias("product")
@Document(collection = "product")
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "productType"
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
    private String brandName;
    private String productType; // Helps easily identify the type programmatically
}