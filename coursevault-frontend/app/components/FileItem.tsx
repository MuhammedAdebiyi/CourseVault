"use client";

import React from "react";
import { File } from "@/app/folders/[id]/page";

interface FileItemProps {
  file: File;
  onDelete: (fileId: number) => void;
  onMove: (fileId: number) => void;
}

export default function FileItem({ file, onDelete, onMove }: FileItemProps) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
      <div>
        <p className="font-medium">{file.title}</p>
        <p className="text-sm text-gray-400">{new Date(file.uploaded_at).toLocaleString()}</p>
      </div>
      <div className="flex gap-2">
        <a
          href={file.file}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 border rounded hover:bg-gray-100 transition"
        >
          View
        </a>
        <button
          onClick={() => onMove(file.id)}
          className="px-2 py-1 border rounded hover:bg-gray-100 transition"
        >
          Move
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="px-2 py-1 border rounded hover:bg-red-100 text-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
