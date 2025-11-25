"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/utils/api";
import { useAuth } from "@/src/context/AuthContext";

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend code
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;

    const codeArr = code.split("");
    while (codeArr.length < 6) codeArr.push("");
    codeArr[idx] = val;
    setCode(codeArr.join(""));

    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // SUBMIT CODE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    if (!email) {
      setError("Email is missing. Please register again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify code - FIXED: Only call once with correct path
      const res = await api.post("/auth/verify-email/", { email, code });
      
      // Store tokens returned from backend
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err?.response?.data?.detail || err?.response?.data?.error || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // RESEND CODE
  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError("");

    try {
      await api.post("/auth/resend-code/", { email }); // FIXED: Added /auth/
      setTimer(30);
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err?.response?.data?.detail || "Could not resend the code. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Enter Verification Code</h1>
      <p className="text-gray-600 mb-4 text-center">
        We've sent a 6-digit code to <span className="font-semibold">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[...Array(6)].map((_, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => { inputsRef.current[idx] = el; }}
              value={code[idx] || ""}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-center border border-gray-300 rounded text-lg focus:outline-none focus:ring-2 focus:ring-black"
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mt-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-4 text-center">
          {timer > 0 ? (
            <p className="text-gray-500">
              Didn't get the code? Resend in <span className="font-semibold">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              className="text-blue-600 font-semibold disabled:opacity-50 hover:underline"
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}