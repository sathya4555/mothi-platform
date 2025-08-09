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
