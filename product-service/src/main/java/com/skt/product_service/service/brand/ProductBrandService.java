package com.skt.product_service.service.brand;

import com.skt.product_service.dto.brand.ProductBrandCreateRequest;
import com.skt.product_service.dto.brand.ProductBrandResponse;
import com.skt.product_service.dto.brand.ProductBrandUpdateRequest;
import com.skt.product_service.exception.BadRequestException;
import com.skt.product_service.model.ProductBrand;
import com.skt.product_service.repository.ProductBrandRepository;
import com.skt.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.skt.product_service.config.RedisConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

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

    @CacheEvict(
            value = RedisConfig.BRAND_CACHE,
            allEntries = true
    )
    public ProductBrandResponse createBrand(
            ProductBrandCreateRequest request
    ) {

        log.info(
                "[BRAND CREATE] name={}, slug={}",
                request.getName(),
                request.getSlug()
        );

        String name = request.getName().trim();
        String slug = normalizeSlug(request.getSlug());

        validateName(name);
        validateSlug(slug);

        /*
         * Brand name must be unique.
         */
        if (productBrandRepository.existsByNameIgnoreCase(name)) {

            throw new BadRequestException(
                    "Brand '" + name + "' already exists"
            );
        }

        /*
         * Slug must be globally unique.
         */
        if (productBrandRepository.existsBySlug(slug)) {

            throw new BadRequestException(
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
    @Cacheable(
            value = RedisConfig.BRAND_CACHE,
            key = "'active::brands'"
    )
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

    @Cacheable(
            value = RedisConfig.BRAND_CACHE,
            key = "'id::' + #id"
    )
    public ProductBrandResponse getBrandById(String id) {

        return toResponse(
                getEntityById(id)
        );
    }


    // ============================================================
    // GET BY SLUG
    // ============================================================

    @Cacheable(
            value = RedisConfig.BRAND_CACHE,
            key = "'slug::' + #slug"
    )
    public ProductBrandResponse getBySlug(
            String slug
    ) {

        String normalizedSlug = normalizeSlug(slug);

        if (normalizedSlug == null || normalizedSlug.isBlank()) {
            throw new BadRequestException(
                    "Brand slug cannot be blank"
            );
        }

        ProductBrand brand =
                productBrandRepository
                        .findBySlug(normalizedSlug)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Brand not found with slug: "
                                                + slug
                                )
                        );

        return toResponse(brand);
    }


    // ============================================================
    // GET BY NAME
    // ============================================================

    @Cacheable(
            value = RedisConfig.BRAND_CACHE,
            key = "'name::'  #name.toLowerCase()"
    )
    public ProductBrandResponse getByName(
            String name
    ) {

        if (name == null || name.isBlank()) {
            throw new BadRequestException(
                    "Brand name cannot be blank"
            );
        }

        ProductBrand brand =
                productBrandRepository
                        .findByNameIgnoreCase(name.trim())
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Brand not found with name: "
                                                + name
                                )
                        );

        return toResponse(brand);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @CacheEvict(
            value = RedisConfig.BRAND_CACHE,
            allEntries = true
    )
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
        String slug = normalizeSlug(request.getSlug());
        validateName(name);
        validateSlug(slug);

        /*
         * Check duplicate name.
         */
        if (productBrandRepository
                .existsByNameIgnoreCaseAndIdNot(name, id)) {

            throw new BadRequestException(
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

                        throw new BadRequestException(
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
    @CacheEvict(
            value = RedisConfig.BRAND_CACHE,
            allEntries = true
    )
    public void deleteBrand(String id) {

        ProductBrand brand =
                getEntityById(id);

        if (productRepository.existsByBrandId(id)) {

            throw new BadRequestException(
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

            throw new BadRequestException(
                    "Brand ID cannot be blank"
            );
        }

        return productBrandRepository
                .findById(id.trim())
                .orElseThrow(() ->
                        new BadRequestException(
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

            throw new BadRequestException(
                    "Brand name cannot be blank"
            );
        }

        if (name.length() > 150) {

            throw new BadRequestException(
                    "Brand name cannot exceed 150 characters"
            );
        }
    }


    private void validateSlug(
            String slug
    ) {

        if (slug == null || slug.isBlank()) {

            throw new BadRequestException(
                    "Brand slug cannot be blank"
            );
        }

        if (slug.length() > 150) {

            throw new BadRequestException(
                    "Brand slug cannot exceed 150 characters"
            );
        }

        if (!slug.matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")) {

            throw new BadRequestException(
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

            throw new BadRequestException(
                    "Brand '" +
                            brand.getName() +
                            "' is inactive"
            );
        }

        return brand;
    }

    private String normalizeSlug(String slug) {

        if (slug == null) {
            return null;
        }

        return slug.trim().toLowerCase(java.util.Locale.ROOT);
    }


}