
package com.skt.product_service.dto;

import java.util.List;

public record ProductFormConfig(
        String productCategory,
        List<FormFieldDefinition> fields
) {
    public ProductFormConfig {
        if (productCategory == null || productCategory.isBlank()) {
            throw new IllegalArgumentException(
                    "Product category is required"
            );
        }

        fields = fields == null ? List.of() : List.copyOf(fields);
    }
}
