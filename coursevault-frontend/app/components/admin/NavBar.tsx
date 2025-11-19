"use client";
import { HiOutlineBell, HiOutlineUser } from "react-icons/hi";

export default function Navbar() {
  return (
    <div className="flex justify-end items-center gap-4 p-4 bg-white dark:bg-[#111] border-b">
      <HiOutlineBell size={24} className="text-[var(--foreground)]" />
      <div className="flex items-center gap-2">
        <HiOutlineUser size={24} className="text-[var(--foreground)]" />
        <span className="text-[var(--foreground)] font-medium">Admin</span>
      </div>
    </div>
  );
}
