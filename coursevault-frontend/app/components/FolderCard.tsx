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
  
  
  const folderName = folder.name || folder.title || "Untitled";
  const filesCount = folder.files_count ?? folder.files?.length ?? 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    if (!confirm(`Delete "${folderName}" and all its contents?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      
      await api.delete(`/folders/${folder.id}/`);
      
      
      if (onDelete) {
        onDelete(folder.id);
      }
    } catch (err: any) {
      console.error("Failed to delete folder:", err);
      alert(err.response?.data?.detail || "Failed to delete folder");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/folders/${folder.id}`}>
        <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <FolderIcon className="w-10 h-10 text-blue-500" />
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded disabled:opacity-50"
                title="Delete folder"
              >
                {deleting ? (
                  <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <TrashIcon className="w-5 h-5 text-red-500" />
                )}
              </button>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-800 truncate mb-1">
            {folderName}
          </h3>
          
          <p className="text-sm text-gray-500">
            {filesCount} {filesCount === 1 ? 'file' : 'files'}
          </p>
        </div>
      </Link>
    </div>
  );
}