"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Registration successful! Please verify your email.");
        // Redirect to verify-email page with email query param
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        alert(data.detail || JSON.stringify(data));
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">CourseVault</h1>
        <p className="text-center text-gray-700 mb-6">
          Your secure PDF organizer for courses
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-black mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
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
