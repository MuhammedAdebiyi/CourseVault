"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiFolder, BiHome, BiUser } from "react-icons/bi";

interface SidebarProps {
  foldersCount?: number;
}

export default function Sidebar({ foldersCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:flex flex-col">
      <h2 className="text-2xl font-bold mb-6">CourseVault</h2>

      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 px-3 py-2 rounded ${
            isActive("/dashboard") ? "bg-black text-white" : "text-black hover:bg-gray-100"
          }`}
        >
          <BiHome size={20} /> Dashboard
        </Link>

        <Link
          href="/folders"
          className={`flex items-center justify-between px-3 py-2 rounded ${
            isActive("/folders") ? "bg-black text-white" : "text-black hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center gap-2"><BiFolder size={20} /> Folders</span>
          {foldersCount > 0 && (
            <span className="bg-black text-white text-xs px-2 py-0.5 rounded">{foldersCount}</span>
          )}
        </Link>

        <Link
          href="/profile"
          className={`flex items-center gap-2 px-3 py-2 rounded ${
            isActive("/profile") ? "bg-black text-white" : "text-black hover:bg-gray-100"
          }`}
        >
          <BiUser size={20} /> Profile
        </Link>
      </nav>
    </aside>
  );
}
