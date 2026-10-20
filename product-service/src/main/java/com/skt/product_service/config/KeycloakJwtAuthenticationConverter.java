
package com.skt.product_service.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

@Component
public class KeycloakJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter scopeConverter =
            new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        Collection<GrantedAuthority> scopes = scopeConverter.convert(jwt);
        if (scopes != null) {
            authorities.addAll(scopes);
        }

        // Keycloak realm roles
        Object realmClaim = jwt.getClaims().get("realm_access");

        if (realmClaim instanceof Map<?, ?> realmAccess) {
            addRoles(realmAccess.get("roles"), authorities);
        }

        // Keycloak client roles
        Object resourceClaim = jwt.getClaims().get("resource_access");

        if (resourceClaim instanceof Map<?, ?> resourceAccess) {
            for (Object clientClaim : resourceAccess.values()) {
                if (clientClaim instanceof Map<?, ?> clientAccess) {
                    addRoles(clientAccess.get("roles"), authorities);
                }
            }
        }

        String username = jwt.getClaimAsString("preferred_username");

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                username != null ? username : jwt.getSubject()
        );
    }

    private void addRoles(
            Object rolesClaim,
            Collection<GrantedAuthority> authorities) {

        if (rolesClaim instanceof Collection<?> roles) {
            for (Object role : roles) {
                if (role instanceof String roleName && !roleName.isBlank()) {
                    authorities.add(
                            new SimpleGrantedAuthority("ROLE_" + roleName)
                    );
                }
            }
        }
    }
}
