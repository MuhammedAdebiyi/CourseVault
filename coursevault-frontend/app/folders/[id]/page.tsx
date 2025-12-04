"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FolderCard from "@/app/components/FolderCard";
import FileItem from "@/app/components/FileItem";
import UploadFile from "@/app/components/UploadFile";
import { FiShare2 } from "react-icons/fi";
import ShareModal from "@/app/components/ShareModal";
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
  pdfs?: File[]; 
}
export interface Folder {
  id: number;
  name?: string;
  title?: string;
  parentId?: number | null;
  children?: Folder[];
  pdfs?: File[];
  is_public?: boolean;
  share_url?: string;
}

export default function FolderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
        console.log("Fetched folder:", res.data); // Debug log
        setFolder(res.data);
      } catch (err: any) {
        console.error("Failed to fetch folder:", err);
        if (err.response?.status === 404) {
          router.replace("/dashboard");
        } else {
          setFolder(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFolder();
  }, [id, router]);

  if (loading) return <LoadingSpinner />;
  if (!folder) return null;

  const { children = [], pdfs = [] } = folder; // Changed files to pdfs
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

  // Handle uploaded file
  const handleFileUploaded = (uploadedFile: any) => {
    console.log("File uploaded:", uploadedFile);
    
    const newFile: File = {
      id: uploadedFile.id,
      title: uploadedFile.title,
      uploaded_at: uploadedFile.uploaded_at ?? new Date().toISOString(),
      file: uploadedFile.file,
    };

    setFolder(prev => {
      if (!prev) return prev;
      
      const updatedFolder = {
        ...prev,
        pdfs: [newFile, ...(prev.pdfs ?? [])] // Changed files to pdfs
      };
      
      console.log("Updated folder:", updatedFolder);
      return updatedFolder;
    });
  };

  // Delete file
  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Delete this file?")) return;

    try {
      await api.delete(`/folders/pdfs/${fileId}/`);
      setFolder(prev => prev ? { ...prev, pdfs: prev.pdfs?.filter(f => f.id !== fileId) } : prev);
    } catch (err: any) {
      console.error("Failed to delete file:", err);
      alert(err.response?.data?.detail || "Failed to delete file");
    }
  };

  // Move file
  const handleMoveFile = async (fileId: number, targetFolderId: number) => {
    try {
      await api.post(`/folders/pdfs/${fileId}/move/`, { folder: targetFolderId });
      setFolder(prev => prev ? { ...prev, pdfs: prev.pdfs?.filter(f => f.id !== fileId) } : prev);
      setMoveOpen(false);
    } catch (err: any) {
      console.error("Failed to move file:", err);
      alert(err.response?.data?.detail || "Failed to move file");
    }
  };

  // Delete subfolder
  const handleDeleteSubfolder = (subfolderId: number) => {
    setFolder(prev => prev ? { ...prev, children: prev.children?.filter(child => child.id !== subfolderId) } : prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <button
        onClick={() => setShareModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2">
        <FiShare2 />
        Share
      </button>
        {/* Subfolders */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Subfolders</h2>
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {children.length > 0
              ? children.map(c => (
                  <motion.div key={c.id} layout whileHover={{ scale: 1.03 }}>
                    <FolderCard folder={c} onDelete={handleDeleteSubfolder} />
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
          <h2 className="text-lg font-semibold mb-3">Files ({pdfs.length})</h2>
          {pdfs.length > 0
            ? (
              <motion.div layout className="bg-white rounded-xl shadow divide-y">
                {pdfs.map(file => (
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
        folders={children.map(f => ({ ...f, name: f.name ?? "Untitled" }))}
        onMove={(fid, fid2) => handleMoveFile(fid, Number(fid2))}
        fileId={selectedFileToMove ?? 0}
      />
      {shareModalOpen && (
  <ShareModal
    folderId={Number(id)}
    folderTitle={folderName}
    isPublic={folder.is_public || false}
    onClose={() => setShareModalOpen(false)}
    onTogglePublic={() => {
      // Refresh folder data
      const fetchFolder = async () => {
        const res = await api.get(`/folders/${id}/`);
        setFolder(res.data);
      };
      fetchFolder();
    }}
  />
)}
    </div>
  );
}