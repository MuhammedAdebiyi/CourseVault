"use client";

import React, { useEffect, useState } from "react";
import { FiTrash2, FiRotateCcw, FiAlertCircle } from "react-icons/fi";
import api from "@/app/utils/api";

interface TrashFolder {
  id: number;
  title: string;
  deleted_at: string;
}

interface TrashFile {
  id: number;
  title: string;
  deleted_at: string;
  folder: number;
}

export default function TrashPage() {
  const [folders, setFolders] = useState<TrashFolder[]>([]);
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const response = await api.get("/folders/trash/");
      setFolders(response.data.folders || []);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error("Failed to load trash:", error);
      alert("Failed to load trash items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (itemType: "folder" | "file", itemId: number) => {
    try {
      await api.post(`/folders/restore/${itemType}/${itemId}/`);
      alert(`${itemType === "folder" ? "Folder" : "File"} restored successfully!`);
      fetchTrash(); // Refresh
    } catch (error) {
      console.error("Restore error:", error);
      alert("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (itemType: "folder" | "file", itemId: number, title: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${title}"?\n\nThis action CANNOT be undone!`)) {
      return;
    }

    try {
      await api.delete(`/folders/permanent-delete/${itemType}/${itemId}/`);
      alert("Item permanently deleted");
      fetchTrash(); // Refresh
    } catch (error) {
      console.error("Permanent delete error:", error);
      alert("Failed to permanently delete item");
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("⚠️ EMPTY ENTIRE TRASH?\n\nThis will PERMANENTLY DELETE all items and CANNOT be undone!")) {
      return;
    }

    try {
      // Delete all folders
      for (const folder of folders) {
        await api.delete(`/folders/permanent-delete/folder/${folder.id}/`);
      }
      
      // Delete all files
      for (const file of files) {
        await api.delete(`/folders/permanent-delete/file/${file.id}/`);
      }

      alert("Trash emptied successfully");
      fetchTrash();
    } catch (error) {
      console.error("Empty trash error:", error);
      alert("Failed to empty trash");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiTrash2 size={32} />
            Trash
          </h1>
          <p className="text-gray-600 mt-2">
            Items will be permanently deleted after 30 days
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FiTrash2 size={16} />
            Empty Trash
          </button>
        )}
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Items in trash are temporary</p>
          <p className="mt-1">
            You can restore items within 30 days. After that, they'll be permanently deleted.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-16">
          <FiTrash2 size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Trash is empty
          </h3>
          <p className="text-gray-500">
            Deleted items will appear here
          </p>
        </div>
      )}

      {/* Deleted Folders */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Folders ({folders.length})
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{folder.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Deleted {new Date(folder.deleted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Restore */}
                  <button
                    onClick={() => handleRestore("folder", folder.id)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-green-600"
                  >
                    <FiRotateCcw size={16} />
                    Restore
                  </button>

                  {/* Permanent Delete */}
                  <button
                    onClick={() => handlePermanentDelete("folder", folder.id, folder.title)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
                  >
                    <FiTrash2 size={16} />
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deleted Files */}
      {files.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Files ({files.length})
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Deleted {new Date(file.deleted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Restore */}
                  <button
                    onClick={() => handleRestore("file", file.id)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-green-600"
                  >
                    <FiRotateCcw size={16} />
                    Restore
                  </button>

                  {/* Permanent Delete */}
                  <button
                    onClick={() => handlePermanentDelete("file", file.id, file.title)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
                  >
                    <FiTrash2 size={16} />
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}