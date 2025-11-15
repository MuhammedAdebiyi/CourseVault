"use client";
import { useState } from "react";
import api from "../../utils/api";

export default function UploadPDF({ courseId }: { courseId: number }) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course", courseId.toString());
    formData.append("title", file.name);

    try {
      await api.post("pdfs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="my-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="ml-2 px-4 py-2 bg-black text-white rounded"
      >
        Upload
      </button>
    </div>
  );
}
