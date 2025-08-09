import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService, type LoginCredentials } from "@/services/auth.service";
import { ACCESS_TOKEN_KEY } from "@/services/api";
import { jwtDecode } from "jwt-decode";

type User = {
  id: number;
  email: string;
  role: "admin" | "agent" | "coordinator";
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [refreshTimer, setRefreshTimer] = useState<number | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      window.clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  };

  const scheduleRefresh = () => {
    clearRefreshTimer();
    const expMs = authService.getAccessTokenExpiryMs();
    if (!expMs) return;
    const now = Date.now();
    // Refresh 60s before expiry, minimum 10s from now
    const delay = Math.max(10_000, expMs - now - 60_000);
    const id = window.setTimeout(async () => {
      try {
        await authService.refresh();
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        const user = deriveUserFromToken(token);
        setState((s) => ({ ...s, user, isAuthenticated: !!token }));
      } catch {
        // if refresh fails, let api interceptor handle redirect on 401
      } finally {
        scheduleRefresh();
      }
    }, delay);
    setRefreshTimer(id as unknown as number);
  };

  const deriveUserFromToken = (token: string | null): User | null => {
    try {
      if (!token) return null;
      const payload: any = jwtDecode(token);
      return {
        id: Number(payload.sub),
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const user = deriveUserFromToken(token);
    setState((s) => ({
      ...s,
      isAuthenticated: !!token,
      user,
      isLoading: false,
    }));
    scheduleRefresh();
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await authService.login(credentials);
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const user = deriveUserFromToken(token);
      setState((s) => ({
        ...s,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
      scheduleRefresh();
    } catch (e: any) {
      setState((s) => ({
        ...s,
        error: e?.message || "Login failed",
        isLoading: false,
      }));
      throw e;
    }
  };

  const logout = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    clearRefreshTimer();
    await authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state.user, state.isAuthenticated, state.isLoading, state.error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
