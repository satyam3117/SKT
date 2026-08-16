package com.skt.inventory_service.exception;

public class DuplicateSkuCodeException extends RuntimeException {

    public DuplicateSkuCodeException(String skuCode) {
        super("SKU code already exists: " + skuCode);
    }
}
