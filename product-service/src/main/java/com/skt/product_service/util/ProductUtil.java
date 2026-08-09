package com.skt.product_service.util;

import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductUtil {

    private final ProductRepository productRepository;

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

        throw new IllegalStateException("Unable to generate unique skuCode");
    }
}
