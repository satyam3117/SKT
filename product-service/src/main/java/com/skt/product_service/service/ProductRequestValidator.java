package com.skt.product_service.service;

import com.skt.product_service.dto.FormFieldDefinition;
import com.skt.product_service.dto.ProductFormConfig;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.exception.BadRequestException;
import com.skt.product_service.model.ProductCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProductRequestValidator {

    private final ProductFormConfigService formConfigService;

    public void validate(ProductRequest request) {

        if (request == null) {
            throw new BadRequestException("Product request is required");
        }

        ProductCategory category = request.productCategory();

        if (category == null) {
            throw new BadRequestException(
                    "productCategory is required"
            );
        }

        ProductFormConfig config =
                formConfigService.getProductFormConfig(
                        category.name().toLowerCase()
                );

        Map<String, String> values = toValueMap(request);

        List<String> missingFields = config.fields()
                .stream()
                .filter(FormFieldDefinition::required)
                .filter(field -> {
                    String value = values.get(field.name());
                    return value == null || value.isBlank();
                })
                .map(FormFieldDefinition::name)
                .toList();

        if (!missingFields.isEmpty()) {
            throw new BadRequestException(
                    "Missing required fields: "
                            + String.join(", ", missingFields)
            );
        }

        validateNumericField(
                values,
                "price",
                true
        );

        validateNumericField(
                values,
                "ramGb",
                false
        );

        validateNumericField(
                values,
                "storageGb",
                false
        );

        validateNumericField(
                values,
                "screenSize",
                false
        );
    }

    private Map<String, String> toValueMap(ProductRequest request) {

        Map<String, String> values = new HashMap<>();

        values.put("name", request.name());
        values.put("description", request.description());
        values.put(
                "price",
                request.price() != null
                        ? request.price().toPlainString()
                        : null
        );

        values.put(
                "productCategory",
                request.productCategory() != null
                        ? request.productCategory().name()
                        : null
        );

        values.put("brandId", request.brandId());
        values.put("categoryId", request.categoryId());

        values.put("processor", request.processor());
        values.put("ramGb", request.ramGb());
        values.put("storageGb", request.storageGb());
        values.put("screenSize", request.screenSize());
        values.put("graphics", request.graphics());

        values.put("mouse", request.mouse());
        values.put("keyboard", request.keyboard());

        return values;
    }

    private void validateNumericField(
            Map<String, String> values,
            String field,
            boolean required
    ) {

        String value = values.get(field);

        if (value == null || value.isBlank()) {
            if (required) {
                throw new BadRequestException(
                        field + " must be provided"
                );
            }
            return;
        }

        try {
            double number = Double.parseDouble(value);

            if (!Double.isFinite(number) || number < 0) {
                throw new BadRequestException(
                        field + " must be a non-negative number"
                );
            }

        } catch (NumberFormatException ex) {
            throw new BadRequestException(
                    field + " must be a valid number"
            );
        }
    }
}