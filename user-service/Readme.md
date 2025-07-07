 API Working Method

  1. Authentication Flow

  The user service uses JWT (JSON Web Token) based authentication with refresh tokens:

  1. User Registration (/auth/create)
    - New users register with email, password, and name
    - Password is hashed using BCrypt before storing in database
    - A JWT token is immediately returned upon successful registration
  2. User Login (/auth/login)
    - Users authenticate with email and password
    - System validates credentials against the database
    - Returns both:
        - Access Token (JWT): Short-lived token for API access
      - Refresh Token: Long-lived token to get new access tokens
  3. Token Refresh (/auth/refresh-token)
    - When access token expires, use refresh token to get a new one
    - Prevents users from re-entering credentials frequently

  2. Security Implementation

  Looking at the code in SecurityConfig.java:

  .requestMatchers("/auth/login").permitAll()
  .requestMatchers("/auth/create").permitAll()
  .requestMatchers("/auth/delete").permitAll()
  .anyRequest().authenticated()

  - Public endpoints: /auth/login, /auth/create, /auth/delete
  - Protected endpoints: All other endpoints require JWT authentication

  3. JWT Authentication Filter

  The JwtAuthenticationFilter (line 131 in AuthController.java):
  1. Intercepts every request
  2. Extracts JWT token from Authorization header
  3. Validates the token
  4. Sets user authentication in Spring Security context

  4. How Each Endpoint Works

  POST /auth/create

  Request:
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }

  Response:
  {
    "token": "eyJhbGci...",
    "refreshToken": null
  }

  POST /auth/login

  Request:
  {
    "email": "user@example.com",
    "password": "password123"
  }

  Response:
  {
    "token": "eyJhbGci...",
    "refreshToken": "uuid-refresh-token"
  }

  POST /auth/refresh-token

  Request:
  {
    "refreshToken": "uuid-refresh-token"
  }

  Response:
  {
    "token": "new-jwt-token",
    "refreshToken": "same-refresh-token"
  }

  5. Token Usage for Protected Endpoints

  For any protected endpoint, include the JWT in the Authorization header:
  Authorization: Bearer eyJhbGci...

  6. Authentication Process Flow

  1. Initial Request → JWT Filter checks for token
  2. Token Validation → Verifies signature and expiration
  3. User Loading → Loads user details from database
  4. Context Setting → Sets authentication in Spring Security
  5. Request Processing → Proceeds to controller if authenticated

  The system uses stateless authentication (no server-side sessions), making it scalable for microservices
  architecture.