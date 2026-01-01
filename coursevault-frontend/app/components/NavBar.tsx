"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { List } from "react-bootstrap-icons";
import SearchBar from "./SearchBar";
import { FiUser } from "react-icons/fi";


import {
  FiHome,
  FiFolder,
  FiTrash2,
  FiSearch,
  FiClock,
  FiHeart,
  FiCompass,
  FiMail,
} from "react-icons/fi";

type Props = {
  showBottomNav?: boolean;
};

export default function Navbar({ showBottomNav = false }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    logout();
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center gap-4">
        
          <span className="font-semibold text-xl">CourseVault</span>

        {/* Desktop SearchBar */}
        <div className="hidden md:block w-1/3">
          <SearchBar />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {!user ? (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/signup" className="hover:underline">Sign Up</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600">
                <FiHome size={18} /> Home
              </Link>

              <Link href="/folders" className="flex items-center gap-2 hover:text-blue-600">
                <FiFolder size={18} /> Folders
              </Link>

              <Link href="/library" className="flex items-center gap-2 hover:text-blue-600">
                <FiHeart size={18} /> Library
              </Link>

              <Link href="/discover" className="flex items-center gap-2 hover:text-blue-600">
                <FiCompass size={18} /> Discover
              </Link>

              <Link href="/recent" className="flex items-center gap-2 hover:text-blue-600">
                <FiClock size={18} /> Recent
              </Link>

              <Link href="/search" className="flex items-center gap-2 hover:text-blue-600">
                <FiSearch size={18} /> Search
              </Link>

              <Link href="/profile" className="flex items-center gap-2 hover:text-blue-600">
                <FiUser size={18} /> Profile
              </Link>

              <Link href="/trash" className="flex items-center gap-2 hover:text-blue-600">
                <FiTrash2 size={18} /> Trash
              </Link>
              <Link href="/contact" className="flex items-center gap-2 hover:text-blue-600">
                <FiMail size={18} /> Contact
              </Link>

              <button
                onClick={handleLogout}
                className="hover:underline text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)}>
            <List size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <aside className="fixed top-0 left-0 z-50 w-3/4 max-w-xs h-full bg-white shadow-lg p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="text-lg font-bold">
                CourseVault
              </Link>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-5 text-lg">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiHome size={20} /> Home
                  </Link>

                  <Link href="/folders" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiFolder size={20} /> All Folders
                  </Link>

                  <Link href="/library" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiHeart size={20} /> My Library
                  </Link>

                  <Link href="/discover" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiCompass size={20} /> Discover
                  </Link>

                  <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiClock size={20} /> Recent Files
                  </Link>

                  <Link href="/search" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiSearch size={20} /> Search
                  </Link>
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiUser size={20} /> Profile
                  </Link>
                  <Link href="/trash" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <FiTrash2 size={20} /> Trash
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="text-red-500 text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
