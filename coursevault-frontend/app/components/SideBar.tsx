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

  
  return (
    <>
     
      {/* Overlay for mobile */}
    </>
  );
}
