"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/utils/api";
import GlobalLoader from "@/app/components/LoadingSpinner";
import SuccessDialog from "@/app/components/SuccessDialog";
import { useAuth } from "@/src/context/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { login } = useAuth();

  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) router.push("/signup");
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && newCode.every((d) => d !== "")) handleVerify(newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-email/", { email, code: verificationCode });
      setSuccessMessage(res.data.message || "Email verified successfully!");
      setShowSuccessDialog(true);

      try {
        await login(res.data.access); // Safe login
      } catch {
        // ignore login errors
      }

      setCode(Array(6).fill(""));
    } catch (err: any) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Invalid verification code.";
      setError(msg);
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/resend-code/", { email });
      setSuccessMessage("Verification code sent! Check your email.");
      setResendCooldown(60);
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error || "Failed to resend code.";
      setError(msg);
    } finally {
      setResendLoading(false);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loader only when loading or resending */}
      {(loading || resendLoading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <GlobalLoader />
          <p className="mt-4 text-white text-lg">{resendLoading ? "Resending..." : "Verifying..."}</p>
        </div>
      )}

      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        message={successMessage}
      />

      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white border border-gray-200 p-8 rounded-xl shadow-lg">
          <h2 className="text-center text-3xl font-bold text-black">Verify Your Email</h2>
          <p className="mt-2 text-center text-sm text-gray-700">We sent a 6-digit code to</p>
          <p className="text-center text-sm font-semibold text-black">{email}</p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {successMessage && !showSuccessDialog && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-center">
              {successMessage}
            </div>
          )}

          <div className="flex justify-center gap-2 mt-6">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
  inputRefs.current[idx] = el;
}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                disabled={loading || resendLoading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || resendLoading || code.some((d) => !d)}
            className="w-full mt-4 py-3 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-700">
              Didn’t receive the code?{" "}
              <button
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="font-medium text-black underline disabled:text-gray-400"
              >
                {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </p>
          </div>

          <div className="text-center mt-2">
            <button onClick={() => router.push("/signup")} className="text-sm text-gray-700 hover:text-black">
              ← Back to Signup
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg text-center text-xs text-gray-700">
            Code expires in 10 minutes. Check your spam folder if you don’t see the email.
          </div>
        </div>
      </div>
    </>
  );
}
