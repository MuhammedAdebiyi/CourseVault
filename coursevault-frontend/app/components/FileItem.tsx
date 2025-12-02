"use client";

import React, { useState } from "react";
import { FiEye, FiDownload, FiMove, FiTrash2, FiZap } from "react-icons/fi";
import Link from "next/link";
import api from "@/app/utils/api";
import PDFViewer from "@/app/components/PDFViewer";

interface File {
  id: number;
  title: string;
  uploaded_at: string;
  file: string;
}

interface FileItemProps {
  file: File;
  onDelete: (fileId: number) => void;
  onMove: (fileId: number) => void;
}

export default function FileItem({ file, onDelete, onMove }: FileItemProps) {
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  const handleView = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/folders/pdfs/${file.id}/`);
      const downloadUrl = response.data.download_url;

      if (downloadUrl) {
        setViewUrl(downloadUrl);
      } else {
        alert("Unable to generate view link");
      }
    } catch (error) {
      console.error("View error:", error);
      alert("Failed to open file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/folders/pdfs/${file.id}/`);
      const downloadUrl = response.data.download_url;

      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = file.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Unable to generate download link");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    if (!confirm(`Move "${file.title}" to trash?`)) return;

    setLoading(true);
    try {
      await api.delete(`/folders/pdfs/${file.id}/`);
      alert("File moved to trash. You can restore it from the Trash section.");
      onDelete(file.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to move file to trash");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    callback();
  };

  return (
    <>
      {/* Main Item - Wrapped in Link */}
      <Link href={`/files/${file.id}`}>
        <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition group cursor-pointer">
          <div className="flex-1">
            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition">
              {file.title}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Uploaded{" "}
              {new Date(file.uploaded_at).toLocaleDateString()} at{" "}
              {new Date(file.uploaded_at).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex gap-2">
            {/* View Button */}
            <button
              onClick={(e) => handleButtonClick(e, handleView)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 disabled:opacity-50"
              title="View PDF"
            >
              <FiEye size={16} />
              View
            </button>

            {/* Download Button */}
            <button
              onClick={(e) => handleButtonClick(e, handleDownload)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 disabled:opacity-50"
              title="Download PDF"
            >
              <FiDownload size={16} />
              Download
            </button>

            {/* Move Button */}
            <button
              onClick={(e) => handleButtonClick(e, () => onMove(file.id))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-yellow-600"
              title="Move to another folder"
            >
              <FiMove size={16} />
              Move
            </button>
          
            {/* AI Features Button - Links to file detail page */}
            <Link 
              href={`/files/${file.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600"
              title="AI Features"
            >
              <FiZap size={16} />
              AI
            </Link>

            {/* Delete Button (Now Moves to Trash) */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 disabled:opacity-50"
              title="Move to trash"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="ml-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* PDF Viewer Modal */}
      {viewUrl && (
        <PDFViewer
          fileUrl={viewUrl}
          fileName={file.title}
          onClose={() => setViewUrl(null)}
        />
      )}
    </>
  );
}