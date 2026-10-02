package com.skt.product_service.dto.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductBrandUpdateRequest {

    @NotBlank(message = "Brand name cannot be blank")
    @Size(max = 150, message = "Brand name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Brand slug cannot be blank")
    @Size(max = 150, message = "Brand slug cannot exceed 150 characters")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Brand slug must contain only lowercase letters, numbers and hyphens"
    )
    private String slug;

    private Boolean active;

    @PositiveOrZero(message = "Sort order must be greater than or equal to 0")
    private Integer sortOrder;

    public ProductBrandUpdateRequest() {
    }
}