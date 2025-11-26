"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import GlobalLoader from "../components/LoadingSpinner";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await api.post("/auth/password-reset/", { email });
      setSuccess(true);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {/* Global Loader */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Sending reset code...</p>
        </div>
      )}

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              Password reset code sent! Check your email.
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-black mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
            disabled={loading}
          >
            Send Reset Code
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-gray-700 mt-4">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-black font-semibold underline"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
