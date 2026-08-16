package com.skt.product_service.util;

import com.skt.product_service.exception.ProductCreationException;
import com.skt.product_service.model.ProductImage;
import com.skt.product_service.repository.ProductRepository;
import com.skt.product_service.service.LocalImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductUtil {

    private final ProductRepository productRepository;
    private final LocalImageStorageService localImageStorageService;

    public String generateUniqueSkuCode(String productCategory) {
        String normalizedCategory = productCategory == null || productCategory.isBlank()
                ? "GEN"
                : productCategory.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);

        if (normalizedCategory.length() > 4) {
            normalizedCategory = normalizedCategory.substring(0, 4);
        }

        for (int attempt = 0; attempt < 10; attempt++) {
            String skuCode = normalizedCategory + "-" + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            if (!productRepository.existsBySkuCode(skuCode)) {
                return skuCode;
            }
        }

        throw new ProductCreationException("Error in creating product");
    }

    public List<ProductImage> uploadProductImages(
            List<MultipartFile> images, String skuCode, String categoryId
    ) {

        List<ProductImage> productImages = new ArrayList<>(images.size());

        int sortOrder = 0;

        for (MultipartFile image : images) {
            String imageUrl;
            try {
                imageUrl = localImageStorageService.upload(image, skuCode, categoryId);
            } catch (RuntimeException | IOException ex) {
                throw new ProductCreationException("Error in creating product", ex);
            }

            ProductImage productImage = new ProductImage(
                    UUID.randomUUID().toString(),
                    imageUrl,
                    sortOrder++
            );

            productImages.add(productImage);
        }

        return productImages;
    }
}
