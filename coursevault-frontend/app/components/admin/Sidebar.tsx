"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/folders", label: "Folders" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      <button
        className="md:hidden p-2 m-2 border rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      <aside className={`bg-white dark:bg-gray-800 border-r min-h-screen p-4 ${open ? "block" : "hidden"} md:block w-64`}>
        <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-200">CourseVault Admin</h2>
        <nav className="flex flex-col space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname === link.href ? "font-bold text-blue-600 dark:text-blue-400" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
