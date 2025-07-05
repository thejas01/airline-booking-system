package com.thejas.flight_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers("/actuator/**").permitAll() // Optional for health checks
            .requestMatchers("/api/flights/search", "/api/flights").hasAnyRole("USER", "ADMIN")
            .requestMatchers("/api/flights/add").hasRole("ADMIN")
            .requestMatchers("/api/flights/{id}").hasAnyRole("USER", "ADMIN")
            .requestMatchers("/api/flights/reduceSeats").hasAnyRole("ADMIN", "USER")
            .requestMatchers("/api/admin/**").hasRole("ADMIN")

            .anyRequest().permitAll()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
