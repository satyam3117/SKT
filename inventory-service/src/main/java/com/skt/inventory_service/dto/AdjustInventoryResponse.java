package com.skt.inventory_service.dto;

public record AdjustInventoryResponse(
        String skuCode,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        String warehouse
) {
}
