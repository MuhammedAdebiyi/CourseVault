"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password reset code sent (dummy)");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Forgot Password</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Send Reset Code</button>
        <div className="mt-3 text-sm text-center">
          <Link href="/login" className="text-blue-500">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
