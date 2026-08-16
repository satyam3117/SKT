package com.skt.product_service.dto;

import java.util.List;

public record FormFieldOptionDefinition(
        String value,
        String label,
        List<String> categoryPath
) {
}
