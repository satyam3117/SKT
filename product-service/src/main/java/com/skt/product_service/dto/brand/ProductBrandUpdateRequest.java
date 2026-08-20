package com.skt.product_service.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductBrandUpdateRequest {

    @NotBlank(message = "Brand name cannot be blank")
    private String name;

    @NotBlank(message = "Brand slug cannot be blank")
    private String slug;

    private Boolean active;

    private Integer sortOrder;

    public ProductBrandUpdateRequest() {
    }
}