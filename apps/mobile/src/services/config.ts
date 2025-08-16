import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For development using localhost
export const API_BASE_URL = "https://mothi-platform.railway.app";

// For testing on physical device or other machines in the network
// export const API_BASE_URL = 'http://YOUR_MACHINE_IP:3000';

// For production
// export const API_BASE_URL = 'https://api.yourproduction.com';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

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
