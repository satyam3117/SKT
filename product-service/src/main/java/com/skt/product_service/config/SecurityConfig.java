package com.skt.product_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // PUBLIC ACTUATOR ENDPOINTS
                        // =========================
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/actuator/prometheus"
                        ).permitAll()

                        // =========================
                        // PUBLIC API DOCUMENTATION
                        // =========================
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =========================
                        // PUBLIC PRODUCT READ APIs
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/product/**"
                        ).permitAll()

                        // =========================
                        // ALL OTHER APIs
                        // JWT AUTHENTICATION REQUIRED
                        // =========================
                        .anyRequest().authenticated()
                )

                // =========================
                // KEYCLOAK JWT
                // =========================
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(Customizer.withDefaults())
                )

                // =========================
                // BASIC AUTH
                // Local development only
                // =========================
                .httpBasic(Customizer.withDefaults())

                .build();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService(
            @Value("${app.security.username:product_admin}")
            String username,

            @Value("${app.security.password:product_pass}")
            String password
    ) {

        PasswordEncoder passwordEncoder =
                PasswordEncoderFactories.createDelegatingPasswordEncoder();

        UserDetails user =
                User.withUsername(username)
                        .password(passwordEncoder.encode(password))
                        .roles("PRODUCT_RW")
                        .build();

        return new InMemoryUserDetailsManager(user);
    }
}