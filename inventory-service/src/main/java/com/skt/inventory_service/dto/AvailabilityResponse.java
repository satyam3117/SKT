package com.skt.inventory_service.dto;

public record AvailabilityResponse(
        String skuCode,
        boolean inStock,
        Integer availableQuantity
) {
    public AvailabilityResponse(String skuCode, Integer quantity, Integer availableQuantity, boolean inStock) {
        this(skuCode, inStock, availableQuantity);
    }
}
