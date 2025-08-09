import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const r = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = r.data || {};
          if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          if (newRefreshToken)
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch (_) {
          // fall through to logout/redirect below
        }
      }
    }
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {}
      if (typeof window !== "undefined") {
        const current = window.location.pathname + window.location.search;
        const loginUrl = `/login?next=${encodeURIComponent(current)}`;
        if (window.location.pathname !== "/login") {
          window.location.replace(loginUrl);
        }
      }
    }
    return Promise.reject(error);
  }
);
