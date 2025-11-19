"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";

const dummySubs = [
  { user: "Alice", plan: "Free Month", status: "Active", start: "2025-11-01", due: "2025-12-01" },
  { user: "Bob", plan: "Monthly", status: "Inactive", start: "2025-10-01", due: "2025-11-01" },
];

export default function AdminSubscriptionsPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Subscriptions</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Subscription
        </button>
        <Table
          columns={["user", "plan", "status", "start", "due"]}
          data={dummySubs}
        />
        <Modal title="Add Subscription" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <form className="flex flex-col gap-2">
            <input type="text" placeholder="User" className="border px-2 py-1 rounded" />
            <input type="text" placeholder="Plan" className="border px-2 py-1 rounded" />
            <select className="border px-2 py-1 rounded">
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="px-4 py-2 bg-green-500 text-white rounded mt-2">Save</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
