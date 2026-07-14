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

    public ProductResponse updateProduct(String id, ProductRequest productRequest) {
        // Find the existing product or throw an exception
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        // Map the new values from the request to our entity
        Product updatedProduct = Product.builder()
                .id(existingProduct.getId()) // Keep the original ID!
                .name(productRequest.name())
                .description(productRequest.description())
                .price(productRequest.price())
                .build();

        productRepository.save(updatedProduct);
        log.info("Product with id {} updated successfully", id);

        return new ProductResponse(
                updatedProduct.getId(),
                updatedProduct.getName(),
                updatedProduct.getDescription(),
                updatedProduct.getPrice()
        );
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }

        productRepository.deleteById(id);
        log.info("Product with id {} deleted successfully", id);
    }
}
