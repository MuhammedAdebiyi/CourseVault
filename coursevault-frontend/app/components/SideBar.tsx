"use client";

import { useState } from "react";
import Link from "next/link";
import { List } from "react-bootstrap-icons";

interface SidebarProps {
  foldersCount: number;
  activePage?: string;
}

export default function Sidebar({ foldersCount, activePage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: "Dashboard", slug: "dashboard", href: "/dashboard" },
    { label: "Profile", slug: "profile", href: "/profile" },
    { label: `Folders (${foldersCount})`, slug: "folders", href: "/folders" },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="sm:hidden p-4 flex justify-between items-center bg-white shadow">
        <h2 className="font-bold">CourseVault</h2>
        <button onClick={toggleSidebar}><List size={28} /></button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white w-64 p-4 border-r sm:block fixed sm:static h-full overflow-auto transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        <h2 className="text-xl font-bold mb-6 hidden sm:block">CourseVault</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.slug}
              className={`p-2 rounded hover:bg-blue-100 ${
                activePage === item.slug ? "bg-blue-500 text-white" : ""
              }`}
            >
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <p className="mt-auto text-gray-500 text-sm hidden sm:block">© 2025 CourseVault</p>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden" onClick={toggleSidebar} />}
    </>
  );
}
