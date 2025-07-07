package com.thejas.user_service.service;

import java.util.HashMap;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {

    private HashMap<String, String> refreshTokenStore = new HashMap<>();

    public String createRefreshToken(String email) {
        String refreshToken = UUID.randomUUID().toString();
        refreshTokenStore.put(refreshToken, email);
        return refreshToken;
    }

    public String validateRefreshToken(String refreshToken) {
        return refreshTokenStore.get(refreshToken);
    }

    public void deleteRefreshToken(String refreshToken) {
        refreshTokenStore.remove(refreshToken);
    }
}
