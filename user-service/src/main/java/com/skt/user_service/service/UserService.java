package com.skt.user_service.service;

import com.skt.user_service.model.User;
import com.skt.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User syncUser(Jwt jwt) {

        String keycloakId = jwt.getSubject();
        String username = jwt.getClaim("preferred_username");
        String email = jwt.getClaim("email");

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    User user = User.builder()
                            .keycloakId(keycloakId)
                            .username(username)
                            .email(email)
                            .build();

                    return userRepository.save(user);
                });
    }
}