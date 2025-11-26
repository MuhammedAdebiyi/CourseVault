"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../utils/api";
import GlobalLoader from "../components/LoadingSpinner";
import { Eye, EyeSlash } from "react-bootstrap-icons";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Handle 6-digit code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;

    const codeArr = code.split("");
    while (codeArr.length < 6) codeArr.push("");

    codeArr[idx] = val;
    setCode(codeArr.join(""));

    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/password-reset/confirm/", {
        email,
        code,
        new_password: newPassword,
      });

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Invalid code or reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">

      {/* Global Loader */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">Resetting password...</p>
        </div>
      )}

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-center text-gray-700 mb-4">
          Enter the code sent to <span className="font-semibold">{email}</span>
        </p>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-center mb-4">
            Password reset successful! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Code Input */}
            <div>
              <label className="block text-black mb-1">Verification Code</label>
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, idx) => (
                 <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  value={code[idx] || ""}
                  onChange={(e) => handleCodeChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-10 h-10 border border-gray-300 rounded text-center text-lg"
                  disabled={loading}
                />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-black mb-1">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-black mb-1">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showConfirm ? <EyeSlash /> : <Eye />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              Reset Password
            </button>
          </form>
        )}

        {/* Back to login */}
        <p className="text-center text-gray-700 mt-4">
          Remember your password?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-semibold underline text-black"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
