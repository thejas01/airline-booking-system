import { APIRequestContext } from '@playwright/test';

export class APIHelpers {
  private request: APIRequestContext;
  private baseURL: string;
  private authToken: string | null = null;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${this.baseURL}/auth/login`, {
      data: { email, password }
    });
    
    const data = await response.json();
    this.authToken = data.accessToken;
    return this.authToken;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return await this.request.post(`${this.baseURL}/auth/register`, {
      data: userData
    });
  }

  async getWithAuth(endpoint: string) {
    return await this.request.get(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  async postWithAuth(endpoint: string, data: any) {
    return await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  async putWithAuth(endpoint: string, data: any) {
    return await this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  async deleteWithAuth(endpoint: string) {
    return await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }
}