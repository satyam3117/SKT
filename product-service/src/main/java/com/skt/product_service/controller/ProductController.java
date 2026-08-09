package com.skt.product_service.controller;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest productRequest){

        log.info("[CREATE] Request received to create product: {}", productRequest.name());
        log.debug("[CREATE] Full payload: {}", productRequest);

        ProductResponse response = productService.createProduct(productRequest);

        log.info("[CREATE] Product created successfully with id: {}", response.id());
        return response;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<BaseProductResponse> getAllProducts(){

        log.info(" [GET ALL] Fetching all products");

        List<BaseProductResponse> products = productService.getAllProducts();

        log.info("[GET ALL] Total products fetched: {}", products.size());
        log.debug(" [GET ALL] Product list: {}", products);

        return products;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest productRequest) {

        log.info(" [UPDATE] Request received to update product with id: {}", id);
        log.debug(" [UPDATE] Payload: {}", productRequest);

        ProductResponse updatedProduct = productService.updateProduct(id, productRequest);

        log.info("✅ [UPDATE] Product updated successfully for id: {}", id);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String id) {

        log.info(" [DELETE] Request received to delete product with id: {}", id);

        productService.deleteProduct(id);

        log.info("✅ [DELETE] Product deleted successfully for id: {}", id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String id) {

        log.info("[GET] Fetching product with id: {}", id);

        ProductResponse productResponse = productService.getProductById(id);

        log.info("[GET] Product fetched successfully for id: {}", id);
        log.debug("[GET] Product details: {}", productResponse);

        return ResponseEntity.ok(productResponse);
    }
    
    @GetMapping("/category/{productCategory}")
    public ResponseEntity<List<BaseProductResponse>> getProductsByCategory(@PathVariable String productCategory) {
        log.info("[GET] Fetching products with Product Category: {}", productCategory);

        List<BaseProductResponse> products = productService.getProductsByCategory(productCategory);

        log.info("[GET] Products fetched successfully for Product Category: {}", productCategory);
        log.debug("[GET] Product list: {}", products);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/brand/{productBrand}")
    public ResponseEntity<List<BaseProductResponse>> getProductsByBrand(@PathVariable String productBrand) {
        log.info("[GET] Fetching products with Product Brand: {}", productBrand);

        List<BaseProductResponse> products = productService.getProductByBrand(productBrand);

        log.info("[GET] Products fetched successfully for Product Brand: {}", productBrand);
        log.debug("[GET] Product list: {}", products);

        return ResponseEntity.ok(products);
    }
}