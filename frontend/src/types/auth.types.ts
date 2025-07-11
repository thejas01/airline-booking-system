// User entity - matches backend User model
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Login request - matches backend JwtRequest
export interface LoginRequest {
  email: string;
  password: string;
}

// Registration request - matches backend UserRequestDto
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string; // Optional, will default to USER in backend
}

// Auth response - matches backend JwtResponse
export interface AuthResponse {
  token: string;
  refreshToken: string | null;
}

// Refresh token request - matches backend RefreshTokenRequest
export interface RefreshTokenRequest {
  refreshToken: string;
}

// User response - matches backend UserResponseDto
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  aboutMe: string;
}

// JWT payload interface for decoded token
export interface JwtPayload {
  sub: string; // email
  role: string;
  name: string;
  iat: number;
  exp: number;
}