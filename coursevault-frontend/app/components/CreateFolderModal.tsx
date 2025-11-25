"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; parentId?: number | null }) => Promise<void>;
  parentId?: number | null;
}

export default function CreateFolderModal({ open, onClose, onCreate, parentId = null }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate({ name: name.trim(), parentId });
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
          <Dialog.Title className="text-xl font-bold mb-4">Create New Folder</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Folder Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Computer Science 101"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Description (optional)</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course description..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center justify-center gap-2"
                disabled={loading}
              >
               {loading && <LoadingSpinner />} 
                Create Folder
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
