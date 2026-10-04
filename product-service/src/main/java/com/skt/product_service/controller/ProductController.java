package com.skt.product_service.controller;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.ProductFormConfig;
import com.skt.product_service.dto.ProductPageResponse;
import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.dto.ProductResponse;
import com.skt.product_service.service.LocalImageStorageService;
import com.skt.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final LocalImageStorageService localImageStorageService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @ModelAttribute ProductRequest productRequest,
                                         @RequestParam("productImages") List<MultipartFile> productImages){

        log.info("[CREATE] Request received to create product: {}", productRequest.name());
        log.debug("[CREATE] Full payload: {}", productRequest);

        ProductResponse response = productService.createProduct(productRequest, productImages);

        log.info("[CREATE] Product created successfully with id: {}", response.id());
        return response;
    }

//    @GetMapping
//    @ResponseStatus(HttpStatus.OK)
//    public List<BaseProductResponse> getAllProducts(){
//
//        log.info(" [GET ALL] Fetching all products");
//
//        List<BaseProductResponse> products = productService.getAllProducts();
//
//        log.info("[GET ALL] Total products fetched: {}", products.size());
//        log.debug(" [GET ALL] Product list: {}", products);
//
//        return products;
//    }

    @GetMapping(params = {"page", "size"})
    @ResponseStatus(HttpStatus.OK)
    public ProductPageResponse getProductsPage(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction
    ) {
        log.info("[GET PAGE] Fetching products page={}, size={}", page, size);

        ProductPageResponse response = productService.getProductsPage(
                page,
                size,
                categoryId,
                brand,
                minPrice,
                maxPrice,
                sort,
                direction
        );

        log.info("[GET PAGE] Returned {} items (total={})", response.items().size(), response.totalElements());
        return response;
    }

    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public ProductPageResponse searchProducts(
            @RequestParam String q,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction
    ) {
        log.info("[SEARCH] q='{}', page={}, size={}", q, page, size);

        ProductPageResponse response = productService.searchProducts(
                q,
                categoryId,
                brand,
                minPrice,
                maxPrice,
                page,
                size,
                sort,
                direction
        );

        log.info("[SEARCH] Returned {} items (total={})", response.items().size(), response.totalElements());
        return response;
    }

    @GetMapping("/types/{productCategory}/form-config")
    @ResponseStatus(HttpStatus.OK)
    public ProductFormConfig getProductFormConfig(@PathVariable String productCategory) {
        log.info("[GET] Fetching form config for product category: {}", productCategory);
        return productService.getProductFormConfig(productCategory);

    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @Valid @ModelAttribute ProductRequest productRequest,
            @RequestParam(value = "productImages", required = false) List<MultipartFile> productImages) {

        log.info(" [UPDATE] Request received to update product with id: {}", id);
        log.debug(" [UPDATE] Payload: {}", productRequest);

        ProductResponse updatedProduct = productService.updateProduct(id, productRequest, productImages);

        log.info("✅ [UPDATE] Product updated successfully for id: {}", id);
        return ResponseEntity.ok(updatedProduct);
    }

    @PreAuthorize("hasRole('ADMIN')")
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
    public ProductPageResponse getProductsByCategory(
            @PathVariable String productCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction
    ) {
        log.info("[GET] Fetching products with Product Category: {}", productCategory);

        log.info("[GET] Products fetched successfully for Product Category: {}", productCategory);

        return productService.getProductsByCategory(
                productCategory,
                page,
                size,
                sort,
                direction
        );
    }

    @GetMapping("/brand/{productBrand}")
    public ProductPageResponse getProductsByBrand(
            @PathVariable String productBrand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction
    ) {
        log.info("[GET] Fetching products with Product Brand: {}", productBrand);


        log.info("[GET] Products fetched successfully for Product Brand: {}", productBrand);

        return productService.getProductsByBrand(
                productBrand,
                page,
                size,
                sort,
                direction
        );
    }

    @GetMapping("/images/{skuCode}/{filename:.+}")
    public ResponseEntity<Resource> getProductImage(
            @PathVariable String skuCode,
            @PathVariable String filename,
            @RequestParam String categoryId
    ) {
        try {
            Resource resource = localImageStorageService.loadAsResource(
                    filename,
                    skuCode,
                    categoryId
            );

            return ResponseEntity.ok()
                    .contentType(resolveMediaType(filename))
                    .body(resource);

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Image not found",
                    ex
            );
        }
    }

    private MediaType resolveMediaType(String filename) {
        String extension = "";

        int lastDot = filename.lastIndexOf('.');

        if (lastDot >= 0 && lastDot < filename.length() - 1) {
            extension = filename
                    .substring(lastDot + 1)
                    .toLowerCase();
        }

        return switch (extension) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}