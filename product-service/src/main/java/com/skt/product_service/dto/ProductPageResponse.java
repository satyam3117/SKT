package com.skt.product_service.dto;

import java.util.List;

public record ProductPageResponse(
        List<BaseProductResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {
}
