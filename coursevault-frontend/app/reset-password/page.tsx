"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../utils/api";
import GlobalLoader from "../components/LoadingSpinner";
import { Eye, EyeSlash } from "react-bootstrap-icons";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/password-reset-confirm/", {
        email,
        code,
        password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)] relative">
      {/* Global Loader */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Resetting password...</p>
        </div>
      )}

      <form className="bg-white dark:bg-[#111] p-6 rounded shadow-md w-96 relative z-10" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Reset Password</h1>

        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-3 text-center">Password reset successfully! Redirecting to login...</p>}

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        <div className="relative mb-3">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeSlash /> : <Eye />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-black text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          Reset Password
        </button>

        <div className="mt-3 text-sm text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-500 underline"
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  );
}
