package com.skt.product_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // =========================================================
    // PRODUCT NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiError> handleProductNotFound(
            ProductNotFoundException ex,
            HttpServletRequest request
    ) {

        log.warn(
                "[ERROR] Product not found path={}, message={}",
                request.getRequestURI(),
                ex.getMessage()
        );

        return buildError(
                HttpStatus.NOT_FOUND,
                "PRODUCT_NOT_FOUND",
                ex.getMessage(),
                request,
                List.of()
        );
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationError(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        List<FieldErrorDetail> fieldErrors =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(this::toFieldErrorDetail)
                        .toList();

        log.warn(
                "[ERROR] Validation failed path={}, fields={}",
                request.getRequestURI(),
                fieldErrors
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Request validation failed",
                request,
                fieldErrors
        );
    }

    // =========================================================
    // BAD REQUEST
    // =========================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {

        log.warn(
                "[ERROR] Bad request path={}, message={}",
                request.getRequestURI(),
                ex.getMessage()
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                ex.getMessage(),
                request,
                List.of()
        );
    }

    // =========================================================
    // PRODUCT CREATION ERROR
    // =========================================================

    @ExceptionHandler(ProductCreationException.class)
    public ResponseEntity<ApiError> handleProductCreationError(
            ProductCreationException ex,
            HttpServletRequest request
    ) {

        log.error(
                "[ERROR] Product creation failed path={}, message={}",
                request.getRequestURI(),
                ex.getMessage(),
                ex
        );

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "PRODUCT_CREATION_FAILED",
                "Failed to create product",
                request,
                List.of()
        );
    }

    // =========================================================
    // INVALID JSON / REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadablePayload(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {

        log.warn(
                "[ERROR] Invalid request payload path={}, message={}",
                request.getRequestURI(),
                ex.getMessage()
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_PAYLOAD",
                "Invalid request payload. Check the request body and productCategory value.",
                request,
                List.of()
        );
    }

    // =========================================================
    // INVALID REQUEST PARAMETER TYPE
    // =========================================================

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request
    ) {

        String message =
                "Invalid value for parameter '" +
                        ex.getName() +
                        "'";

        log.warn(
                "[ERROR] Request parameter type mismatch path={}, parameter={}, message={}",
                request.getRequestURI(),
                ex.getName(),
                ex.getMessage()
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "INVALID_PARAMETER",
                message,
                request,
                List.of()
        );
    }

    // =========================================================
    // MISSING REQUEST PARAMETER
    // =========================================================

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingRequestParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request
    ) {

        String message =
                "Missing required parameter '" +
                        ex.getParameterName() +
                        "'";

        log.warn(
                "[ERROR] Missing request parameter path={}, parameter={}",
                request.getRequestURI(),
                ex.getParameterName()
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "MISSING_PARAMETER",
                message,
                request,
                List.of()
        );
    }

    // =========================================================
    // FILE UPLOAD TOO LARGE
    // =========================================================

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex,
            HttpServletRequest request
    ) {

        log.warn(
                "[ERROR] Upload size exceeded path={}, message={}",
                request.getRequestURI(),
                ex.getMessage()
        );

        return buildError(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "FILE_TOO_LARGE",
                "Uploaded file size exceeds the allowed limit",
                request,
                List.of()
        );
    }

    // =========================================================
    // FALLBACK
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleInternalError(
            Exception ex,
            HttpServletRequest request
    ) {

        log.error(
                "[ERROR] Unhandled exception path={}",
                request.getRequestURI(),
                ex
        );

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Internal server error",
                request,
                List.of()
        );
    }

    // =========================================================
    // ERROR RESPONSE BUILDER
    // =========================================================

    private ResponseEntity<ApiError> buildError(
            HttpStatus status,
            String errorCode,
            String message,
            HttpServletRequest request,
            List<FieldErrorDetail> fieldErrors
    ) {

        String correlationId =
                resolveCorrelationId(request);

        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                errorCode,
                message,
                request.getRequestURI(),
                correlationId,
                fieldErrors
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }

    // =========================================================
    // CORRELATION ID
    // =========================================================

    private String resolveCorrelationId(
            HttpServletRequest request
    ) {

        String correlationId =
                request.getHeader("X-Correlation-Id");

        if (correlationId == null ||
                correlationId.isBlank()) {

            return UUID.randomUUID().toString();
        }

        return correlationId;
    }

    // =========================================================
    // FIELD ERROR MAPPING
    // =========================================================

    private FieldErrorDetail toFieldErrorDetail(
            FieldError fieldError
    ) {

        return new FieldErrorDetail(
                fieldError.getField(),
                fieldError.getDefaultMessage()
        );
    }
}