"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/api";
import GlobalLoader from "../components/LoadingSpinner";
import SuccessDialog from "../components/SuccessDialog";

export default function SignUpPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // Error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register/", { name, email, password }); // FIXED: Added /auth/

      // Show success dialog
      setSuccessDialog(true);
      setLoading(false);

      // Auto-close dialog & redirect to verify email
      setTimeout(() => {
        setSuccessDialog(false);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2500);
    } catch (err: any) {
      setLoading(false);
      console.error("Registration error:", err.response?.data || err.message);
      
      // Extract error message
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.response?.data?.message ||
                          "Registration failed. Please try again.";
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {/* Global Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Registering...</p>
        </div>
      )}

      {/* Success Dialog */}
      {successDialog && (
        <SuccessDialog
          title="Registration Successful!"
          description="Please check your email to verify your account."
        />
      )}

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Your secure PDF organizer for courses
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-black mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="relative">
            <label className="block text-black mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-black mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            disabled={loading}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-700 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-black font-semibold underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}