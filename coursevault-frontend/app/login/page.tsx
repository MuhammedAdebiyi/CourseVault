"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token/`, // replace with your DRF token endpoint
        { email, password }
      );

      // Store tokens in localStorage (or cookies)
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Login to access your courses and PDFs
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-black mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-black mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Login
          </button>
        </form>

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
