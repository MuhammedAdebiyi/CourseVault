"use client";

import { useState, useEffect } from "react";
import { FiTrash2, FiRefreshCw, FiAlertCircle, FiFolder, FiFile } from "react-icons/fi";
import api from "@/app/utils/api";
import Sidebar from "@/app/components/SideBar";

interface TrashItem {
  id: number;
  title: string;
  deleted_at: string;
  files_count?: number;
}

interface TrashData {
  folders: TrashItem[];
  files: TrashItem[];
}

export default function TrashPage() {
  const [trash, setTrash] = useState<TrashData>({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<{ type: string; id: number } | null>(null);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const response = await api.get('/folders/trash/');
      setTrash(response.data);
    } catch (error) {
      console.error("Failed to fetch trash:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (itemType: 'folder' | 'file', itemId: number) => {
    setRestoring({ type: itemType, id: itemId });
    try {
      await api.post(`/folders/trash/${itemType}/${itemId}/restore/`);
      
      // Remove from trash list
      if (itemType === 'folder') {
        setTrash(prev => ({
          ...prev,
          folders: prev.folders.filter(f => f.id !== itemId)
        }));
      } else {
        setTrash(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== itemId)
        }));
      }
      
      alert(`${itemType === 'folder' ? 'Folder' : 'File'} restored successfully!`);
    } catch (error: any) {
      console.error("Restore error:", error);
      alert(error.response?.data?.detail || "Failed to restore item");
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (itemType: 'folder' | 'file', itemId: number, itemName: string) => {
    if (!confirm(`Permanently delete "${itemName}"? This cannot be undone!`)) {
      return;
    }

    try {
      await api.delete(`/folders/trash/${itemType}/${itemId}/delete/`);
      
      // Remove from trash list
      if (itemType === 'folder') {
        setTrash(prev => ({
          ...prev,
          folders: prev.folders.filter(f => f.id !== itemId)
        }));
      } else {
        setTrash(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== itemId)
        }));
      }
      
      alert('Permanently deleted');
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.response?.data?.detail || "Failed to delete item");
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const thirtyDaysLater = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const totalItems = trash.folders.length + trash.files.length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar foldersCount={0} activePage="trash" />
      
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrash2 className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
          </div>
          <p className="text-gray-600">
            Items in trash will be permanently deleted after 30 days
          </p>
        </div>

        {/* Warning Banner */}
        {totalItems > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-yellow-800">Items awaiting permanent deletion</p>
              <p className="text-sm text-yellow-700 mt-1">
                You have {totalItems} {totalItems === 1 ? 'item' : 'items'} in trash. Restore them or they'll be permanently deleted.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading trash...</p>
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <FiTrash2 className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Trash is empty</h3>
            <p className="text-gray-500">Deleted items will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deleted Folders */}
            {trash.folders.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFolder className="text-blue-600" />
                    Folders ({trash.folders.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {trash.folders.map(folder => (
                    <div key={folder.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{folder.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {folder.files_count || 0} files • Deleted {new Date(folder.deleted_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {getDaysRemaining(folder.deleted_at)} days until permanent deletion
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestore('folder', folder.id)}
                            disabled={restoring?.type === 'folder' && restoring?.id === folder.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400"
                          >
                            <FiRefreshCw size={16} />
                            {restoring?.type === 'folder' && restoring?.id === folder.id ? 'Restoring...' : 'Restore'}
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete('folder', folder.id, folder.title)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                          >
                            <FiTrash2 size={16} />
                            Delete Forever
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deleted Files */}
            {trash.files.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFile className="text-green-600" />
                    Files ({trash.files.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {trash.files.map(file => (
                    <div key={file.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{file.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Deleted {new Date(file.deleted_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {getDaysRemaining(file.deleted_at)} days until permanent deletion
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestore('file', file.id)}
                            disabled={restoring?.type === 'file' && restoring?.id === file.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400"
                          >
                            <FiRefreshCw size={16} />
                            {restoring?.type === 'file' && restoring?.id === file.id ? 'Restoring...' : 'Restore'}
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete('file', file.id, file.title)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                          >
                            <FiTrash2 size={16} />
                            Delete Forever
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}