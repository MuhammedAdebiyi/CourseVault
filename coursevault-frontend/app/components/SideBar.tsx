"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { HiOutlineMenu, HiX } from "react-icons/hi";

interface SidebarProps {
  foldersCount?: number; // Add this
}

export default function Sidebar({ foldersCount }: SidebarProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Mobile hamburger */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow">
        <span className="font-bold text-xl">CourseVault</span>
        <button onClick={() => setOpen(!open)}>
          {open ? <HiX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-gray-100 dark:bg-gray-900 md:block fixed md:relative top-0 left-0 h-full w-64 p-6 transition-transform transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard {foldersCount !== undefined ? `(${foldersCount})` : ""}
          </Link>
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1 mt-4 bg-black text-white rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
