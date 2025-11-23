"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [loadingUser, user]);

  if (loadingUser || !user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return <>{children}</>;
}
