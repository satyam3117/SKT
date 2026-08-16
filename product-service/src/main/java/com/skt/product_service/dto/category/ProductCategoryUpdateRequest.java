package com.skt.product_service.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCategoryUpdateRequest {

    @NotBlank(message = "Category name cannot be blank")
    private String name;

    @NotBlank(message = "Category slug cannot be blank")
    private String slug;

    /**
     * null = move category to root
     * non-null = move category under another category
     */
    private String parentId;

    private Boolean active;

    private Integer sortOrder;

    public ProductCategoryUpdateRequest() {
    }
}