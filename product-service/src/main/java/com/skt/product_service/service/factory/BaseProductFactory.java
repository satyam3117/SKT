package com.skt.product_service.service.factory;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductCategory;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class BaseProductFactory implements ProductFactory {

    @Override
    public Product create(ProductRequest request) {
        return Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .productCategory(request.productCategory().name().toLowerCase(Locale.ROOT))
                .brandId(request.brandId() != null ? request.brandId() : StringUtils.EMPTY)
                .categoryId(request.categoryId())
                .build();
    }

    @Override
    public Product update(Product existingProduct, ProductRequest request) {
        return Product.builder()
                .id(existingProduct.getId())
                .name(request.name() != null ? request.name() : existingProduct.getName())
                .description(request.description() != null ? request.description() : existingProduct.getDescription())
                .price(request.price() != null ? request.price() : existingProduct.getPrice())
                .productCategory(existingProduct.getProductCategory())
                .brandId(request.brandId() != null ? request.brandId() : existingProduct.getBrandId())
                .categoryId(request.categoryId() != null ? request.categoryId() : existingProduct.getCategoryId())
                .build();
    }

    @Override
    public ProductCategory productCategory() {
        return ProductCategory.BASE;
    }
}
