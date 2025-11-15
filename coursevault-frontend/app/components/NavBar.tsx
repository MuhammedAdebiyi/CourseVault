"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-black">
          CourseVault
        </Link>

        <div className="space-x-6 flex items-center">
          <Link href="/login" className="px-4 py-2 border border-black rounded font-medium hover:bg-black hover:text-white transition">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 border border-black rounded font-medium hover:bg-black hover:text-white transition">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
