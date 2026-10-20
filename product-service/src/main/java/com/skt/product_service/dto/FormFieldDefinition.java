
package com.skt.product_service.dto;

import java.util.List;

public record FormFieldDefinition(
        String name,
        String label,
        String type,
        boolean required,
        List<FormFieldOptionDefinition> options,
        String placeholder,
        String helpText,
        String validationPattern,
        String min,
        String max
) {

    public FormFieldDefinition {
        options = options == null ? List.of() : List.copyOf(options);
    }

    public FormFieldDefinition(
            String name,
            String label,
            String type,
            boolean required
    ) {
        this(
                name, label, type, required,
                List.of(), null, null, null, null, null
        );
    }

    public FormFieldDefinition(
            String name,
            String label,
            String type,
            boolean required,
            List<FormFieldOptionDefinition> options
    ) {
        this(
                name, label, type, required,
                options, null, null, null, null, null
        );
    }

    public static FormFieldDefinition text(
            String name,
            String label,
            boolean required,
            String placeholder
    ) {
        return new FormFieldDefinition(
                name, label, "text", required,
                List.of(), placeholder, null, null, null, null
        );
    }

    public static FormFieldDefinition number(
            String name,
            String label,
            boolean required,
            String min,
            String max
    ) {
        return new FormFieldDefinition(
                name, label, "number", required,
                List.of(), null, null, null, min, max
        );
    }

    public static FormFieldDefinition select(
            String name,
            String label,
            boolean required,
            List<FormFieldOptionDefinition> options
    ) {
        return new FormFieldDefinition(
                name, label, "select", required,
                options, null, null, null, null, null
        );
    }
}
