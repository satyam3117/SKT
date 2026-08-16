package com.skt.inventory_service.dto;

public record InventoryResponse(Long id, String skuCode, Integer quantity, Integer reservedQuantity,
                                Integer availableQuantity, String warehouse) {

}
