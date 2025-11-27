"use client";

import { useEffect, useState, useMemo } from "react";
import { Folder } from "react-bootstrap-icons";
import Link from "next/link";
import api from "../utils/api";
import { motion } from "framer-motion";
import { useAuth } from "@/src/context/AuthContext";

// Modal Components
import CreateFolderModal from "../components/CreateFolderModal";
import RenameFolderModal from "../components/RenameFolderModal";
import DeleteFolderModal from "../components/DeleteFolderModal";
import UploadPDFModal from "../components/UploadPDFModal";


import RecentFiles from "../components/RecentFiles";

// Types
interface FolderData {
  id: number;
  title: string;
  name?: string;
  slug: string;
  files_count: number;
  last_updated: string | null;
}

export default function DashboardPage() {
  const { user, loadingUser } = useAuth();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState<FolderData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<FolderData | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState<FolderData | null>(null);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Fetch folders after user is loaded
  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoadingFolders(true);
      try {
        // Fetch from dashboard endpoint
        const dashboardRes = await api.get("/auth/dashboard/");
        const dashboardFolders = Array.isArray(dashboardRes.data.folders)
          ? dashboardRes.data.folders
          : [];

        // Fetch from folders endpoint
        const foldersRes = await api.get("/folders/");
        const extraFolders = Array.isArray(foldersRes.data) ? foldersRes.data : [];

        // Combine and deduplicate
        const allFolders = [...dashboardFolders, ...extraFolders];
        const uniqueFolders = allFolders.filter((folder, index, self) =>
          index === self.findIndex((f) => f.id === folder.id)
        );

        setFolders(uniqueFolders);
      } catch (err) {
        console.error("Error fetching dashboard/folders:", err);
        setFolders([]);
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const totalFolders = folders.length;
  const totalFiles = useMemo(
    () => (Array.isArray(folders) ? folders.reduce((acc, f) => acc + (f.files_count || 0), 0) : 0),
    [folders]
  );

  const lastActivity = useMemo(() => {
    if (folders.length === 0) return "No activity yet";
    const validFolders = folders.filter(f => f.last_updated);
    if (validFolders.length === 0) return "No activity yet";
    
    const sorted = [...validFolders].sort(
      (a, b) => new Date(b.last_updated!).getTime() - new Date(a.last_updated!).getTime()
    );
    return new Date(sorted[0].last_updated!).toLocaleString();
  }, [folders]);

  // Loading screen
  if (loadingUser || loadingFolders) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-2">
        {`${getGreeting()}, ${user?.name || "User"}!`}
      </h1>
      <p className="text-gray-600 mb-6">Here's your dashboard overview.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div
          className="bg-white p-4 rounded-xl shadow flex flex-col items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-gray-500">Total Folders</h3>
          <p className="text-2xl font-bold mt-2">{totalFolders}</p>
        </motion.div>

        <motion.div
          className="bg-white p-4 rounded-xl shadow flex flex-col items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="text-gray-500">Total Files</h3>
          <p className="text-2xl font-bold mt-2">{totalFiles}</p>
        </motion.div>

        <motion.div
          className="bg-white p-4 rounded-xl shadow flex flex-col items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-gray-500">Subscription</h3>
          <p className={`text-2xl font-bold mt-2 ${user?.is_premium ? "text-green-600" : "text-red-600"}`}>
            {user?.is_premium ? "Active" : "Expired"}
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-4 rounded-xl shadow flex flex-col items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-gray-500">Last Activity</h3>
          <p className="text-sm font-semibold mt-2">{lastActivity}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <RecentFiles />
      </motion.div>

      {/* Create Folder */}
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setCreateModalOpen(true)}
        >
          + Create Folder
        </button>
      </div>

      {/* Folder Grid */}
      <h2 className="text-xl font-semibold mb-3">My courses</h2>

      {folders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No folders yet. Create one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border p-4 rounded hover:shadow cursor-pointer flex items-center justify-between"
            >
              <Link href={`/folders/${folder.id}`} className="flex items-center gap-3">
                <Folder className="text-black" size={24} />
                <div>
                  <p className="font-semibold">{folder.title || folder.name}</p>
                  <p className="text-sm text-gray-500">{folder.files_count || 0} files</p>
                </div>
              </Link>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRenameModalOpen(folder);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Rename
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteModalOpen(folder);
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUploadModalOpen(folder);
                  }}
                  className="text-sm text-green-600 hover:underline"
                >
                  Upload PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      {createModalOpen && (
        <CreateFolderModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          parentId={null}
          onCreate={async ({ name, parentId }) => {
            try {
              const res = await api.post("/folders/", { title: name, parent: parentId });
              setFolders((prev) => [res.data, ...prev]);
              setCreateModalOpen(false);
            } catch (err) {
              console.error("Failed to create folder:", err);
              alert("Failed to create folder");
            }
          }}
        />
      )}

      {renameModalOpen && (
        <RenameFolderModal
          folder={renameModalOpen}
          onClose={() => setRenameModalOpen(null)}
          onRename={async (payload) => {
            try {
              const updated = await api.patch(`/folders/${renameModalOpen?.id}/`, payload);
              setFolders((prev) =>
                prev.map((f) => (f.id === updated.data.id ? updated.data : f))
              );
              setRenameModalOpen(null);
            } catch (err) {
              console.error("Failed to rename folder:", err);
              alert("Failed to rename folder");
            }
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteFolderModal
          folder={deleteModalOpen}
          onClose={() => setDeleteModalOpen(null)}
          onDelete={(id) => {
            setFolders((prev) => prev.filter((f) => f.id !== id));
            setDeleteModalOpen(null);
          }}
        />
      )}

      {uploadModalOpen && (
        <UploadPDFModal
          folder={uploadModalOpen}
          onClose={() => setUploadModalOpen(null)}
          onPDFUploaded={(folderId, pdf) => {
            setFolders((prev) =>
              prev.map((f) =>
                f.id === folderId ? { ...f, files_count: f.files_count + 1 } : f
              )
            );
            setUploadModalOpen(null);
          }}
        />
      )}
    </main>
  );
}
