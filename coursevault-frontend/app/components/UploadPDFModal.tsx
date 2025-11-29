"use client";
import { useState } from "react";
import api from "../utils/api";

interface Props {
  folder: { id: number; title: string };
  onClose: () => void;
  onPDFUploaded: (folderId: number, pdf: any) => void;
}

export default function UploadPDFModal({ folder, onClose, onPDFUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", String(folder.id)); 
    formData.append("title", file.name.replace(".pdf", "")); 

    try {
      const res = await api.post("/folders/pdfs/", formData);
      onPDFUploaded(folder.id, res.data);
      onClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload PDF to {folder.title}</h2>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}