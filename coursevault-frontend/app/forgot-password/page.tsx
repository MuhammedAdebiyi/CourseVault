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
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)] relative">
      {/* Global Loader */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Sending reset code...</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#111] p-6 rounded shadow-md w-96 relative z-10"
      >
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
          Forgot Password
        </h1>

        {error && (
          <p className="text-red-500 mb-3 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 mb-3 text-center">
            Password reset code sent! Check your email.
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          Send Reset Code
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
