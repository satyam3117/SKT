package com.skt.product_service.service;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.model.Product;
import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.name())
                .description(productRequest.description())
                .price(productRequest.price())
                .build();
        productRepository.save(product);

        log.info("New Product Created SuccessFully", product);

        return new  ProductResponse(product.getId(), product.getName(), product.getDescription(), product.getPrice());
    }

}
