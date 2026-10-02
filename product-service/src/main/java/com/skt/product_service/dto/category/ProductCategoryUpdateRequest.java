package com.skt.product_service.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCategoryUpdateRequest {

    @NotBlank(message = "Category name cannot be blank")
    @Size(max = 150, message = "Category name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Category slug cannot be blank")
    @Size(max = 150, message = "Category slug cannot exceed 150 characters")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Invalid slug. Use lowercase letters, numbers and hyphens only. Example: gaming-laptops"
    )
    private String slug;

    /**
     * null = move category to root
     * non-null = move category under another category
     */
    private String parentId;

    private Boolean active;

    @PositiveOrZero(message = "Sort order must be greater than or equal to 0")
    private Integer sortOrder;

    public ProductCategoryUpdateRequest() {
    }
}