"use client";

import RecentFiles from "@/app/components/RecentFiles";

export default function RecentPage() {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Recent Activity</h1>
        <RecentFiles />
      </div>
    </main>
  );
}