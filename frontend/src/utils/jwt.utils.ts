import type { User } from '../types/auth.types';

export const jwtDecode = (token: string): User => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    // Map JWT payload to User structure based on the backend implementation
    return {
      id: payload.id || 0,
      email: payload.sub || payload.email,
      name: payload.name || payload.sub?.split('@')[0] || 'User', // Fallback to email username
      role: payload.role || 'USER',
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Invalid token');
  }
};