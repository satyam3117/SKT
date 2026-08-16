package com.skt.inventory_service.exception;

public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String skuCode) {
        super("Inventory not found for SKU code: " + skuCode);
    }
}
