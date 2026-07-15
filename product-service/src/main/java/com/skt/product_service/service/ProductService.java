package com.skt.product_service.service;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductType;
import com.skt.product_service.repository.ProductRepository;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.service.factory.ProductFactoryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductFactoryRegistry factoryRegistry; // Injected registry

    public ProductResponse createProduct(ProductRequest productRequest) {
        if (productRequest.productType() == null) {
            throw new IllegalArgumentException("Product type must be provided");
        }

        // Get the specific factory (LaptopFactory or GpuFactory)
        ProductFactory factory = factoryRegistry.getFactory(productRequest.productType());

        // Let the factory build the entity
        Product product = factory.create(productRequest);

        Product savedProduct = productRepository.save(product);
        log.info("New {} Created Successfully with ID: {}", savedProduct.getProductType(), savedProduct.getId());

        return mapToProductResponse(savedProduct);
    }

    public ProductResponse updateProduct(String id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        // Use requested productType, or fallback to the type already stored in MongoDB
        ProductType type = productRequest.productType() != null ? productRequest.productType() : existingProduct.getProductType();

        // Get the appropriate factory & perform the update
        ProductFactory factory = factoryRegistry.getFactory(type);
        Product updatedProduct = factory.update(existingProduct, productRequest);

        Product savedProduct = productRepository.save(updatedProduct);
        log.info("Product with id {} updated successfully", id);

        return mapToProductResponse(savedProduct);
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product with id {} deleted successfully", id);
    }

    private ProductResponse mapToProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getProductType() != null ? product.getProductType().name() : "UNKNOWN"
        );
    }
}