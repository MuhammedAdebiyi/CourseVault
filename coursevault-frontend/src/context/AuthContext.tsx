"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  is_premium?: boolean;
  created_at: string;
  is_subscribed?: boolean;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  error?: string;
  attempts_remaining?: number;
};

type AuthContextType = {
  user: User | null;
  loadingUser: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  const checkSubscription = (user: User) => {
    if (!user) return false;
    const created = new Date(user.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 30 && !user.is_subscribed;
  };

  // Load user on mount
  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) {
      setLoadingUser(false);
      return;
    }

    api
      .get("/auth/me/")
      .then((res) => {
        setUser(res.data);
        if (checkSubscription(res.data)) {
          router.push("/pricing");
        }
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        logout();
      })
      .finally(() => setLoadingUser(false));
  }, []);

  // Auto-refresh token every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return;

      api
        .post("/auth/token/refresh/", { refresh })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access);
        })
        .catch(() => {
          console.error("Token refresh failed");
          logout();
        });
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setLoadingUser(true);
    
    try {
      // Call the token endpoint
      const res = await api.post("/auth/token/", { email, password });
      
      // Store tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Fetch user data
      const userRes = await api.get("/auth/me/");
      setUser(userRes.data);

      // Check if user needs to pay (trial expired and no subscription)
      if (userRes.data.trial_days_remaining === 0 && !userRes.data.subscription_active) {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Extract error details from response
      const errorData = error.response?.data;
      const statusCode = error.response?.status;
      
      let message = "Something went wrong. Please try again.";
      let errorType = "unknown";
      let attemptsRemaining = undefined;
      
      if (errorData) {
        // Handle different error formats
        message = errorData.detail || errorData.error || errorData.message || message;
        errorType = errorData.error || "error";
        attemptsRemaining = errorData.attempts_remaining;
      }
      
      // Handle specific status codes
      if (statusCode === 429) {
        message = errorData?.detail || "Too many login attempts. Please try again later.";
        errorType = "rate_limited";
      } else if (statusCode === 400 || statusCode === 401) {
        // Invalid credentials
        if (!errorData?.detail) {
          message = "Invalid email or password";
        }
      } else if (statusCode === 500) {
        message = "Server error. Please try again later.";
        errorType = "server_error";
      }
      
      return { 
        success: false, 
        message,
        error: errorType,
        attempts_remaining: attemptsRemaining
      };
      
    } finally {
      setLoadingUser(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me/");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};