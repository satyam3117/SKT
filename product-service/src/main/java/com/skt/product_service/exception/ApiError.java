package com.skt.product_service.exception;

import java.time.Instant;
import java.util.List;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String errorCode,
        String message,
        String path,
        String correlationId,
        List<FieldErrorDetail> fieldErrors
) {
}