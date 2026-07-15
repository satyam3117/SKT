package com.skt.product_service.service.factory;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductType;

public interface ProductFactory {

    // Creates a brand new product
    Product create(ProductRequest request);

    // Updates an existing product (maintains ID and subclass-specific fallbacks)
    Product update(Product existingProduct, ProductRequest request);

    // Tells the registry which product type this factory supports
    ProductType getType();
}