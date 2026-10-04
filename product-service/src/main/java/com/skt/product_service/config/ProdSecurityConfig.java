package com.skt.product_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import org.springframework.http.HttpMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Profile("prod")
@EnableMethodSecurity
@RequiredArgsConstructor
public class ProdSecurityConfig {

    private final SecurityExceptionHandlers securityExceptionHandlers;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // Public actuator endpoints
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/actuator/prometheus"
                        ).permitAll()

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Public product GET APIs
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/product/**"
                        ).permitAll()

                        // Everything else requires JWT authentication
                        .anyRequest().authenticated()
                )

                // PROD ONLY: Keycloak JWT
                .oauth2ResourceServer(oauth2 ->
                        oauth2
                                .authenticationEntryPoint(
                                        securityExceptionHandlers
                                )
                                .jwt(Customizer.withDefaults())
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint(
                                        securityExceptionHandlers
                                )
                                .accessDeniedHandler(
                                        securityExceptionHandlers
                                )
                )

                .build();
    }
}