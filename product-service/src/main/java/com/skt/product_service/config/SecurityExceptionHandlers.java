package com.skt.product_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skt.product_service.exception.ApiError;
import com.skt.product_service.exception.FieldErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityExceptionHandlers
        implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    // =========================================================
    // 401 - UNAUTHENTICATED
    // =========================================================

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        writeError(
                response,
                request,
                HttpServletResponse.SC_UNAUTHORIZED,
                "UNAUTHORIZED",
                "Authentication is required to access this resource"
        );
    }

    // =========================================================
    // 403 - FORBIDDEN
    // =========================================================

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        writeError(
                response,
                request,
                HttpServletResponse.SC_FORBIDDEN,
                "FORBIDDEN",
                "You do not have permission to access this resource"
        );
    }

    // =========================================================
    // WRITE JSON ERROR
    // =========================================================

    private void writeError(
            HttpServletResponse response,
            HttpServletRequest request,
            int status,
            String errorCode,
            String message
    ) throws IOException {

        String correlationId =
                request.getHeader("X-Correlation-Id");

        if (correlationId == null ||
                correlationId.isBlank()) {

            correlationId =
                    UUID.randomUUID().toString();
        }

        ApiError apiError = new ApiError(
                Instant.now(),
                status,
                status == HttpServletResponse.SC_UNAUTHORIZED
                        ? "Unauthorized"
                        : "Forbidden",
                errorCode,
                message,
                request.getRequestURI(),
                correlationId,
                List.<FieldErrorDetail>of()
        );

        response.setStatus(status);
        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(
                response.getWriter(),
                apiError
        );
    }
}