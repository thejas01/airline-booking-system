package com.thejas.user_service.dto.response;

import lombok.*;

@Getter
@Setter



@Builder
@ToString
public class JwtResponse {
    private String token;
    private String refreshToken;

    public JwtResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }
}