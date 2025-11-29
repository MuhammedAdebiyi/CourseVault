"use client";

import React, { useState } from "react";
import { FiFolder, FiPlus, FiCheck, FiUser, FiFileText } from "react-icons/fi";
import api from "@/app/utils/api";

interface PublicFolder {
  id: number;
  title: string;
  slug: string;
  owner_name: string;
  file_count: number;
  library_count: number;
  is_in_library: boolean;
  updated_at: string;
}

interface PublicFolderCardProps {
  folder: PublicFolder;
  onAddToLibrary?: (folderId: number) => void;
}

export default function PublicFolderCard({ folder, onAddToLibrary }: PublicFolderCardProps) {
  const [isAdded, setIsAdded] = useState(folder.is_in_library);
  const [loading, setLoading] = useState(false);

  const handleAddToLibrary = async () => {
    setLoading(true);
    try {
      if (isAdded) {
        // Remove from library
        await api.delete(`/folders/library/remove/${folder.id}/`);
        setIsAdded(false);
        alert("Removed from your library");
      } else {
        // Add to library
        await api.post(`/folders/library/add/${folder.id}/`);
        setIsAdded(true);
        alert("Added to your library! ✨");
      }
      
      if (onAddToLibrary) {
        onAddToLibrary(folder.id);
      }
    } catch (error: any) {
      console.error("Library action error:", error);
      alert(error.response?.data?.error || "Failed to update library");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Folder Preview */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
          <FiFolder size={48} className="text-white/90" />
        </div>
        
        {/* Library Count Badge */}
        {folder.library_count > 0 && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-white text-xs font-medium">
            <FiPlus size={12} />
            {folder.library_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {folder.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FiUser size={14} />
            <span>{folder.owner_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiFileText size={14} />
            <span>{folder.file_count} files</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* View Button */}
          <a
            href={`/share/${folder.slug}`}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center text-sm font-medium"
          >
            View
          </a>

          {/* Add to Library Button */}
          <button
            onClick={handleAddToLibrary}
            disabled={loading}
            className={`
              flex-1 px-4 py-2 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50
              ${
                isAdded
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isAdded ? (
              <>
                <FiCheck size={16} />
                In Library
              </>
            ) : (
              <>
                <FiPlus size={16} />
                Add to Library
              </>
            )}
          </button>
        </div>

        {/* Updated Date */}
        <p className="text-xs text-gray-500 mt-3">
          Updated {new Date(folder.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}