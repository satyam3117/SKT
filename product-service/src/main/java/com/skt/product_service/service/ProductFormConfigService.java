package com.skt.product_service.service;

import com.skt.product_service.dto.FormFieldDefinition;
import com.skt.product_service.dto.FormFieldOptionDefinition;
import com.skt.product_service.dto.ProductFormConfig;
import com.skt.product_service.model.ProductCategory;
import com.skt.product_service.model.ProductCategoryEntity;
import com.skt.product_service.repository.ProductCategoryRepository;
import com.skt.product_service.service.category.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductFormConfigService {

    private static final List<FormFieldDefinition> COMMON_FIELDS = List.of(
            new FormFieldDefinition("name", "Name", "text", true),
            new FormFieldDefinition("description", "Description", "textarea", true),
            new FormFieldDefinition("price", "Price", "number", true),
            new FormFieldDefinition("brandName", "Brand", "text", true)
    );

    private static final Map<ProductCategory, List<FormFieldDefinition>> TYPE_FIELDS = Map.of(
            ProductCategory.LAPTOP, List.of(
                    new FormFieldDefinition("processor", "Processor", "text", true),
                    new FormFieldDefinition("ramGb", "RAM (GB)", "number", true),
                    new FormFieldDefinition("storageGb", "Storage (GB)", "number", true),
                    new FormFieldDefinition("screenSize", "Screen Size", "number", true),
                    new FormFieldDefinition("graphics", "Graphics", "text", true)
            ),
            ProductCategory.COMPUTER, List.of(
                    new FormFieldDefinition("processor", "Processor", "text", true),
                    new FormFieldDefinition("ramGb", "RAM (GB)", "number", true),
                    new FormFieldDefinition("storageGb", "Storage (GB)", "number", true),
                    new FormFieldDefinition("screenSize", "Screen Size", "number", true),
                    new FormFieldDefinition("graphics", "Graphics", "text", true),
                    new FormFieldDefinition("mouse", "Mouse", "text", true),
                    new FormFieldDefinition("keyboard", "Keyboard", "text", true)
            )
    );

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductCategoryService productCategoryService;

    public ProductFormConfig getProductFormConfig(String productCategory) {
        ProductCategory parsedCategory = ProductCategory.from(productCategory);
        List<FormFieldDefinition> fields = new ArrayList<>(COMMON_FIELDS);
        fields.add(new FormFieldDefinition(
                "categoryId",
                "Category",
                "select",
                true,
                getCategoryOptions()
        ));
        fields.addAll(TYPE_FIELDS.getOrDefault(parsedCategory, List.of()));
        return new ProductFormConfig(
                parsedCategory.name().toLowerCase(java.util.Locale.ROOT),
                fields
        );
    }

    private List<FormFieldOptionDefinition> getCategoryOptions() {
        List<ProductCategoryEntity> activeCategories =
                productCategoryRepository
                        .findByActiveTrueOrderByLevelAscSortOrderAscNameAsc();

        Set<String> parentIds = activeCategories.stream()
                .map(ProductCategoryEntity::getParentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return activeCategories.stream()
                .filter(category -> !parentIds.contains(category.getId()))
                .map(this::toCategoryOption)
                .toList();
    }

    private FormFieldOptionDefinition toCategoryOption(
            ProductCategoryEntity category
    ) {
        List<String> hierarchy =
                productCategoryService.getCategoryHierarchyNames(category.getId());

        return new FormFieldOptionDefinition(
                category.getId(),
                String.join(" > ", hierarchy),
                hierarchy
        );
    }
}
