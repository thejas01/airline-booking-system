# Testing Issues - Authentication Required for Public Endpoints

## Problem
The API Gateway and backend services are requiring authentication for public endpoints that should be accessible without authentication:
- `/auth/register` - Returns 403 Forbidden
- `/auth/login` - Likely also returns 403 Forbidden

## Error Message
```
Authentication failed: Full authentication is required to access this resource
```

## Root Cause
The Spring Security configuration in the backend services is not properly configured to allow public access to authentication endpoints. The following endpoints should be publicly accessible:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`

## Required Fix
The backend services need to update their security configuration to permit these endpoints without authentication. In Spring Security, this typically involves:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh").permitAll()
                .anyRequest().authenticated()
            );
        // ... rest of configuration
    }
}
```

## Temporary Workaround
Until the backend is fixed, you can:
1. Manually create test users in the database
2. Skip authentication-related tests
3. Test only with pre-existing users

## Testing with Pre-existing Users
If you have users already in the database, update the test data in `tests/fixtures/test-data.ts` with valid credentials and run only the login and authenticated endpoint tests.