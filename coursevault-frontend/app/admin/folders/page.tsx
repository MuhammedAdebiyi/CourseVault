"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";

const dummyFolders = [
  { name: "Math", owner: "Alice", created: "2025-11-01" },
  { name: "Physics", owner: "Bob", created: "2025-11-05" },
];

export default function AdminFoldersPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Folders Management</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Folder
        </button>
        <Table
          columns={["name", "owner", "created"]}
          data={dummyFolders}
        />
        <Modal title="Add Folder" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <form className="flex flex-col gap-2">
            <input type="text" placeholder="Folder Name" className="border px-2 py-1 rounded" />
            <button className="px-4 py-2 bg-green-500 text-white rounded mt-2">Create</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
