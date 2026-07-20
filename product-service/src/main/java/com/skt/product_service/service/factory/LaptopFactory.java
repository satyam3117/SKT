package com.skt.product_service.service.factory;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.model.Laptop;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductType;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class LaptopFactory implements ProductFactory {

    @Override
    public Product create(ProductRequest request) {
        return Laptop.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .productType(request.productType())
                .processor(request.processor())
                .ramGb(request.ramGb() != null ? request.ramGb() : StringUtils.EMPTY)
                .storageGb(request.storageGb() != null ? request.storageGb() : StringUtils.EMPTY)
                .graphics(request.graphics() != null ? request.graphics() : StringUtils.EMPTY)
                .brandName(request.brandName() != null ? request.brandName() : StringUtils.EMPTY)
                .build();
    }

    @Override
    public Product update(Product existingProduct, ProductRequest request) {
        Laptop existingLaptop = (Laptop) existingProduct;
        return Laptop.builder()
                .id(existingLaptop.getId()) // Crucial: Keep the original MongoDB ID
                .name(request.name() != null ? request.name() : existingLaptop.getName())
                .description(request.description() != null ? request.description() : existingLaptop.getDescription())
                .price(request.price() != null ? request.price() : existingLaptop.getPrice())
                .productType(existingProduct.getProductType())
                .processor(request.processor() != null ? request.processor() : existingLaptop.getProcessor())
                .ramGb(request.ramGb() != null ? request.ramGb() : existingLaptop.getRamGb())
                .storageGb(request.storageGb() != null ? request.storageGb() : existingLaptop.getStorageGb())
                .graphics(request.graphics() != null ? request.graphics() : StringUtils.EMPTY)
                .brandName(request.brandName()!= null ? request.brandName() : StringUtils.EMPTY)
                .build();
    }

    @Override
    public String productType() {
        return "laptop";
    }

   }