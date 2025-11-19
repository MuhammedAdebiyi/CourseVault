"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";

const dummyFiles = [
  { title: "Lecture 1", folder: "Math", uploader: "Alice", date: "2025-11-19", tags: "PDF" },
  { title: "Lecture 2", folder: "Physics", uploader: "Bob", date: "2025-11-18", tags: "PDF" },
];

export default function AdminFilesPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Files Management</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setModalOpen(true)}
        >
          Add File
        </button>
        <Table
          columns={["title", "folder", "uploader", "date", "tags"]}
          data={dummyFiles}
        />
        <Modal title="Add File" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <form className="flex flex-col gap-2">
            <input type="text" placeholder="Title" className="border px-2 py-1 rounded" />
            <input type="text" placeholder="Folder" className="border px-2 py-1 rounded" />
            <input type="text" placeholder="Uploader" className="border px-2 py-1 rounded" />
            <input type="text" placeholder="Tags" className="border px-2 py-1 rounded" />
            <button className="px-4 py-2 bg-green-500 text-white rounded mt-2">Save</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
