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
  is_staff: boolean;
  created_at: string;
  is_subscribed?: boolean;
  trial_days_remaining?: number;
  subscription_active?: boolean;
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
  login: (emailOrToken: string, password?: string) => Promise<LoginResponse>;
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
        if (checkSubscription(res.data)) router.push("/pricing");
      })
      .catch(() => logout())
      .finally(() => setLoadingUser(false));
  }, []);

  // Auto-refresh token every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return;

      api
        .post("/auth/token/refresh/", { refresh })
        .then((res) => localStorage.setItem("access_token", res.data.access))
        .catch(() => logout());
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

  const login = async (emailOrToken: string, password?: string): Promise<LoginResponse> => {
    setLoadingUser(true);
    try {
      if (password) {
        const res = await api.post("/auth/token/", { email: emailOrToken, password });
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
      } else {
        // Login with access token only
        localStorage.setItem("access_token", emailOrToken);
      }

      const userRes = await api.get("/auth/me/");
      setUser(userRes.data);

      if (userRes.data.trial_days_remaining === 0 && !userRes.data.subscription_active) {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
    } catch (error: any) {
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.detail || errorData?.error || "Something went wrong",
        error: errorData?.error || "unknown",
        attempts_remaining: errorData?.attempts_remaining,
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
    } catch {
      console.error("Failed to refresh user");
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
