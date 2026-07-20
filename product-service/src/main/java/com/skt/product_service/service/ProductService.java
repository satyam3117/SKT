package com.skt.product_service.service;

import com.skt.product_service.dto.LaptopResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.model.*;
import com.skt.product_service.repository.ProductBrandRepository;
import com.skt.product_service.repository.ProductRepository;
import com.skt.product_service.repository.ProductTypeRepository;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.service.factory.ProductFactoryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductBrandRepository productBrandRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductFactoryRegistry factoryRegistry;

    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(String id) {
        log.info("Cache MISS - Fetching product from DB for id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if(product instanceof Laptop laptop){
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(product);
    }



    public ProductResponse createProduct(ProductRequest productRequest) {

        Product product = createProductFromFactory(productRequest);

        ProductBrand brand = getOrCreateBrand(product.getBrandName());
        ProductTypeEntity productType = getOrCreateProductType(product.getProductType());

        // IMPORTANT: link with product (if using references)
        product.setBrandName(brand.getBrandName());
        product.setProductType(productType.getProductType());

        Product savedProduct = saveProduct(product);

        if (product instanceof Laptop laptop)

        {
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(product);
    }


// -------------------- FACTORY --------------------

    private Product createProductFromFactory(ProductRequest productRequest) {
        ProductFactory factory = factoryRegistry.getFactory(productRequest.productType());
        return factory.create(productRequest);
    }


// -------------------- BRAND --------------------

    private ProductBrand getOrCreateBrand(String brandName) {
        return productBrandRepository
                .findByBrandName(brandName)
                .orElseGet(() -> {
                    ProductBrand newBrand = new ProductBrand();
                    newBrand.setBrandName(brandName);
                    ProductBrand saved = productBrandRepository.save(newBrand);
                    log.info("New Brand Created: {} with ID: {}", brandName, saved.getId());
                    return saved;
                });
    }


// -------------------- PRODUCT TYPE --------------------

    private ProductTypeEntity getOrCreateProductType(String productType) {
        return productTypeRepository
                .findByProductType(productType)
                .orElseGet(() -> {
                    ProductTypeEntity newType = new ProductTypeEntity();
                    newType.setProductType(productType);
                    ProductTypeEntity saved = productTypeRepository.save(newType);
                    log.info("New Product Type Created: {} with ID: {}", productType, saved.getId());
                    return saved;
                });
    }


// -------------------- SAVE --------------------

    private Product saveProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        log.info("New {} Created Successfully with ID: {}",
                savedProduct.getProductType(),
                savedProduct.getId());
        return savedProduct;
    }

    public ProductResponse updateProduct(String id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        String productType = productRequest.productType() != null
                ? productRequest.productType()
                : existingProduct.getProductType();

        ProductFactory factory = factoryRegistry.getFactory(productRequest.productType());
        Product updatedProduct = factory.update(existingProduct, productRequest);

        Product savedProduct = productRepository.save(updatedProduct);
        log.info("Product with id {} updated successfully", id);

        if(updatedProduct instanceof Laptop laptop){
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(updatedProduct);    }


    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product with id {} deleted successfully", id);
    }

    private BaseProductResponse mapToBaseProductResponse(Product product) {
        return new BaseProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getBrandName(),
                product.getProductType() != null ? product.getProductType().toLowerCase() : "others"
        );
    }

    private LaptopResponse mapToLaptopProductResponse(Laptop product) {
        return new LaptopResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getScreenSize(),
                product.getRamGb(),
                product.getStorageGb(),
                product.getProcessor(),
                product.getGraphics(),
                product.getBrandName()
        );
    }


}