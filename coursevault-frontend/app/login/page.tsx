"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import GlobalLoader from "../components/LoadingSpinner";

export default function LoginPage() {
  const { login, loadingUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setAttemptsRemaining(undefined);
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || "Login failed");
        if (result.attempts_remaining !== undefined) {
          setAttemptsRemaining(result.attempts_remaining);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser) return <GlobalLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {isSubmitting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Signing in...</p>
        </div>
      )}

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-1">CourseVault</h1>
        <p className="text-center text-gray-700 mb-4">Your secure PDF organizer for courses</p>
        <p className="text-center text-gray-900 font-semibold mb-6 text-lg">Welcome Back</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              {attemptsRemaining !== undefined && attemptsRemaining > 0 && (
                <p className="text-xs text-red-700 mt-1">
                  {attemptsRemaining} {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-black mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || loadingUser}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-black mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || loadingUser}
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 text-black border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-black font-semibold underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            disabled={isSubmitting || loadingUser}
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-700 mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-black font-semibold underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
