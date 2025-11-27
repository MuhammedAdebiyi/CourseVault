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
      
      await api.delete(`/folders/${folder.id}/`); 
      onDelete(folder.id); 
      onClose();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.detail || "Failed to delete folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Folder</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">"{folder.title}"</span> and all its contents? 
          This will move it to Trash and can be restored within 30 days.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
