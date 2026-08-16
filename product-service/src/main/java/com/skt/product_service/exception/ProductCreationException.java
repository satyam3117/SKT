package com.skt.product_service.exception;

public class ProductCreationException extends RuntimeException {

    public ProductCreationException(String message) {
        super(message);
    }

    public ProductCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
