package com.ecotrack.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // Simple protected endpoint to verify JWT authentication
    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser() {
        // Retrieve the authenticated user's details from SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return ResponseEntity.ok("Authenticated as: " + userEmail);
    }
}
