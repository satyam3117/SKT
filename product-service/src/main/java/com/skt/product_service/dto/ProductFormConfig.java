package com.skt.product_service.dto;

import java.util.List;

public record ProductFormConfig(
        String productCategory,
        List<FormFieldDefinition> fields
) {}
