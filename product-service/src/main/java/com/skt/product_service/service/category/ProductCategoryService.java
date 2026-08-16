package com.skt.product_service.service.category;

import com.skt.product_service.dto.category.ProductCategoryCreateRequest;
import com.skt.product_service.dto.category.ProductCategoryResponse;
import com.skt.product_service.dto.category.ProductCategoryUpdateRequest;
import com.skt.product_service.model.ProductCategoryEntity;
import com.skt.product_service.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;


    // ============================================================
    // CREATE
    // ============================================================

    public ProductCategoryResponse createCategory(
            ProductCategoryCreateRequest request
    ) {

        log.info(
                "[CATEGORY CREATE] name={}, parentId={}",
                request.getName(),
                request.getParentId()
        );

        validateName(request.getName());
        validateSlug(request.getSlug());

        /*
         * Slug must be globally unique.
         */
        if (productCategoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException(
                    "Category with slug '" +
                            request.getSlug() +
                            "' already exists"
            );
        }

        ProductCategoryEntity category =
                new ProductCategoryEntity();

        category.setName(request.getName().trim());
        category.setSlug(request.getSlug().trim());
        category.setSortOrder(
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 0
        );
        category.setActive(true);

        /*
         * ROOT CATEGORY
         *
         * Example:
         *
         * Electronics
         * parentId = null
         * level = 0
         */
        if (request.getParentId() == null ||
                request.getParentId().isBlank()) {

            /*
             * Prevent duplicate root category names.
             */
            if (productCategoryRepository
                    .existsByNameAndParentIdIsNull(
                            request.getName().trim()
                    )) {

                throw new IllegalArgumentException(
                        "Root category '" +
                                request.getName() +
                                "' already exists"
                );
            }

            category.setParentId(null);
            category.setLevel(0);

        } else {

            /*
             * CHILD CATEGORY
             */
            String parentId = request.getParentId().trim();

            ProductCategoryEntity parent =
                    getEntityById(parentId);

            /*
             * Parent must be active.
             */
            if (!Boolean.TRUE.equals(parent.getActive())) {

                throw new IllegalArgumentException(
                        "Cannot create category under inactive parent: "
                                + parent.getName()
                );
            }

            /*
             * Same name under same parent is not allowed.
             */
            if (productCategoryRepository
                    .existsByNameAndParentId(
                            request.getName().trim(),
                            parentId
                    )) {

                throw new IllegalArgumentException(
                        "Category '" +
                                request.getName() +
                                "' already exists under parent '" +
                                parent.getName() +
                                "'"
                );
            }

            category.setParentId(parentId);

            /*
             * Automatically calculate level.
             */
            category.setLevel(
                    parent.getLevel() + 1
            );
        }

        ProductCategoryEntity saved =
                productCategoryRepository.save(category);

        log.info(
                "[CATEGORY CREATE] Created category id={}, level={}",
                saved.getId(),
                saved.getLevel()
        );

        return toResponse(saved);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    public List<ProductCategoryResponse> getAllCategories() {

        return productCategoryRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    public ProductCategoryResponse getCategoryById(
            String id
    ) {

        return toResponse(
                getEntityById(id)
        );
    }

    public List<String> getCategoryHierarchyNames(
            String categoryId
    ) {

        if (categoryId == null || categoryId.isBlank()) {
            throw new IllegalArgumentException(
                    "Product category not found: " + categoryId
            );
        }

        LinkedList<String> hierarchy = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        String currentId = categoryId.trim();

        while (currentId != null) {
            if (!visited.add(currentId)) {
                throw new IllegalStateException(
                        "Circular category hierarchy detected for category: "
                                + categoryId
                );
            }

            ProductCategoryEntity current =
                    getEntityById(currentId);

            hierarchy.addFirst(current.getName().trim());
            currentId = current.getParentId();
        }

        return List.copyOf(hierarchy);
    }


    // ============================================================
    // GET ROOT CATEGORIES
    // ============================================================

    public List<ProductCategoryResponse> getRootCategories() {

        return productCategoryRepository
                .findByParentIdIsNullAndActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ============================================================
    // GET CHILDREN
    // ============================================================

    public List<ProductCategoryResponse> getChildren(
            String parentId
    ) {

        /*
         * Verify parent exists.
         */
        getEntityById(parentId);

        return productCategoryRepository
                .findByParentIdAndActiveTrueOrderBySortOrderAsc(
                        parentId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ============================================================
    // GET BY SLUG
    // ============================================================

    public ProductCategoryResponse getBySlug(
            String slug
    ) {

        ProductCategoryEntity category =
                productCategoryRepository
                        .findBySlug(slug)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Category not found with slug: "
                                                + slug
                                )
                        );

        return toResponse(category);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public ProductCategoryResponse updateCategory(
            String id,
            ProductCategoryUpdateRequest request
    ) {

        log.info(
                "[CATEGORY UPDATE] id={}, parentId={}",
                id,
                request.getParentId()
        );

        ProductCategoryEntity existing =
                getEntityById(id);

        validateName(request.getName());
        validateSlug(request.getSlug());

        /*
         * Check slug belongs to another category.
         */
        productCategoryRepository
                .findBySlug(request.getSlug().trim())
                .ifPresent(category -> {

                    if (!category.getId().equals(id)) {

                        throw new IllegalArgumentException(
                                "Category with slug '" +
                                        request.getSlug() +
                                        "' already exists"
                        );
                    }
                });

        String newParentId = request.getParentId();

        /*
         * ========================================================
         * MOVE TO ROOT
         * ========================================================
         */
        if (newParentId == null ||
                newParentId.isBlank()) {

            /*
             * Check duplicate root name.
             */
            if (productCategoryRepository
                    .existsByNameAndParentIdIsNull(
                            request.getName().trim()
                    )) {

                /*
                 * The existing category itself is allowed.
                 */
                boolean sameName =
                        existing.getParentId() == null &&
                                existing.getName()
                                        .equalsIgnoreCase(
                                                request.getName().trim()
                                        );

                if (!sameName) {
                    throw new IllegalArgumentException(
                            "Root category '" +
                                    request.getName() +
                                    "' already exists"
                    );
                }
            }

            existing.setParentId(null);

            /*
             * Root level.
             */
            existing.setLevel(0);

        } else {

            newParentId = newParentId.trim();

            /*
             * Category cannot be its own parent.
             */
            if (id.equals(newParentId)) {

                throw new IllegalArgumentException(
                        "A category cannot be its own parent"
                );
            }

            /*
             * Find new parent.
             */
            ProductCategoryEntity parent =
                    getEntityById(newParentId);

            /*
             * Parent must be active.
             */
            if (!Boolean.TRUE.equals(parent.getActive())) {

                throw new IllegalArgumentException(
                        "Cannot move category under inactive parent: "
                                + parent.getName()
                );
            }

            /*
             * Prevent circular hierarchy.
             *
             * Example:
             *
             * Electronics
             *   └── Computers
             *       └── Laptops
             *
             * We cannot move Electronics under Laptops.
             */
            if (isDescendant(id, newParentId)) {

                throw new IllegalArgumentException(
                        "Invalid parent. Circular category hierarchy detected"
                );
            }

            /*
             * Check duplicate name under parent.
             */
            if (productCategoryRepository
                    .existsByNameAndParentId(
                            request.getName().trim(),
                            newParentId
                    )) {

                ProductCategoryEntity duplicate =
                        productCategoryRepository
                                .findBySlug(
                                        request.getSlug().trim()
                                )
                                .orElse(null);

                /*
                 * Only reject if another category has
                 * the same name under this parent.
                 */
                if (duplicate == null ||
                        !duplicate.getId().equals(id)) {

                    throw new IllegalArgumentException(
                            "Category '" +
                                    request.getName() +
                                    "' already exists under parent '"
                                    + parent.getName() +
                                    "'"
                    );
                }
            }

            existing.setParentId(newParentId);

            /*
             * Calculate new level.
             */
            existing.setLevel(
                    parent.getLevel() + 1
            );
        }

        /*
         * Update normal fields.
         */
        existing.setName(request.getName().trim());
        existing.setSlug(request.getSlug().trim());

        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        if (request.getSortOrder() != null) {
            existing.setSortOrder(request.getSortOrder());
        }

        ProductCategoryEntity saved =
                productCategoryRepository.save(existing);

        /*
         * IMPORTANT:
         *
         * If a category is moved, its children also need
         * their levels updated.
         */
        updateChildrenLevels(saved);

        return toResponse(saved);
    }


    // ============================================================
    // DELETE
    // ============================================================

    public void deleteCategory(String id) {

        ProductCategoryEntity category =
                getEntityById(id);

        /*
         * Do not allow deleting a category that has children.
         */
        List<ProductCategoryEntity> children =
                productCategoryRepository.findByParentId(id);

        if (!children.isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot delete category '" +
                            category.getName() +
                            "' because it has child categories"
            );
        }

        productCategoryRepository.deleteById(id);

        log.info(
                "[CATEGORY DELETE] Deleted category id={}",
                id
        );
    }


    // ============================================================
    // UPDATE CHILD LEVELS
    // ============================================================

    private void updateChildrenLevels(
            ProductCategoryEntity parent
    ) {

        List<ProductCategoryEntity> children =
                productCategoryRepository
                        .findByParentId(parent.getId());

        for (ProductCategoryEntity child : children) {

            int expectedLevel =
                    parent.getLevel() + 1;

            if (!Integer.valueOf(expectedLevel)
                    .equals(child.getLevel())) {

                child.setLevel(expectedLevel);

                productCategoryRepository.save(child);
            }

            /*
             * Recursively update deeper children.
             */
            updateChildrenLevels(child);
        }
    }


    // ============================================================
    // CIRCULAR HIERARCHY CHECK
    // ============================================================

    private boolean isDescendant(
            String categoryId,
            String possibleParentId
    ) {

        String currentId = possibleParentId;

        while (currentId != null) {

            /*
             * We reached the category itself.
             *
             * Therefore possibleParentId is actually
             * a descendant of categoryId.
             */
            if (categoryId.equals(currentId)) {
                return true;
            }

            ProductCategoryEntity current =
                    productCategoryRepository
                            .findById(currentId)
                            .orElse(null);

            if (current == null) {
                return false;
            }

            currentId = current.getParentId();
        }

        return false;
    }


    // ============================================================
    // FIND ENTITY
    // ============================================================

    private ProductCategoryEntity getEntityById(
            String id
    ) {

        return productCategoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product category not found: " + id
                        )
                );
    }


    // ============================================================
    // ENTITY -> RESPONSE
    // ============================================================

    private ProductCategoryResponse toResponse(
            ProductCategoryEntity entity
    ) {

        return ProductCategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .parentId(entity.getParentId())
                .level(entity.getLevel())
                .active(entity.getActive())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }


    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateName(String name) {

        if (name == null || name.isBlank()) {

            throw new IllegalArgumentException(
                    "Category name cannot be blank"
            );
        }
    }


    private void validateSlug(String slug) {

        if (slug == null || slug.isBlank()) {

            throw new IllegalArgumentException(
                    "Category slug cannot be blank"
            );
        }

        if (!slug.matches(
                "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        )) {

            throw new IllegalArgumentException(
                    "Invalid slug. Use lowercase letters, "
                            + "numbers and hyphens only. "
                            + "Example: gaming-laptops"
            );
        }
    }
}