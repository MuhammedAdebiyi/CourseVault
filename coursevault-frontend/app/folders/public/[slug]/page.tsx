"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiFolder, FiFile, FiDownload, FiPlus, FiCheck } from "react-icons/fi";
import Link from "next/link";
import api from "@/app/utils/api";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface PublicFile {
  id: number;
  title: string;
  file_size: number;
  uploaded_at: string;
  download_url: string;
}

interface PublicFolder {
  id: number;
  title: string;
  owner_name: string;
  is_in_library: boolean;
  library_count: number;
  pdfs: PublicFile[];
}

export default function PublicFolderPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [folder, setFolder] = useState<PublicFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  useEffect(() => {
    fetchFolder();
  }, [slug]);

  const fetchFolder = async () => {
    try {
      const response = await api.get(`/folders/public/${slug}/`);
      setFolder(response.data);
    } catch (error) {
      console.error("Failed to fetch folder:", error);
      alert("Folder not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!folder) return;

    try {
      setAddingToLibrary(true);

      if (folder.is_in_library) {
        await api.delete(`/folders/library/remove/${folder.id}/`);
      } else {
        await api.post(`/folders/library/add/${folder.id}/`, {});
      }

      fetchFolder();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update library");
    } finally {
      setAddingToLibrary(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <LoadingSpinner />;
  if (!folder) return null;

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back button */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft />
          Back to Discover
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">

              <div className="p-4 bg-blue-100 rounded-lg">
                <FiFolder className="text-blue-600" size={32} />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{folder.title}</h1>

                <p className="text-gray-600 mb-4">
                  by{" "}
                  <span className="font-semibold text-blue-600">
                    {folder.owner_name}
                  </span>
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{folder.pdfs.length} files</span>
                  <span>{folder.library_count} people added this</span>
                </div>
              </div>
            </div>

            {/* Add to library button */}
            <button
              onClick={handleAddToLibrary}
              disabled={addingToLibrary}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2
                ${
                  folder.is_in_library
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addingToLibrary ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : folder.is_in_library ? (
                <>
                  <FiCheck />
                  In Your Library
                </>
              ) : (
                <>
                  <FiPlus />
                  Add to Library
                </>
              )}
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Files</h2>

          {folder.pdfs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiFile size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No files in this folder</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {folder.pdfs.map((file) => (
                <div
                  key={file.id}
                  className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FiFile className="text-blue-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">{file.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.file_size)} •{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {file.download_url && (
                    <a
                      href={file.download_url}
                      download
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <FiDownload size={16} />
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
