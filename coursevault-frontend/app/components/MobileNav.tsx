"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiFolder, BiHome, BiUser } from "react-icons/bi";

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around bg-white border-t p-2 md:hidden shadow-t">
      <Link href="/dashboard" className={`flex flex-col items-center text-xs ${isActive("/dashboard") ? "text-black font-bold" : "text-gray-500"}`}>
        <BiHome size={24} />
        Home
      </Link>

      <Link href="/folders" className={`flex flex-col items-center text-xs ${isActive("/folders") ? "text-black font-bold" : "text-gray-500"}`}>
        <BiFolder size={24} />
        Folders
      </Link>

      <Link href="/profile" className={`flex flex-col items-center text-xs ${isActive("/profile") ? "text-black font-bold" : "text-gray-500"}`}>
        <BiUser size={24} />
        Profile
      </Link>
    </div>
  );
}
