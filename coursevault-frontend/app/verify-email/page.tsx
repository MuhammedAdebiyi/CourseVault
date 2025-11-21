"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/utils/api";

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, ""); // only digits

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

  // Submit verification code
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
      const res = await api.post("/verify-email/", {
        email,
        code,
      });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError("");

    try {
      await api.post("/resend-code/", { email });
      setTimer(30); // reset cooldown
    } catch (err: any) {
      setError("Could not resend code. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Enter Verification Code</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[...Array(6)].map((_, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el: HTMLInputElement | null): void => {
                inputsRef.current[idx] = el;
              }}
              value={code[idx] || ""}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-center border rounded text-lg focus:outline-none focus:ring"
            />
          ))}
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {/* Resend Section */}
        <div className="mt-4 text-center">
          {timer > 0 ? (
            <p className="text-gray-500">
              Didn’t get the code? <span className="font-semibold">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              className="text-blue-600 font-semibold disabled:opacity-50"
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
