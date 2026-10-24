
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
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductFormConfigService {

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductCategoryService productCategoryService;

    private static final List<FormFieldDefinition> COMMON_FIELDS = List.of(
            FormFieldDefinition.text(
                    "name", "Product Name", true, "Enter product name"
            ),
            new FormFieldDefinition(
                    "description", "Description", "textarea", true
            ),
            FormFieldDefinition.number(
                    "price", "Price", true, "0.01", null
            ),
            FormFieldDefinition.text(
                    "brandId", "Brand ID", true, "Select a brand"
            ),
            FormFieldDefinition.select(
                    "categoryId", "Category", true, List.of()
            )
    );

    private static final Map<ProductCategory, List<FormFieldDefinition>>
            TYPE_FIELDS = createTypeFields();

    private static Map<ProductCategory, List<FormFieldDefinition>>
    createTypeFields() {

        Map<ProductCategory, List<FormFieldDefinition>> fields =
                new EnumMap<>(ProductCategory.class);

        List<FormFieldDefinition> computerSpecs = List.of(
                FormFieldDefinition.text(
                        "processor", "Processor", true, "e.g. Intel Core i7"
                ),
                FormFieldDefinition.number(
                        "ramGb", "RAM (GB)", true, "1", null
                ),
                FormFieldDefinition.number(
                        "storageGb", "Storage (GB)", true, "1", null
                ),
                FormFieldDefinition.text(
                        "graphics", "Graphics", false, "GPU model"
                )
        );

        fields.put(ProductCategory.LAPTOP, List.of(
                computerSpecs.get(0),
                computerSpecs.get(1),
                computerSpecs.get(2),
                FormFieldDefinition.number(
                        "screenSize", "Screen Size (inches)",
                        true, "1", null
                ),
                computerSpecs.get(3)
        ));

        fields.put(ProductCategory.COMPUTER, List.of(
                computerSpecs.get(0),
                computerSpecs.get(1),
                computerSpecs.get(2),
                computerSpecs.get(3),
                FormFieldDefinition.text(
                        "mouse", "Mouse", false, "Included mouse"
                ),
                FormFieldDefinition.text(
                        "keyboard", "Keyboard", false, "Included keyboard"
                )
        ));

        fields.put(ProductCategory.DESKTOP_PREBUILT, computerSpecs);
        fields.put(ProductCategory.WORKSTATION, computerSpecs);
        fields.put(ProductCategory.CUSTOM_PC_BUILD, computerSpecs);

        fields.put(ProductCategory.CPU, List.of(
                FormFieldDefinition.text(
                        "socket", "Socket", true, "e.g. AM5"
                ),
                FormFieldDefinition.text(
                        "cores", "Core Count", false, "e.g. 8"
                )
        ));

        fields.put(ProductCategory.GPU, List.of(
                FormFieldDefinition.text(
                        "memory", "VRAM", false, "e.g. 16 GB"
                ),
                FormFieldDefinition.text(
                        "interface", "Interface", false, "e.g. PCIe"
                )
        ));

        fields.put(ProductCategory.RAM, List.of(
                FormFieldDefinition.text(
                        "memoryType", "Memory Type", true, "e.g. DDR5"
                ),
                FormFieldDefinition.number(
                        "capacityGb", "Capacity (GB)", true, "1", null
                )
        ));

        fields.put(ProductCategory.MONITOR, List.of(
                FormFieldDefinition.text(
                        "resolution", "Resolution", false, "e.g. 2560x1440"
                ),
                FormFieldDefinition.number(
                        "refreshRateHz", "Refresh Rate (Hz)",
                        false, "1", null
                )
        ));

        return Map.copyOf(fields);
    }

    public ProductFormConfig getProductFormConfig(String category) {

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException(
                    "Product category is required"
            );
        }

        ProductCategory productCategory;

        try {
            productCategory = ProductCategory.valueOf(
                    category.trim().toUpperCase(Locale.ROOT)
            );
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Unsupported product category: " + category
            );
        }

        List<FormFieldDefinition> fields =
                new ArrayList<>(COMMON_FIELDS);

        List<FormFieldOptionDefinition> categoryOptions =
                getCategoryOptions();

        // Replace the empty category options with real MongoDB categories.
        fields.set(
                fields.size() - 1,
                FormFieldDefinition.select(
                        "categoryId",
                        "Category",
                        true,
                        categoryOptions
                )
        );

        fields.addAll(
                TYPE_FIELDS.getOrDefault(productCategory, List.of())
        );

        return new ProductFormConfig(
                productCategory.name().toLowerCase(Locale.ROOT),
                fields
        );
    }

    private List<FormFieldOptionDefinition> getCategoryOptions() {

        List<ProductCategoryEntity> activeCategories =
                productCategoryRepository
                        .findByActiveTrueOrderByLevelAscSortOrderAscNameAsc();

        // Categories that have children are not selectable leaves.
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
                productCategoryService.getCategoryHierarchyNames(
                        category.getId()
                );

        return new FormFieldOptionDefinition(
                category.getId(),
                String.join(" > ", hierarchy),
                hierarchy
        );
    }
}
