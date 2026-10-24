package com.skt.product_service.service;

import com.skt.product_service.dto.CachedProduct;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.model.Computer;
import com.skt.product_service.model.Laptop;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductImage;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ProductMapper {

    public ProductResponse toProductResponse(Product product) {

        Map<String, Object> attributes = new LinkedHashMap<>();

        if (product instanceof Laptop laptop) {
            attributes.put("processor", laptop.getProcessor());
            attributes.put("ramGb", laptop.getRamGb());
            attributes.put("storageGb", laptop.getStorageGb());
            attributes.put("screenSize", laptop.getScreenSize());
            attributes.put("graphics", laptop.getGraphics());
        }

        if (product instanceof Computer computer) {
            attributes.put("processor", computer.getProcessor());
            attributes.put("ramGb", computer.getRamGb());
            attributes.put("storageGb", computer.getStorageGb());
            attributes.put("screenSize", computer.getScreenSize());
            attributes.put("graphics", computer.getGraphics());
            attributes.put("mouse", computer.getMouse());
            attributes.put("keyboard", computer.getKeyboard());
        }

        return new ProductResponse(
                product.getId(),
                product.getSkuCode(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                normalizeCategory(product.getProductCategory()),
                product.getBrandId(),
                product.getCategoryId(),
                product.getStatus() != null
                        ? product.getStatus().name()
                        : null,
                mapImages(product),
                attributes
        );
    }

    public CachedProduct toCachedProduct(Product product) {
        return new CachedProduct(
                product.getProductCategory(),
                toProductResponse(product)
        );
    }

    public ProductResponse toProductResponse(CachedProduct cachedProduct) {
        return cachedProduct.product();
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "other";
        }

        return category.toLowerCase();
    }

    private List<ProductImage> mapImages(Product product) {

        if (product.getProductImages() == null) {
            return List.of();
        }

        return product.getProductImages()
                .stream()
                .map(image -> new ProductImage(
                        image.getId(),
                        buildImageUrl(
                                product.getSkuCode(),
                                image.getImageUrl(),
                                product.getCategoryId()
                        ),
                        image.getPosition()
                ))
                .toList();
    }

    private String buildImageUrl(
            String skuCode,
            String filename,
            String categoryId
    ) {
        if (skuCode == null || filename == null || categoryId == null) {
            return null;
        }

        return "/api/product/images/"
                + encode(skuCode)
                + "/"
                + encode(filename)
                + "?categoryId="
                + encode(categoryId);
    }

    private String encode(String value) {
        return java.net.URLEncoder
                .encode(value, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }
}