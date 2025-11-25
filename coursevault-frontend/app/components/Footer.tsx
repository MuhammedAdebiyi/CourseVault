"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left side */}
        <div className="mb-4 md:mb-0 text-center md:text-left">
         
        </div>

        {/* Center links */}
        <div className="flex gap-4 mb-4 md:mb-0 text-sm">
           <p className="text-sm">&copy; 2025 CourseVault. All rights reserved.</p>
        </div>

        {/* Right side */}
        <div className="text-sm text-center md:text-right">
        </div>
      </div>
    </footer>
  );
}
