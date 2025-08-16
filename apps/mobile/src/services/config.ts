import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration for Mobile App
export const API_CONFIG = {
  // Backend URL - Railway production
  BASE_URL: "https://mothi-platform-production.up.railway.app",

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      PROFILE: "/auth/profile",
    },
    USERS: "/users",
    PARTIES: "/parties",
    PRODUCTS: "/products",
    SUBcategories: "/products/subcategories",
    PURCHASES: "/purchases",
  },

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.BASE_URL;

// Request interceptor to add auth token
axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("authToken");
      // You might want to trigger a navigation to login screen here
      // or emit an event that your app can listen to
    }
    return Promise.reject(error);
  }
);
