"use client";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminSettingsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">System Settings</h1>
        <form className="flex flex-col gap-4 max-w-md">
          <input type="text" placeholder="Trial Period (days)" className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Monthly Fee" className="border px-2 py-1 rounded" />
          <select className="border px-2 py-1 rounded">
            <option>Enable Feature X</option>
            <option>Disable Feature X</option>
          </select>
          <button className="px-4 py-2 bg-green-500 text-white rounded">Save Settings</button>
        </form>
      </main>
    </div>
  );
}
