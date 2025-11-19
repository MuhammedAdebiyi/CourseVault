"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";

const dummyUsers = [
  { name: "Alice", email: "alice@example.com", role: "User", subscription: "Active" },
  { name: "Bob", email: "bob@example.com", role: "Admin", subscription: "Inactive" },
];

export default function AdminUsersPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Users Management</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setModalOpen(true)}
        >
          Add User
        </button>
        <Table
          columns={["name", "email", "role", "subscription"]}
          data={dummyUsers}
        />
        <Modal title="Add User" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <form className="flex flex-col gap-2">
            <input type="text" placeholder="Name" className="border px-2 py-1 rounded" />
            <input type="email" placeholder="Email" className="border px-2 py-1 rounded" />
            <select className="border px-2 py-1 rounded">
              <option>User</option>
              <option>Admin</option>
            </select>
            <button className="px-4 py-2 bg-green-500 text-white rounded mt-2">Save</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
