package com.skt.product_service.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCategoryCreateRequest {

    @NotBlank(message = "Category name cannot be blank")
    private String name;

    @NotBlank(message = "Category slug cannot be blank")
    private String slug;

    /**
     * null = root category
     * non-null = child category
     */
    private String parentId;

    /**
     * Optional UI ordering.
     */
    private Integer sortOrder;

    public ProductCategoryCreateRequest() {
    }
}