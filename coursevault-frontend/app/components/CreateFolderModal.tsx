"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; parentId?: string | number | null }) => Promise<void>;
  parentId?: string | number | null;
}

export default function CreateFolderModal({ open, onClose, onCreate, parentId }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onCreate({ name, parentId });
    setName("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">New Folder</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
