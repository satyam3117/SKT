package com.skt.product_service.service;

import com.skt.product_service.dto.BaseProductResponse;
import com.skt.product_service.dto.ProductPageResponse;
import com.skt.product_service.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductPageRequestService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String DEFAULT_SORT_FIELD = "createdAt";
    private static final String DEFAULT_SORT_DIRECTION = "desc";
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "name",
            "price",
            "createdAt",
            "updatedAt",
            "brandName"
    );

    private final MongoTemplate mongoTemplate;
    private final ProductMapper productMapper;

    public ProductPagingOptions resolvePagingOptions(
            int page,
            int size,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            String direction
    ) {
        validatePageRequest(page, size, minPrice, maxPrice, sort, direction);
        return new ProductPagingOptions(page, size, normalizeSort(sort), normalizeDirection(direction));
    }

    public String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public ProductPageResponse fetchPage(Query baseQuery, ProductPagingOptions pagingOptions) {
        Query countQuery = Query.of(baseQuery).limit(-1).skip(-1);
        long totalElements = mongoTemplate.count(countQuery, Product.class);

        PageRequest pageRequest = PageRequest.of(
                pagingOptions.page(),
                pagingOptions.size(),
                Sort.by(pagingOptions.direction(), pagingOptions.sortField())
        );
        Query pageQuery = Query.of(baseQuery).with(pageRequest);

        List<BaseProductResponse> items = mongoTemplate.find(pageQuery, Product.class)
                .stream()
                .map(productMapper::toBaseResponse)
                .toList();

        int totalPages = totalElements == 0
                ? 0
                : (int) Math.ceil((double) totalElements / pagingOptions.size());

        return new ProductPageResponse(
                items,
                pagingOptions.page(),
                pagingOptions.size(),
                totalElements,
                totalPages,
                pagingOptions.page() + 1 < totalPages,
                pagingOptions.page() > 0 && totalPages > 0
        );
    }

    private void validatePageRequest(
            int page,
            int size,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            String direction
    ) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be greater than or equal to 0");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("size must be between 1 and " + MAX_PAGE_SIZE);
        }

        if (minPrice != null && minPrice.signum() < 0) {
            throw new IllegalArgumentException("minPrice must be greater than or equal to 0");
        }

        if (maxPrice != null && maxPrice.signum() < 0) {
            throw new IllegalArgumentException("maxPrice must be greater than or equal to 0");
        }

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice must be less than or equal to maxPrice");
        }

        String normalizedSort = normalizeOptional(sort);
        if (normalizedSort != null && !ALLOWED_SORT_FIELDS.contains(normalizedSort)) {
            throw new IllegalArgumentException("sort must be one of: " + String.join(", ", ALLOWED_SORT_FIELDS));
        }

        String normalizedDirection = normalizeOptional(direction);
        if (normalizedDirection != null
                && !normalizedDirection.equalsIgnoreCase("asc")
                && !normalizedDirection.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("direction must be asc or desc");
        }
    }

    private String normalizeSort(String sort) {
        String normalizedSort = normalizeOptional(sort);
        return normalizedSort == null ? DEFAULT_SORT_FIELD : normalizedSort;
    }

    private Sort.Direction normalizeDirection(String direction) {
        String normalizedDirection = normalizeOptional(direction);
        if (normalizedDirection == null) {
            normalizedDirection = DEFAULT_SORT_DIRECTION;
        }

        return Sort.Direction.fromString(normalizedDirection);
    }

    public record ProductPagingOptions(
            int page,
            int size,
            String sortField,
            Sort.Direction direction
    ) {
    }
}
