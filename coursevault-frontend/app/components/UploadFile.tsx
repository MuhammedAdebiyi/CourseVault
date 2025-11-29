"use client";

import { useState, useRef } from "react";
import api from "@/app/utils/api";
import { FiUpload, FiX, FiCheck } from "react-icons/fi";

interface UploadFileProps {
  folderId: number;
  onUploaded: (file: any) => void;
}

export default function UploadFile({ folderId, onUploaded }: UploadFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadSource, setUploadSource] = useState<"device" | "whatsapp" | "drive" | null>(null);
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
      setShowDialog(true);
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(".pdf", ""));
    formData.append("folder_id", folderId.toString()); 

    try {
      const response = await api.post("/folders/pdfs/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      setUploadComplete(true);
      onUploaded(response.data);

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.detail || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setFile(null);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    setUploadSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSourceSelect = (source: "device" | "whatsapp" | "drive") => {
    setUploadSource(source);
    
    if (source === "device") {
      fileInputRef.current?.click();
    } else if (source === "whatsapp") {
      // In a real app, this would integrate with WhatsApp
      alert("WhatsApp integration coming soon!");
    } else if (source === "drive") {
      // In a real app, this would integrate with Google Drive
      alert("Google Drive integration coming soon!");
    }
  };

  return (
    <>
      {/* Upload Trigger Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FiUpload />
          Upload PDF
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {!file ? "Select Upload Source" : uploadComplete ? "Upload Complete!" : "Uploading..."}
              </h3>
              {!uploading && (
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              )}
            </div>

            {!file ? (
              // Source Selection
              <div className="space-y-3">
                <button
                  onClick={() => handleSourceSelect("device")}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FiUpload className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold">Device Storage</p>
                      <p className="text-sm text-gray-500">Upload from your computer</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSourceSelect("whatsapp")}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-sm text-gray-500">Import from WhatsApp (Coming Soon)</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSourceSelect("drive")}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded">
                      <span className="text-2xl">☁️</span>
                    </div>
                    <div>
                      <p className="font-semibold">Google Drive</p>
                      <p className="text-sm text-gray-500">Import from Drive (Coming Soon)</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : uploadComplete ? (
              // Success State
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FiCheck className="text-green-600" size={32} />
                </div>
                <p className="text-lg font-semibold text-gray-800">Upload Successful!</p>
                <p className="text-sm text-gray-500 mt-2">{file.name}</p>
              </div>
            ) : (
              // Upload Progress
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Uploading: {file.name}</p>
                  <p className="text-2xl font-bold text-blue-600">{progress}%</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {!uploading && progress === 0 && (
                  <button
                    onClick={handleUpload}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Start Upload
                  </button>
                )}

                {uploading && (
                  <p className="text-center text-sm text-gray-500">
                    Please wait, uploading...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}