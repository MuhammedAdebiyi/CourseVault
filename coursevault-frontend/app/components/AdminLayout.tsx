"use client";

import { ReactNode } from "react";
import Sidebar from "./SideBar";

type Props = { children: ReactNode };

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar foldersCount={0} activePage="dashboard" />
      <div className="flex-1 flex flex-col">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
