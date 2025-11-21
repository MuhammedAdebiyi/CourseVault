"use client";
import { useState } from "react";
import api from "../utils/api";

interface Props {
  folder: { id: number; title: string };
  onClose: () => void;
  onDelete: (id: number) => void;
}

export default function DeleteFolderModal({ folder, onClose, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/folders/${folder.id}/delete/`);
      onDelete(folder.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Delete Folder</h2>
        <p>Are you sure you want to delete "{folder.title}" and all its files?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
