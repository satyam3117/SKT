package com.skt.product_service.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductBrandCreateRequest {

    @NotBlank(message = "Brand name cannot be blank")
    private String name;

    @NotBlank(message = "Brand slug cannot be blank")
    private String slug;

    /**
     * Optional UI ordering.
     */
    private Integer sortOrder;

    public ProductBrandCreateRequest() {
    }
}