"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import GlobalLoader from "../components/LoadingSpinner";

export default function LoginPage() {
  const { login, loadingUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // reset previous
    setError("");
    setAttemptsRemaining(undefined);
    setIsSubmitting(true);

    // validations
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
      // success redirect handled in AuthContext
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser) return <GlobalLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Login to access your courses and PDFs
        </p>

        {/* ERROR BOX */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded p-3 text-center mb-4">
            <p className="font-medium">{error}</p>
            {attemptsRemaining !== undefined && attemptsRemaining > 0 && (
              <p className="text-xs mt-1">
                {attemptsRemaining}{" "}
                {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:bg-gray-500"
            disabled={isSubmitting || loadingUser}
          >
            {isSubmitting || loadingUser ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-gray-700 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-black font-semibold underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
