package com.skt.product_service.service;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.LaptopResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.service.factory.ProductFactory;
import com.skt.product_service.model.Laptop;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductBrand;
import com.skt.product_service.model.ProductTypeEntity;
import com.skt.product_service.repository.ProductBrandRepository;
import com.skt.product_service.repository.ProductRepository;
import com.skt.product_service.repository.ProductTypeRepository;

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

    // ========================= GET =========================
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(String id) {

        log.debug("[GET] Checking cache for product id={}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[GET] Product not found id={}", id);
                    return new IllegalArgumentException("Product not found with id: " + id);
                });

        log.info("[GET] Product fetched successfully id={}", id);

        if (product instanceof Laptop laptop) {
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(product);
    }

    // ========================= CREATE =========================
    public ProductResponse createProduct(ProductRequest productRequest) {

        long start = System.currentTimeMillis();

        log.info("[CREATE] Creating product name={}, type={}",
                productRequest.name(), productRequest.productType());

        log.debug("[CREATE] Payload={}", productRequest);

        Product product = createProductFromFactory(productRequest);

        ProductBrand brand = getOrCreateBrand(product.getBrandName());
        ProductTypeEntity productType = getOrCreateProductType(product.getProductType());

        product.setBrandName(brand.getBrandName());
        product.setProductType(productType.getProductType());

        Product savedProduct = saveProduct(product);

        log.info("[CREATE] Product created id={}", savedProduct.getId());
        log.debug("[PERF] createProduct took {} ms",
                System.currentTimeMillis() - start);

        if (savedProduct instanceof Laptop laptop) {
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(savedProduct);
    }

    // ========================= UPDATE =========================
    public ProductResponse updateProduct(String id, ProductRequest productRequest) {

        log.info("[UPDATE] Updating product id={}", id);
        log.debug("[UPDATE] Payload={}", productRequest);

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[UPDATE] Product not found id={}", id);
                    return new IllegalArgumentException("Product not found with id: " + id);
                });

        ProductFactory factory = factoryRegistry.getFactory(productRequest.productType());
        Product updatedProduct = factory.update(existingProduct, productRequest);

        Product savedProduct = productRepository.save(updatedProduct);

        log.info("[UPDATE] Product updated id={}", id);

        if (savedProduct instanceof Laptop laptop) {
            return mapToLaptopProductResponse(laptop);
        }

        return mapToBaseProductResponse(savedProduct);
    }

    // ========================= DELETE =========================
    public void deleteProduct(String id) {

        log.info("[DELETE] Deleting product id={}", id);

        if (!productRepository.existsById(id)) {
            log.warn("[DELETE] Product not found id={}", id);
            throw new IllegalArgumentException("Product not found with id: " + id);
        }

        productRepository.deleteById(id);

        log.info("[DELETE] Product deleted id={}", id);
    }

    // ========================= INTERNAL =========================
    private Product saveProduct(Product product) {

        log.debug("[SAVE] Persisting product name={}, type={}",
                product.getName(), product.getProductType());

        Product savedProduct = productRepository.save(product);

        log.info("[SAVE] {} created id={}",
                savedProduct.getProductType(), savedProduct.getId());

        return savedProduct;
    }

    private ProductBrand getOrCreateBrand(String brandName) {

        return productBrandRepository
                .findByBrandName(brandName)
                .orElseGet(() -> {
                    log.debug("[BRAND] Creating new brand name={}", brandName);

                    ProductBrand brand = new ProductBrand();
                    brand.setBrandName(brandName);

                    ProductBrand saved = productBrandRepository.save(brand);

                    log.info("[BRAND] Created brand name={} id={}",
                            brandName, saved.getId());

                    return saved;
                });
    }

    private ProductTypeEntity getOrCreateProductType(String productType) {

        return productTypeRepository
                .findByProductType(productType)
                .orElseGet(() -> {
                    log.debug("[TYPE] Creating new product type={}", productType);

                    ProductTypeEntity type = new ProductTypeEntity();
                    type.setProductType(productType);

                    ProductTypeEntity saved = productTypeRepository.save(type);

                    log.info("[TYPE] Created product type={} id={}",
                            productType, saved.getId());

                    return saved;
                });
    }

    private Product createProductFromFactory(ProductRequest request) {

        log.debug("[FACTORY] Resolving factory for type={}", request.productType());

        ProductFactory factory = factoryRegistry.getFactory(request.productType());

        return factory.create(request);
    }

    // ========================= MAPPERS =========================
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