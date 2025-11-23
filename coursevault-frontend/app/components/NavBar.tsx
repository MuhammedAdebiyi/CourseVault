"use client";

import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white border-b shadow px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">CourseVault</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/profile" className="hover:underline">Profile</Link>
            <button
              onClick={logout}
              className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/signup" className="hover:underline">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
