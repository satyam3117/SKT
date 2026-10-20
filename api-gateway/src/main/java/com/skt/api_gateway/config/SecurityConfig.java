package com.skt.api_gateway.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken>
    jwtAuthenticationConverter() {

        return jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            // Preserve the standard SCOPE_ authorities.
            JwtGrantedAuthoritiesConverter scopes =
                    new JwtGrantedAuthoritiesConverter();

            Collection<GrantedAuthority> scopeAuthorities =
                    scopes.convert(jwt);

            if (scopeAuthorities != null) {
                authorities.addAll(scopeAuthorities);
            }

            // Convert Keycloak realm roles into Spring ROLE_ authorities.
            Map<String, Object> realmAccess =
                    jwt.getClaim("realm_access");

            if (realmAccess != null) {
                Object roles = realmAccess.get("roles");

                if (roles instanceof Collection<?> roleNames) {
                    for (Object roleName : roleNames) {
                        if (roleName instanceof String role
                                && !role.isBlank()) {
                            authorities.add(
                                    new SimpleGrantedAuthority("ROLE_" + role)
                            );
                        }
                    }
                }
            }

            return new JwtAuthenticationToken(
                    jwt,
                    authorities,
                    jwt.getClaimAsString("preferred_username")
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            Converter<Jwt, ? extends AbstractAuthenticationToken>
                    jwtAuthenticationConverter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/aggregate/**",
                                "/actuator/prometheus",
                                "/public/**",
                                "/uploads/**"
                        ).permitAll()

                        // Public product browsing only.
                        .requestMatchers(HttpMethod.GET, "/api/product/**")
                        .permitAll()

                        // Product mutations require ADMIN.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/product/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/product/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/product/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/product/**"
                        ).hasRole("ADMIN")

                        // Inventory operations must be administrator-only
                        // when accessed through the gateway.
                        .requestMatchers("/api/inventory/**")
                        .hasRole("ADMIN")

                        // User sync and other private routes require authentication.
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                        )
                );

        return http.build();
    }
}