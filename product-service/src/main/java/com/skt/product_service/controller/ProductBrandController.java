package com.skt.product_service.controller;

import com.skt.product_service.dto.brand.ProductBrandCreateRequest;
import com.skt.product_service.dto.brand.ProductBrandResponse;
import com.skt.product_service.dto.brand.ProductBrandUpdateRequest;
import com.skt.product_service.service.brand.ProductBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product/brands")
@RequiredArgsConstructor
@Slf4j
public class ProductBrandController {

    private final ProductBrandService productBrandService;


    // ============================================================
    // CREATE
    // ============================================================

    @PostMapping
    public ResponseEntity<ProductBrandResponse> createBrand(
            @Valid @RequestBody ProductBrandCreateRequest request
    ) {

        log.info(
                "[CREATE BRAND] name={}, slug={}",
                request.getName(),
                request.getSlug()
        );

        ProductBrandResponse response =
                productBrandService.createBrand(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @GetMapping
    public ResponseEntity<List<ProductBrandResponse>>
    getAllBrands() {

        log.info("[GET ALL BRANDS]");

        return ResponseEntity.ok(
                productBrandService.getAllBrands()
        );
    }


    // ============================================================
    // GET ACTIVE
    // ============================================================

    @GetMapping("/active")
    public ResponseEntity<List<ProductBrandResponse>>
    getActiveBrands() {

        log.info("[GET ACTIVE BRANDS]");

        return ResponseEntity.ok(
                productBrandService.getActiveBrands()
        );
    }


    // ============================================================
    // GET BY SLUG
    // ============================================================

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductBrandResponse>
    getBySlug(
            @PathVariable String slug
    ) {

        log.info(
                "[GET BRAND BY SLUG] slug={}",
                slug
        );

        return ResponseEntity.ok(
                productBrandService.getBySlug(slug)
        );
    }


    // ============================================================
    // GET BY NAME
    // ============================================================

    @GetMapping("/name/{name}")
    public ResponseEntity<ProductBrandResponse>
    getByName(
            @PathVariable String name
    ) {

        log.info(
                "[GET BRAND BY NAME] name={}",
                name
        );

        return ResponseEntity.ok(
                productBrandService.getByName(name)
        );
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ProductBrandResponse>
    getBrand(
            @PathVariable String id
    ) {

        log.info(
                "[GET BRAND] id={}",
                id
        );

        return ResponseEntity.ok(
                productBrandService.getBrandById(id)
        );
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<ProductBrandResponse>
    updateBrand(
            @PathVariable String id,
            @Valid @RequestBody ProductBrandUpdateRequest request
    ) {

        log.info(
                "[UPDATE BRAND] id={}",
                id
        );

        ProductBrandResponse response =
                productBrandService.updateBrand(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // DELETE
    // ============================================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBrand(
            @PathVariable String id
    ) {

        log.info(
                "[DELETE BRAND] id={}",
                id
        );

        productBrandService.deleteBrand(id);
    }
}