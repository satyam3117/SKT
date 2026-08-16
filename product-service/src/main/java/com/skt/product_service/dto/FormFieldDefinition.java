package com.skt.product_service.dto;

import java.util.List;

public record FormFieldDefinition(
        String name,
        String label,
        String type,
        boolean required,
        List<FormFieldOptionDefinition> options
) {
    public FormFieldDefinition(String name, String label, String type, boolean required) {
        this(name, label, type, required, List.of());
    }
}
