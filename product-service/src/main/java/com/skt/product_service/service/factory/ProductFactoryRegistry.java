package com.skt.product_service.service.factory;

import com.skt.product_service.model.ProductCategory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ProductFactoryRegistry {

    private final Map<String, ProductFactory> factoryMap;
    private final ProductFactory baseFactory;

    // Spring Boot automatically injects all beans implementing ProductFactory here
    public ProductFactoryRegistry(List<ProductFactory> factories) {
        this.factoryMap = factories.stream()
                .collect(Collectors.toMap(
                        factory -> factory.productCategory().name().toLowerCase(Locale.ROOT),
                        Function.identity()
                ));
        this.baseFactory = Optional.ofNullable(factoryMap.get(ProductCategory.BASE.name().toLowerCase(Locale.ROOT)))
                .orElseThrow(() -> new IllegalStateException("Base product factory is not registered"));
    }

    public ProductFactory getFactory(ProductCategory productCategory) {
        if (productCategory == null) {
            throw new IllegalArgumentException("productCategory is required");
        }
        return factoryMap.getOrDefault(productCategory.name().toLowerCase(Locale.ROOT), baseFactory);
    }

    public ProductFactory getFactory(String productCategory) {
        if (productCategory == null || productCategory.isBlank()) {
            throw new IllegalArgumentException("productCategory is required");
        }
        try {
            ProductCategory parsed = ProductCategory.valueOf(productCategory.trim().toUpperCase(Locale.ROOT));
            return getFactory(parsed);
        } catch (IllegalArgumentException ignored) {
            return baseFactory;
        }
    }
}