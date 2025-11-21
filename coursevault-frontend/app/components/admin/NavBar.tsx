"use client";
import { useState } from "react";
import { HiOutlineBell, HiOutlineUser } from "react-icons/hi";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Admin Panel</h2>
      <div className="flex items-center gap-4">
        <HiOutlineBell className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer" />
        <div className="relative">
          <HiOutlineUser
            className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg py-2">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
