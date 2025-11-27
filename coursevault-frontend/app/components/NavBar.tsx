"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { List } from "react-bootstrap-icons";
import SearchBar from "./SearchBar"; 
import { FiTrash2 } from 'react-icons/fi';

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
        {/* Logo */}
        <Link href="/" className="text-lg font-bold">
          CourseVault
        </Link>

        {/* Desktop SearchBar centered */}
        <div className="hidden md:block w-1/3">
          <SearchBar />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-4 items-center">
          {!user ? (
            <>
              <Link href="/login" className="text-sm hover:underline">Login</Link>
              <Link href="/signup" className="text-sm hover:underline">Sign Up</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm hover:underline">DashBoard</Link>
              <Link href="/folders" className="text-sm hover:underline">Folders</Link>
              <Link href="/profile" className="text-sm hover:underline">Profile</Link>
              <Link href="/trash" className="flex items-center gap-2 p-2 hover:bg-gray-100">
        <FiTrash2 />
        Trash
      </Link>
              <button onClick={handleLogout} className="text-sm hover:underline">Logout</button>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)}>
            <List size={28} />
          </button>
        </div>
      </header>

      {/* Mobile sidebar */}
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

            {/* Mobile SearchBar */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col space-y-4">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  <Link href="/folders" onClick={() => setOpen(false)}>Folders</Link>
                  <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>
                  <Link href="/trash" className="flex items-center gap-2 p-2 hover:bg-gray-100">
                  <FiTrash2 />
                  Trash
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
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
