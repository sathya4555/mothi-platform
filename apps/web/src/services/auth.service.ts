import { api, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/services/api";
import { jwtDecode } from "jwt-decode";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

const USER_DATA_KEY = "user_data";

export type AdminUserRole = "admin" | "agent" | "coordinator";
export interface AdminUserLite {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  },

  async refresh(): Promise<{ accessToken: string; refreshToken?: string }> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error("No refresh token");
    const { data } = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    if (data?.accessToken)
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data?.refreshToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  },

  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },

  getAccessTokenExpiryMs(): number | null {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return null;
      const payload: any = jwtDecode(token);
      if (!payload?.exp) return null;
      return payload.exp * 1000;
    } catch {
      return null;
    }
  },

  // Admin users
  async adminListUsers(role?: AdminUserRole, search?: string) {
    const { data } = await api.get("/users", { params: { role, search } });
    return data as AdminUserLite[];
  },
  async adminCreateUser(input: {
    name: string;
    email: string;
    phone: string;
    role: AdminUserRole;
  }) {
    const { data } = await api.post("/auth/create-user", input);
    return data as {
      message: string;
      user: any;
      setupToken: string;
    };
  },
  async adminUpdateUser(
    id: number,
    updates: Partial<{ role: AdminUserRole; isActive: boolean }>
  ) {
    const { data } = await api.patch(`/users/${id}`, updates);
    return data;
  },
  async adminDeleteUser(id: number) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
  async adminGenerateResetLink(userId: number) {
    const { data } = await api.post("/auth/reset-link", { userId });
    return data as { setupToken: string };
  },

  // Onboarding
  async fetchSetupInfo(token: string) {
    const { data } = await api.post("/auth/setup-info", { token });
    return data as { id: number; email: string; name: string; phone: string };
  },
  async completeSetup(payload: {
    token: string;
    name: string;
    phone: string;
    password: string;
  }) {
    const { data } = await api.post("/auth/setup-password", payload);
    return data as { message: string };
  },
};
