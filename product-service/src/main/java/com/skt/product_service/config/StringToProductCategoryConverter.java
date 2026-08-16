package com.skt.product_service.config;

import com.skt.product_service.model.ProductCategory;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToProductCategoryConverter implements Converter<String, ProductCategory> {

    @Override
    public ProductCategory convert(String source) {
        return ProductCategory.from(source);
    }
}
