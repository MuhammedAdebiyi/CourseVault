"use client";

import React, { useState } from "react";
import { FiFolder, FiTrash2, FiEdit2, FiChevronRight } from "react-icons/fi";
import api from "@/app/utils/api";

interface Folder {
  id: number;
  title: string;
  updated_at: string;
  children?: Folder[];
}

interface FolderItemProps {
  folder: Folder;
  onDelete: (folderId: number) => void;
  onOpen: (folderId: number) => void;
}

export default function FolderItem({ folder, onDelete, onOpen }: FolderItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(folder.title);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === folder.title) {
      setIsRenaming(false);
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/folders/folders/${folder.id}/rename/`, {
        title: newTitle,
      });
      setIsRenaming(false);
      window.location.reload();
    } catch (error) {
      console.error("Rename error:", error);
      alert("Failed to rename folder");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Move "${folder.title}" to trash?`)) return;

    setLoading(true);
    try {
      
      await api.delete(`/folders/folders/${folder.id}/`);
      
      alert("Folder moved to trash. You can restore it from the Trash section.");
      
      
      onDelete(folder.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to move folder to trash");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition group border-b border-gray-100">
      <div className="flex items-center gap-3 flex-1">
        <FiFolder size={24} className="text-blue-500" />
        
        {isRenaming ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setNewTitle(folder.title);
                setIsRenaming(false);
              }
            }}
            autoFocus
            className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        ) : (
          <button
            onClick={() => onOpen(folder.id)}
            className="flex-1 text-left"
          >
            <p className="font-medium text-gray-900 hover:text-blue-600 transition">
              {folder.title}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Updated {new Date(folder.updated_at).toLocaleDateString()}
            </p>
          </button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {/* Rename Button */}
        <button
          onClick={() => setIsRenaming(true)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
          title="Rename folder"
          disabled={loading}
        >
          <FiEdit2 size={16} />
          Rename
        </button>

        
        <button
          onClick={handleDelete}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
          title="Move to trash"
          disabled={loading}
        >
          <FiTrash2 size={16} />
          Delete
        </button>

        {/* Open Button */}
        <button
          onClick={() => onOpen(folder.id)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          title="Open folder"
        >
          Open
          <FiChevronRight size={16} />
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="ml-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}