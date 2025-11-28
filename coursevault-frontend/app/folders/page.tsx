"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/SideBar";
import FolderCard from "@/app/components/FolderCard";
import CreateFolderModal from "@/app/components/CreateFolderModal";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import api from "@/app/utils/api";
import { motion } from "framer-motion";

// ----- Types -----
export interface Folder {
  id: number;
  name?: string;
  title?: string;
  parentId?: number | null;
  children?: Folder[];
  files?: any[];
  files_count?: number;
}


export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch all folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await api.get("/folders/"); 
        const foldersData = Array.isArray(res.data) ? res.data : res.data.results || [];
        setFolders(foldersData);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
        setFolders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFolders();
  }, []);

  // Create new folder
  const handleCreate = async (payload: { name: string; parentId?: number | null }) => {
    try {
      const body = {
        title: payload.name, 
        parent: payload.parentId ?? null, 
      };
      const { data } = await api.post("/folders/", body);
      setFolders(prev => [data, ...prev]); 
      setCreateOpen(false);
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  // Delete folder
  const handleDelete = (folderId: number) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar foldersCount={folders.length} activePage="folders" />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Folders</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 bg-black text-white rounded"
          >
            New Folder
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, idx) => (
              <motion.div
                key={idx}
                className="p-4 bg-gray-200 rounded-xl animate-pulse h-28"
              ></motion.div>
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No folders yet</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.map(f => (
              <FolderCard 
                folder={f} 
                key={f.id}
                onDelete={handleDelete}  
              />
            ))}
          </motion.div>
        )}
      </main>

      <CreateFolderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        parentId={null} // root folder
      />
    </div>
  );  
}