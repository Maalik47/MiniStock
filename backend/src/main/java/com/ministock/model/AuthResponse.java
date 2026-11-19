package com.ministock.model;

public class AuthResponse {

    private final String token;
    private final String email;
    private final long expiresIn;

    public AuthResponse(String token, String email, long expiresIn) {
        this.token = token;
        this.email = email;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public long getExpiresIn() {
        return expiresIn;
    }
}
