"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Table from "../../components/admin/Table";

const dummyLogs = [
  { action: "File uploaded", user: "Alice", date: "2025-11-19", ip: "192.168.1.1" },
  { action: "User banned", user: "Bob", date: "2025-11-18", ip: "192.168.1.2" },
];

export default function AdminLogsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Moderation Logs</h1>
        <Table
          columns={["action", "user", "date", "ip"]}
          data={dummyLogs}
        />
      </main>
    </div>
  );
}
