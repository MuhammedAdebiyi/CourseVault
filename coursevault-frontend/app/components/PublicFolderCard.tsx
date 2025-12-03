"use client";

import { useState } from "react";
import { FiFolder, FiUsers, FiPlus, FiCheck } from "react-icons/fi";
import Link from "next/link";
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
  onAddToLibrary: () => void;
}

export default function PublicFolderCard({ folder, onAddToLibrary }: PublicFolderCardProps) {
  const [isInLibrary, setIsInLibrary] = useState(folder.is_in_library);
  const [loading, setLoading] = useState(false);

  const handleAddToLibrary = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInLibrary) {
      // Remove from library
      try {
        setLoading(true);
        await api.delete(`/folders/library/remove/${folder.id}/`);
        setIsInLibrary(false);
        onAddToLibrary();
      } catch (error: any) {
        console.error("Remove from library error:", error);
        alert(error.response?.data?.error || "Failed to remove from library");
      } finally {
        setLoading(false);
      }
    } else {
      // Add to library
      try {
        setLoading(true);
        await api.post(`/folders/library/add/${folder.id}/`, {});
        setIsInLibrary(true);
        onAddToLibrary();
      } catch (error: any) {
        console.error("Add to library error:", error);
        alert(error.response?.data?.error || "Failed to add to library");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link href={`/folders/public/${folder.slug}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-6 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FiFolder className="text-blue-600" size={24} />
          </div>
          
          <button
            onClick={handleAddToLibrary}
            disabled={loading}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5
              ${isInLibrary 
                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                : "bg-blue-600 text-white hover:bg-blue-700"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : isInLibrary ? (
              <>
                <FiCheck size={14} />
                In Library
              </>
            ) : (
              <>
                <FiPlus size={14} />
                Add
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {folder.title}
        </h3>

        {/* Owner */}
        <p className="text-sm text-gray-600 mb-4">
          by <span className="font-medium text-blue-600">{folder.owner_name}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{folder.file_count} files</span>
            <span className="flex items-center gap-1">
              <FiUsers size={14} />
              {folder.library_count}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(folder.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}