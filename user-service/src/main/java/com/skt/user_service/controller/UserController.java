package com.skt.user_service.controller;

import com.skt.user_service.model.User;
import com.skt.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 🔹 First login sync
    @PostMapping("/sync")
    public User sync(@AuthenticationPrincipal Jwt jwt) {
        return userService.syncUser(jwt);
    }

    // 🔹 Get current user
    @GetMapping("/me")
    public String getUser(@AuthenticationPrincipal Jwt jwt) {
        return jwt.getClaim("preferred_username");
    }
}