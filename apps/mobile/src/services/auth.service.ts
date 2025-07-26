import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// API Configuration - Use localhost for web development
const API_BASE_URL =
  Platform.OS === "web" ? "http://localhost:3000" : "http://localhost:3000"; // Change to your backend URL

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "coordinator";
  phone: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication service class
class AuthService {
  private api: any;

  constructor() {
    // Create axios instance
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config: any) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {
                  refreshToken,
                }
              );

              const { accessToken, refreshToken: newRefreshToken } =
                response.data;

              await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
              await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token failed, logout user
            await this.logout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      // Store tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await this.api.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.log("Logout API call failed, continuing with local logout");
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);
    }
  }

  // Get stored tokens
  async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    ]);

    return { accessToken, refreshToken };
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { accessToken } = await this.getTokens();
    return !!accessToken;
  }

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Store user data
  async storeUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  // Clear user data
  async clearUserData(): Promise<void> {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get("/health");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export API instance for other services
export const api = authService.api;
