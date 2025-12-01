"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/api";
import GlobalLoader from "../components/LoadingSpinner";
import SuccessDialog from "../components/SuccessDialog";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Unverified email handling
  const [showUnverifiedError, setShowUnverifiedError] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendingCode, setResendingCode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setShowUnverifiedError(false);
  };

  const handleResendCode = async () => {
    if (!unverifiedEmail) return;
    setResendingCode(true);
    setLoading(true); // Show global loader
    setErrors({});

    try {
      await api.post("/auth/resend-code/", { email: unverifiedEmail });
      setLoading(false);
      router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err: any) {
      setResendingCode(false);
      setLoading(false);
      setErrors({
        general:
          err.response?.data?.email?.[0] ||
          err.response?.data?.error ||
          "Failed to resend verification code",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setShowUnverifiedError(false);

    // Local validation
    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: "Passwords do not match" });
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters long" });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/register/", formData);

      // Stop loader, show success dialog, redirect
      setLoading(false);
      setShowSuccessDialog(true);

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch (err: any) {
      const data = err.response?.data || {};

      // Email exists but unverified
      if (data.error_type === "unverified_email") {
        setShowUnverifiedError(true);
        setUnverifiedEmail(data.email);
        setErrors({ general: data.message });
        setLoading(false);
        return;
      }

      // Standard validation errors
      setErrors({
        email: data.email?.[0] || data.email,
        name: data.name?.[0] || data.name,
        password: data.password?.[0] || data.password,
        confirm_password: data.confirm_password?.[0] || data.confirm_password,
        general: data.error || data.detail || "Registration failed. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Processing...</p>
        </div>
      )}

      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        message="Registration successful! Please check your email to verify your account."
      />

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Your secure PDF organizer for courses
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error / Unverified Email */}
          {errors.general && (
            <div
              className={`px-4 py-3 rounded ${
                showUnverifiedError
                  ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <p>{errors.general}</p>
              {showUnverifiedError && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendingCode}
                  className="mt-2 w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {resendingCode ? "Sending..." : "Resend Verification Code"}
                </button>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-black mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-black mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-black mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              className={`w-full border px-3 py-2 rounded pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-black mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="••••••••"
              className={`w-full border px-3 py-2 rounded pr-10 ${errors.confirm_password ? "border-red-500" : "border-gray-300"}`}
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
            {errors.confirm_password && <p className="text-red-600 text-sm mt-1">{errors.confirm_password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            {loading ? "Processing..." : "Sign Up"}
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
