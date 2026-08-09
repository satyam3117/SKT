package com.skt.product_service.service;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.dto.LaptopResponse;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.model.Laptop;
import com.skt.product_service.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public BaseProductResponse toBaseResponse(Product product) {
        return new BaseProductResponse(
                product.getId(),
                product.getSkuCode(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getProductCategory() != null ? product.getProductCategory().toLowerCase() : "others",
                product.getBrandName(),
                product.getCategoryId(),
                product.getCategoryPath()
        );
    }

    public LaptopResponse toLaptopResponse(Laptop product) {
        return new LaptopResponse(
                product.getId(),
                product.getSkuCode(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getProcessor(),
                product.getRamGb(),
                product.getStorageGb(),
                product.getScreenSize(),
                product.getGraphics(),
                product.getBrandName(),
                product.getCategoryId(),
                product.getCategoryPath()
        );
    }

    public CachedProduct toCachedProduct(Product product) {
        if (product instanceof Laptop laptop) {
            return new CachedProduct(product.getProductCategory(), toLaptopResponse(laptop), null);
        }
        return new CachedProduct(product.getProductCategory(), null, toBaseResponse(product));
    }

    public ProductResponse toProductResponse(CachedProduct cachedProduct) {
        if (cachedProduct.laptop() != null) {
            return cachedProduct.laptop();
        }
        return cachedProduct.base();
    }
}
