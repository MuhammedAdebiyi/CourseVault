"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
  loadingUser: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  // Helper: check free trial
  const checkSubscription = (user: any) => {
    if (!user) return false;

    const created = new Date(user.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));

    return diffDays >= 30 && !user.is_subscribed;
  };

  // Load user on page refresh
  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) {
      setLoadingUser(false);
      return;
    }

    api
      .get("me/")
      .then((res) => {
        const userData = res.data;
        setUser(userData);

        if (checkSubscription(userData)) {
          router.push("/pricing");
        }
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
        .post("refresh/", { refresh })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access);
        })
        .catch(() => logout());
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setLoadingUser(true);
    try {
      const res = await api.post("login/", { email, password });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      const me = await api.get("me/");
      setUser(me.data);

      // Redirect based on free trial
      if (checkSubscription(me.data)) {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.detail || "Invalid email or password",
      };
    } finally {
      setLoadingUser(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
