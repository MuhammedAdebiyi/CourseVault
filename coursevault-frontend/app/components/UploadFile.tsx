"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import { FiUpload, FiX, FiCheck } from "react-icons/fi";

interface UploadFileProps {
  folderId: number;
  onUploaded: (file: any) => void;
}

export default function UploadFile({ folderId, onUploaded }: UploadFileProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate PDF
      if (selectedFile.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      // Validate size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      setFile(selectedFile);
      setUploadComplete(false);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", selectedFile.name.replace(".pdf", ""));
    formData.append("folder_id", folderId.toString());

    try {
      const response = await api.post("/folders/pdfs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      console.log("Upload response:", response.data)

      setUploadComplete(true);
      onUploaded(response.data);

      // Redirect to folder after 2 seconds
      setTimeout(() => {
        handleClose();
        router.push(`/folders/${folderId}`);
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.detail || "Upload failed. Please try again.");
      setUploading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiUpload />
          Upload PDF
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {file && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {uploadComplete ? "Upload Complete!" : "Uploading..."}
              </h3>
              {!uploading && !uploadComplete && (
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              )}
            </div>

            {uploadComplete ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FiCheck className="text-green-600" size={32} />
                </div>
                <p className="text-lg font-semibold text-gray-800">Upload Successful!</p>
                <p className="text-sm text-gray-500 mt-2">{file.name}</p>
                <p className="text-xs text-gray-400 mt-2">Redirecting to folder...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Uploading: {file.name}</p>
                  <p className="text-2xl font-bold text-blue-600">{progress}%</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}