package com.skt.product_service.controller;

import com.skt.product_service.dto.category.ProductCategoryCreateRequest;
import com.skt.product_service.dto.category.ProductCategoryResponse;
import com.skt.product_service.dto.category.ProductCategoryUpdateRequest;
import com.skt.product_service.service.category.ProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-categories")
@RequiredArgsConstructor
@Slf4j
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;


    // ============================================================
    // CREATE
    // ============================================================

    @PostMapping
    public ResponseEntity<ProductCategoryResponse> createCategory(
            @Valid @RequestBody ProductCategoryCreateRequest request
    ) {

        log.info(
                "[CREATE CATEGORY] name={}, parentId={}",
                request.getName(),
                request.getParentId()
        );

        ProductCategoryResponse response =
                productCategoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @GetMapping
    public ResponseEntity<List<ProductCategoryResponse>>
    getAllCategories() {

        log.info("[GET ALL CATEGORIES]");

        return ResponseEntity.ok(
                productCategoryService.getAllCategories()
        );
    }


    // ============================================================
    // GET ROOT CATEGORIES
    // ============================================================

    @GetMapping("/root")
    public ResponseEntity<List<ProductCategoryResponse>>
    getRootCategories() {

        log.info("[GET ROOT CATEGORIES]");

        return ResponseEntity.ok(
                productCategoryService.getRootCategories()
        );
    }


    // ============================================================
    // GET BY SLUG
    // ============================================================

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductCategoryResponse> getBySlug(
            @PathVariable String slug
    ) {

        log.info(
                "[GET CATEGORY BY SLUG] slug={}",
                slug
        );

        return ResponseEntity.ok(
                productCategoryService.getBySlug(slug)
        );
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryResponse> getCategory(
            @PathVariable String id
    ) {

        log.info(
                "[GET CATEGORY] id={}",
                id
        );

        return ResponseEntity.ok(
                productCategoryService.getCategoryById(id)
        );
    }


    // ============================================================
    // GET CHILDREN
    // ============================================================

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<ProductCategoryResponse>>
    getChildren(
            @PathVariable String parentId
    ) {

        log.info(
                "[GET CATEGORY CHILDREN] parentId={}",
                parentId
        );

        return ResponseEntity.ok(
                productCategoryService.getChildren(parentId)
        );
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryResponse> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody ProductCategoryUpdateRequest request
    ) {

        log.info(
                "[UPDATE CATEGORY] id={}",
                id
        );

        ProductCategoryResponse response =
                productCategoryService.updateCategory(
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
    public void deleteCategory(
            @PathVariable String id
    ) {

        log.info(
                "[DELETE CATEGORY] id={}",
                id
        );

        productCategoryService.deleteCategory(id);
    }
}