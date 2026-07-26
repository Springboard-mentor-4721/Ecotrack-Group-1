package com.ecotrack.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private String message;

    public AuthResponse(String accessToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
    }

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
