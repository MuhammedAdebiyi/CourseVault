"use client";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const links = [
    { name: "Dashboard", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Files", href: "/admin/files" },
    { name: "Folders", href: "/admin/folders" },
    { name: "Subscriptions", href: "/admin/subscriptions" },
    { name: "Analytics", href: "/admin/analytics" },
    { name: "Logs", href: "/admin/logs" },
    { name: "Settings", href: "/admin/settings" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      <aside
        className={`fixed md:relative z-40 bg-white dark:bg-[#111] border-r min-h-screen p-4 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">CourseVault Admin</h2>
        <nav className="flex flex-col space-y-3">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
