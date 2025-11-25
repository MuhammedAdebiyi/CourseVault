"use client";

import React, { useState } from "react";
import api from "@/app/utils/api";
import { File } from "@/app/folders/[id]/page";

interface UploadFileProps {
  folderId: number;
  onUploaded: (file: File) => void;
}

export default function UploadFile({ folderId, onUploaded }: UploadFileProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folderId.toString());

    try {
      setUploading(true);
      const { data } = await api.post<File>("/folders/pdfs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(data);
    } catch (err) {
      console.error("Failed to upload file:", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
    </div>
  );
}
