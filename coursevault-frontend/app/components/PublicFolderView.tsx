"use client";

import React, { useEffect, useState } from "react";
import { FiFolder, FiDownload, FiEye, FiUser, FiPlus, FiCheck, FiFileText } from "react-icons/fi";
import api from "@/app/utils/api";
import PDFViewer from "./PDFViewer";

interface File {
  id: number;
  title: string;
  uploaded_at: string;
  file: string;
  file_size: number;
  view_count: number;
}

interface FolderData {
  id: number;
  title: string;
  slug: string;
  owner_name: string;
  pdfs: File[];
  library_count: number;
  is_in_library: boolean;
  created_at: string;
  updated_at: string;
}

interface PublicFolderViewProps {
  slug: string;
}

export default function PublicFolderView({ slug }: PublicFolderViewProps) {
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");

  const fetchFolder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/folders/public/${slug}/`);
      setFolder(response.data);
    } catch (error) {
      console.error("Failed to load folder:", error);
      alert("Folder not found or is private");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolder();
  }, [slug]);

  const handleAddToLibrary = async () => {
    if (!folder) return;

    try {
      if (folder.is_in_library) {
        await api.delete(`/folders/library/remove/${folder.id}/`);
        alert("Removed from your library");
      } else {
        await api.post(`/folders/library/add/${folder.id}/`);
        alert("Added to your library!");
      }
      fetchFolder(); 
    } catch (error: any) {
      console.error("Library action error:", error);
      alert(error.response?.data?.error || "Failed to update library");
    }
  };

  const handleView = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/folders/pdfs/${fileId}/`);
      const downloadUrl = response.data.download_url;

      if (downloadUrl) {
        setViewUrl(downloadUrl);
        setSelectedFile(fileName);
      } else {
        alert("Unable to generate view link");
      }
    } catch (error) {
      console.error("View error:", error);
      alert("Failed to open file");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/folders/pdfs/${fileId}/`);
      const downloadUrl = response.data.download_url;

      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Unable to generate download link");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <FiFolder size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Folder Not Found
          </h2>
          <p className="text-gray-600">
            This folder doesn't exist or is private
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <FiFolder size={40} />
                <h1 className="text-4xl font-bold">{folder.title}</h1>
              </div>

              <div className="flex items-center gap-6 text-white/90 mb-6">
                <div className="flex items-center gap-2">
                  <FiUser size={18} />
                  <span>{folder.owner_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiFileText size={18} />
                  <span>{folder.pdfs.length} files</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPlus size={18} />
                  <span>{folder.library_count} in libraries</span>
                </div>
              </div>

              <p className="text-white/80 text-sm">
                Updated {new Date(folder.updated_at).toLocaleDateString()}
              </p>
            </div>

            {/* Add to Library Button */}
            <button
              onClick={handleAddToLibrary}
              className={`
                px-6 py-3 rounded-lg font-medium transition flex items-center gap-2
                ${
                  folder.is_in_library
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              {folder.is_in_library ? (
                <>
                  <FiCheck size={20} />
                  In Your Library
                </>
              ) : (
                <>
                  <FiPlus size={20} />
                  Add to Library
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {folder.pdfs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <FiFileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">This folder is empty</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
            {folder.pdfs.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span>{file.view_count} views</span>
                    <span>
                      Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* View Button */}
                  <button
                    onClick={() => handleView(file.id, file.title)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                  >
                    <FiEye size={16} />
                    View
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(file.id, file.title)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                  >
                    <FiDownload size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewUrl && (
        <PDFViewer
          fileUrl={viewUrl}
          fileName={selectedFile}
          onClose={() => {
            setViewUrl(null);
            setSelectedFile("");
          }}
        />
      )}
    </div>
  );
}