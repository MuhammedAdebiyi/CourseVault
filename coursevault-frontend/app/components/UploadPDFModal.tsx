"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import { FiX, FiCheck, FiUpload } from "react-icons/fi";

interface Props {
  folder: { id: number; title: string };
  onClose: () => void;
  onPDFUploaded: (folderId: number, pdf: any) => void;
}

export default function UploadPDFModal({ folder, onClose, onPDFUploaded }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
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
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", String(folder.id)); 
    formData.append("title", file.name.replace(".pdf", "")); 

    try {
      const res = await api.post("/folders/pdfs/", formData, {
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
      
      setUploadComplete(true);
      onPDFUploaded(folder.id, res.data);
      
      // Redirect to folder after 2 seconds
      setTimeout(() => {
        onClose();
        router.push(`/folders/${folder.id}`);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.response?.data?.detail || "Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {uploadComplete ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Complete!</h2>
            </div>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <FiCheck className="text-green-600" size={32} />
              </div>
              <p className="text-lg font-semibold text-gray-800">Upload Successful!</p>
              <p className="text-sm text-gray-500 mt-2">{file?.name}</p>
              <p className="text-xs text-gray-400 mt-2">Redirecting to folder...</p>
            </div>
          </>
        ) : loading ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Uploading...</h2>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Uploading: {file?.name}</p>
                <p className="text-2xl font-bold text-blue-600">{progress}%</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload PDF to {folder.title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select PDF File
              </label>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                disabled={!file}
              >
                <FiUpload />
                Upload
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}