"use client";
import { useState } from "react";
import api from "../utils/api";

interface Props {
  folder: { id: number; title: string };
  onClose: () => void;
  onRename: (updatedFolder: { id: number; title: string }) => void;
}

export default function RenameFolderModal({ folder, onClose, onRename }: Props) {
  const [title, setTitle] = useState(folder.title);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/folders/${folder.id}/`, { title });
      onRename(res.data);
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
        <h2 className="text-xl font-bold mb-4">Rename Folder</h2>
        <input
          type="text"
          className="w-full border rounded p-2 mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleRename} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? "Renaming..." : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}
