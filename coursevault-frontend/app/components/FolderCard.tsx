import Link from "next/link";
import { FolderIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import api from "@/app/utils/api";

interface FolderCardProps {
  folder: {
    id: number;
    name?: string;
    title?: string;
    files_count?: number;
    files?: any[];
  };
  onDelete?: (id: number) => void;
}

export default function FolderCard({ folder, onDelete }: FolderCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Use name or title (backend compatibility)
  const folderName = folder.name || folder.title || "Untitled";
  const filesCount = folder.files_count ?? folder.files?.length ?? 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    setDeleting(true);
    try {
      
      await api.delete(`/folders/${folder.id}/`);
      if (onDelete) {
        onDelete(folder.id);
      }
    } catch (err) {
      console.error("Failed to delete folder:", err);
      alert("Failed to delete folder");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/folders/${folder.id}`}>
        <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <FolderIcon className="w-10 h-10 text-blue-500" />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
              title="Delete folder"
            >
              <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
          </div>
          
          <h3 className="font-semibold text-gray-800 truncate mb-1">
            {folderName}
          </h3>
          
          <p className="text-sm text-gray-500">
            {filesCount} {filesCount === 1 ? 'file' : 'files'}
          </p>
          
          {showConfirm && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-90 rounded-xl flex items-center justify-center">
              <div className="text-center text-white p-4">
                <p className="font-semibold mb-2">Delete this folder?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1 bg-white text-red-500 rounded hover:bg-gray-100"
                  >
                    {deleting ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowConfirm(false);
                    }}
                    className="px-3 py-1 bg-transparent border border-white rounded hover:bg-white hover:text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}