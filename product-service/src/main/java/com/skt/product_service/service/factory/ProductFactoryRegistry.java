package com.skt.product_service.service.factory;

import com.skt.product_service.model.ProductType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ProductFactoryRegistry {

    private final Map<ProductType, ProductFactory> factoryMap;

    // Spring Boot automatically injects all beans implementing ProductFactory here
    public ProductFactoryRegistry(List<ProductFactory> factories) {
        this.factoryMap = factories.stream()
                .collect(Collectors.toMap(ProductFactory::getType, Function.identity()));
    }

    public ProductFactory getFactory(ProductType type) {
        return Optional.ofNullable(factoryMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No factory registered for product type: " + type));
    }
}