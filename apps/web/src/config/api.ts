// API Configuration
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
