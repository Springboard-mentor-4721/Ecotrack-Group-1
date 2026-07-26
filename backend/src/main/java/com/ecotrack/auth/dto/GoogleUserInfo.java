package com.ecotrack.auth.dto;

public record GoogleUserInfo(
    String googleId,
    String email,
    String name,
    boolean emailVerified
) {}
