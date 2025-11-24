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
  name: string; 
  children?: Folder[];
  files?: File[];
}

// -----------------
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFolder();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!folder) return <div className="p-4 text-red-500">Folder not found</div>;

  // Create subfolder
  const handleCreate = async (payload: { name: string; parentId?: string | number | null | undefined }) => {
  try {
    const { data } = await api.post<Folder>("/auth/folders/", { ...payload, parentId: id ?? undefined });
    setFolder(prev => prev ? { ...prev, children: [data, ...(prev.children ?? [])] } : prev);
    setCreateOpen(false);
  } catch (err) {
    console.error(err);
  }
};

  // File uploaded
  const handleFileUploaded = (file: File) => {
    setFolder(prev => prev ? { ...prev, files: [file, ...(prev.files ?? [])] } : prev);
  };

  // Delete file
  const handleDeleteFile = async (fileId: number) => {
    try {
      await api.delete(`/pdfs/${fileId}/delete/`);
      setFolder(prev => prev ? { ...prev, files: prev.files?.filter(f => f.id !== fileId) } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  // Move file
  const handleMoveFile = async (fileId: number, targetFolderId: number) => {
    try {
      await api.post(`/files/${fileId}/move/`, { folder: targetFolderId });
      setFolder(prev => prev ? { ...prev, files: prev.files?.filter(f => f.id !== fileId) } : prev);
      setMoveOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
    <Sidebar foldersCount={0} activePage="folders" />
      <main className="flex-1 p-6">
        <Breadcrumbs crumbs={[{ label: "Folders", href: "/folders" }, { label: folder.name }]} />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCreateOpen(true)}
              className="px-3 py-1 border rounded hover:bg-gray-100 transition"
            >
              New subfolder
            </button>
            <button
              onClick={() => setMoveOpen(true)}
              className="px-3 py-1 border rounded hover:bg-gray-100 transition"
            >
              Move file
            </button>
          </div>
        </div>

        {/* Subfolders */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Subfolders</h2>
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(folder.children ?? []).length > 0
              ? folder.children!.map(c => (
                  <motion.div key={c.id} layout whileHover={{ scale: 1.03 }}>
                    <FolderCard folder={c} />
                  </motion.div>
                ))
              : <div className="text-gray-500">No subfolders</div>
            }
          </motion.div>
        </section>

        {/* Upload */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Upload file</h2>
          <UploadFile onUploaded={handleFileUploaded} folderId={id} />
        </section>

        {/* Files */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Files</h2>
          {(folder.files ?? []).length > 0
            ? (
              <motion.div layout className="bg-white rounded-xl shadow divide-y">
                {folder.files!.map(file => (
                  <motion.div key={file.id} layout whileHover={{ scale: 1.02 }}>
                    <FileItem
                      file={file}
                      onDelete={handleDeleteFile}
                      onMove={(fid) => { setSelectedFileToMove(fid); setMoveOpen(true); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )
            : <div className="p-4 text-gray-500">No files</div>
          }
        </section>
      </main>

      {/* Modals */}
      <CreateFolderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        parentId={id ?? undefined} 
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
        folders={folder.children ?? []}
        onMove={(fid, fid2) => handleMoveFile(fid, Number(fid2))}
        fileId={selectedFileToMove ?? 0}
      />
    </div>
  );
}
