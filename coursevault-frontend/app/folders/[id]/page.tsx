"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/SideBar";
import FolderCard from "@/app/components/FolderCard";
import FileItem from "@/app/components/FileItem";
import UploadFile from "@/app/components/UploadFile";
import CreateFolderModal from "@/app/components/CreateFolderModal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import MoveFileModal from "@/app/components/MoveFileModal";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import api from "@/app/utils/api";
import { motion } from "framer-motion";

// ----- Types -----
export interface File {
  id: number;
  title: string;
  uploaded_at: string;
  file: string;
}

export interface Folder {
  id: number;
  name?: string;
  title?: string;
  parentId?: number | null;
  children?: Folder[];
  files?: File[];
}


export default function FolderDetail() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState<Folder | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [selectedFileToMove, setSelectedFileToMove] = useState<number | null>(null);

  // Fetch folder
  useEffect(() => {
    async function fetchFolder() {
      if (!id) return;
      try {
        const res = await api.get<Folder>(`/folders/${id}/`);
        setFolder(res.data);
      } catch (err) {
        console.error("Failed to fetch folder:", err);
        setFolder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchFolder();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!folder) return <div className="p-4 text-red-500">Folder not found</div>;

  // Destructure with defaults
  const { children = [], files = [] } = folder;
  const folderName = folder.name || folder.title || "Untitled";

  // Create subfolder
  const handleCreate = async (payload: { name: string; parentId?: number | null }) => {
    try {
      const body = {
        title: payload.name,  
        parent: Number(id),   
      };
      const { data } = await api.post("/folders/", body);
      setFolder(prev => prev ? { ...prev, children: [data, ...(prev.children ?? [])] } : prev);
      setCreateOpen(false);
    } catch (err: any) {
      console.error("Failed to create subfolder:", err);
      alert(err.response?.data?.detail || "Failed to create subfolder");
    }
  };

  
  const handleFileUploaded = (file: File) => {
    setFolder(prev => prev ? { ...prev, files: [file, ...prev.files ?? []] } : prev);
  };

  
  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Delete this file?")) return;
    
    try {
      
      await api.delete(`/folders/pdfs/${fileId}/`);
      setFolder(prev => prev ? { ...prev, files: prev.files?.filter(f => f.id !== fileId) } : prev);
    } catch (err: any) {
      console.error("Failed to delete file:", err);
      alert(err.response?.data?.detail || "Failed to delete file");
    }
  };

  
  const handleMoveFile = async (fileId: number, targetFolderId: number) => {
    try {
      await api.post(`/folders/pdfs/${fileId}/move/`, { folder: targetFolderId });
      setFolder(prev => prev ? { ...prev, files: prev.files?.filter(f => f.id !== fileId) } : prev);
      setMoveOpen(false);
    } catch (err: any) {
      console.error("Failed to move file:", err);
      alert(err.response?.data?.detail || "Failed to move file");
    }
  };

  
  const handleDeleteSubfolder = (subfolderId: number) => {
    setFolder(prev => prev ? {
      ...prev,
      children: prev.children?.filter(child => child.id !== subfolderId)
    } : prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar foldersCount={0} activePage="folders" />
      <main className="flex-1 p-6">
        <Breadcrumbs crumbs={[{ label: "Folders", href: "/folders" }, { label: folderName }]} />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{folderName}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + New Subfolder
            </button>
          </div>
        </div>

        {/* Subfolders */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Subfolders</h2>
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {children.length > 0
              ? children.map(c => (
                  <motion.div key={c.id} layout whileHover={{ scale: 1.03 }}>
                    <FolderCard 
                      folder={c} 
                      onDelete={handleDeleteSubfolder}
                    />
                  </motion.div>
                ))
              : <div className="text-gray-500 col-span-4 text-center py-8">No subfolders yet</div>
            }
          </motion.div>
        </section>

        {/* Upload */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Upload File</h2>
          <UploadFile onUploaded={handleFileUploaded} folderId={Number(id)} />
        </section>

        {/* Files */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Files ({files.length})</h2>
          {files.length > 0
            ? (
              <motion.div layout className="bg-white rounded-xl shadow divide-y">
                {files.map(file => (
                  <motion.div key={file.id} layout whileHover={{ scale: 1.01 }}>
                    <FileItem
                      file={file}
                      onDelete={handleDeleteFile}
                      onMove={(fid) => { setSelectedFileToMove(fid); setMoveOpen(true); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )
            : <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow">No files yet. Upload one to get started!</div>
          }
        </section>
      </main>

      {/* Modals */}
      <CreateFolderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        parentId={Number(id)}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete folder?"
        desc="This will delete the folder and its files."
        onConfirm={() => {}}
        onCancel={() => setConfirmOpen(false)}
      />
      <MoveFileModal
  open={moveOpen}
  onClose={() => setMoveOpen(false)}
  folders={children.map(f => ({
    ...f,
    name: f.name ?? "Untitled", 
  }))}
  onMove={(fid, fid2) => handleMoveFile(fid, Number(fid2))}
  fileId={selectedFileToMove ?? 0}
/>

    </div>
  );
}