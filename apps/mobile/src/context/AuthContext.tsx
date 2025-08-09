import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../services/storage";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_KEY, USER_DATA_KEY } from "../services/auth.service";
import { authService } from "../services/auth.service";
import type { LoginCredentials } from "../services/auth.service";

interface User {
  id: number;
  email: string;
  role: "admin" | "coordinator" | "agent";
  name: string;
}

interface DecodedToken {
  sub: number;
  email: string;
  role: User["role"];
  name: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signInLocal: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        storage.getItem(ACCESS_TOKEN_KEY),
        storage.getItem(USER_DATA_KEY),
      ]);
      if (storedToken) {
        try {
          await signIn(storedToken);
        } catch {
          await signOut();
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);

      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        throw new Error("Token expired");
      }

      const userData: User = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      };

      await storage.setItem(ACCESS_TOKEN_KEY, newToken);
      await storage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error("Error signing in:", error);
      await signOut();
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { accessToken } = await authService.login(credentials);
      await signIn(accessToken);
    } catch (e) {
      throw e as Error;
    }
  };

  const signInLocal = async (userData: User) => {
    await storage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    try {
      await storage.multiRemove([ACCESS_TOKEN_KEY, USER_DATA_KEY]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    signIn,
    signInLocal,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
