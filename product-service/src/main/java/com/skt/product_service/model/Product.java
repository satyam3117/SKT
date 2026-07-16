package com.skt.product_service.model;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(value = "product")
@NoArgsConstructor
@SuperBuilder // Required for inheritance builders
@Data
@TypeAlias("product")
public class Product {

    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private ProductType productType; // Helps easily identify the type programmatically
}