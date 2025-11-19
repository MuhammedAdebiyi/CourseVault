"use client";
import { useState } from "react";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match!");
    alert("Password changed (dummy)");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Change Password</h1>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Change Password</button>
      </form>
    </div>
  );
}
