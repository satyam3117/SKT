package com.skt.product_service.exception;

public record FieldErrorDetail(
        String field,
        String message
) {
}