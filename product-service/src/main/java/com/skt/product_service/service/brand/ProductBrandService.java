package com.skt.product_service.service.brand;

import com.skt.product_service.dto.brand.ProductBrandCreateRequest;
import com.skt.product_service.dto.brand.ProductBrandResponse;
import com.skt.product_service.dto.brand.ProductBrandUpdateRequest;
import com.skt.product_service.model.ProductBrand;
import com.skt.product_service.repository.ProductBrandRepository;
import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductBrandService {

    private final ProductBrandRepository productBrandRepository;
    private final ProductRepository productRepository;


    // ============================================================
    // CREATE
    // ============================================================

    public ProductBrandResponse createBrand(
            ProductBrandCreateRequest request
    ) {

        log.info(
                "[BRAND CREATE] name={}, slug={}",
                request.getName(),
                request.getSlug()
        );

        String name = request.getName().trim();
        String slug = request.getSlug().trim();

        validateName(name);
        validateSlug(slug);

        /*
         * Brand name must be unique.
         */
        if (productBrandRepository.existsByNameIgnoreCase(name)) {

            throw new IllegalArgumentException(
                    "Brand '" + name + "' already exists"
            );
        }

        /*
         * Slug must be globally unique.
         */
        if (productBrandRepository.existsBySlug(slug)) {

            throw new IllegalArgumentException(
                    "Brand with slug '" + slug + "' already exists"
            );
        }

        ProductBrand brand = new ProductBrand();

        brand.setName(name);
        brand.setSlug(slug);

        brand.setActive(true);

        brand.setSortOrder(
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 0
        );

        ProductBrand saved =
                productBrandRepository.save(brand);

        log.info(
                "[BRAND CREATE] Created brand id={}",
                saved.getId()
        );

        return toResponse(saved);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    public List<ProductBrandResponse> getAllBrands() {

        return productBrandRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ============================================================
    // GET ACTIVE
    // ============================================================

    public List<ProductBrandResponse> getActiveBrands() {

        return productBrandRepository
                .findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    public ProductBrandResponse getBrandById(
            String id
    ) {

        return toResponse(
                getEntityById(id)
        );
    }


    // ============================================================
    // GET BY SLUG
    // ============================================================

    public ProductBrandResponse getBySlug(
            String slug
    ) {

        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException(
                    "Brand slug cannot be blank"
            );
        }

        ProductBrand brand =
                productBrandRepository
                        .findBySlug(slug.trim())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Brand not found with slug: "
                                                + slug
                                )
                        );

        return toResponse(brand);
    }


    // ============================================================
    // GET BY NAME
    // ============================================================

    public ProductBrandResponse getByName(
            String name
    ) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Brand name cannot be blank"
            );
        }

        ProductBrand brand =
                productBrandRepository
                        .findByNameIgnoreCase(name.trim())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Brand not found with name: "
                                                + name
                                )
                        );

        return toResponse(brand);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public ProductBrandResponse updateBrand(
            String id,
            ProductBrandUpdateRequest request
    ) {

        log.info(
                "[BRAND UPDATE] id={}",
                id
        );

        ProductBrand existing =
                getEntityById(id);

        String name = request.getName().trim();
        String slug = request.getSlug().trim();

        validateName(name);
        validateSlug(slug);

        /*
         * Check duplicate name.
         */
        if (productBrandRepository
                .existsByNameIgnoreCaseAndIdNot(name, id)) {

            throw new IllegalArgumentException(
                    "Brand '" + name + "' already exists"
            );
        }

        /*
         * Check duplicate slug.
         */
        productBrandRepository
                .findBySlug(slug)
                .ifPresent(existingSlug -> {

                    if (!existingSlug.getId().equals(id)) {

                        throw new IllegalArgumentException(
                                "Brand with slug '" +
                                        slug +
                                        "' already exists"
                        );
                    }
                });

        existing.setName(name);
        existing.setSlug(slug);

        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        if (request.getSortOrder() != null) {
            existing.setSortOrder(request.getSortOrder());
        }

        ProductBrand saved =
                productBrandRepository.save(existing);

        log.info(
                "[BRAND UPDATE] Updated brand id={}",
                saved.getId()
        );

        return toResponse(saved);
    }


    // ============================================================
    // DELETE
    // ============================================================
    public void deleteBrand(String id) {

        ProductBrand brand =
                getEntityById(id);

        if (productRepository.existsByBrandId(id)) {

            throw new IllegalArgumentException(
                    "Cannot delete brand '" +
                            brand.getName() +
                            "' because products are using it"
            );
        }

        productBrandRepository.deleteById(id);

        log.info(
                "[BRAND DELETE] Deleted brand id={}",
                id
        );
    }


    // ============================================================
    // ENTITY LOOKUP
    // ============================================================

    public ProductBrand getEntityById(
            String id
    ) {

        if (id == null || id.isBlank()) {

            throw new IllegalArgumentException(
                    "Brand ID cannot be blank"
            );
        }

        return productBrandRepository
                .findById(id.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Brand not found with id: " + id
                        )
                );
    }


    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateName(
            String name
    ) {

        if (name == null || name.isBlank()) {

            throw new IllegalArgumentException(
                    "Brand name cannot be blank"
            );
        }

        if (name.length() > 150) {

            throw new IllegalArgumentException(
                    "Brand name cannot exceed 150 characters"
            );
        }
    }


    private void validateSlug(
            String slug
    ) {

        if (slug == null || slug.isBlank()) {

            throw new IllegalArgumentException(
                    "Brand slug cannot be blank"
            );
        }

        if (slug.length() > 150) {

            throw new IllegalArgumentException(
                    "Brand slug cannot exceed 150 characters"
            );
        }

        if (!slug.matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")) {

            throw new IllegalArgumentException(
                    "Brand slug must contain only lowercase letters, " +
                            "numbers and hyphens"
            );
        }
    }


    // ============================================================
    // RESPONSE MAPPER
    // ============================================================

    private ProductBrandResponse toResponse(
            ProductBrand brand
    ) {

        return ProductBrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .active(brand.getActive())
                .sortOrder(brand.getSortOrder())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }

    public ProductBrand validateActiveBrand(
            String brandId
    ) {

        ProductBrand brand = getEntityById(brandId);

        if (!Boolean.TRUE.equals(brand.getActive())) {

            throw new IllegalArgumentException(
                    "Brand '" +
                            brand.getName() +
                            "' is inactive"
            );
        }

        return brand;
    }


}