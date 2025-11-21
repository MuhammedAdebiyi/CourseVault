"use client";
import { motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";

export default function FileItem({ file, onDelete, onMove }: { file: any, onDelete: (id:number)=>void, onMove: (id:number)=>void }) {
  return (
    <motion.div layout className="p-3 border-b flex items-center justify-between hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <FiFileText size={22} className="text-blue-500" />
        <div>
          <div className="font-medium">{file.title}</div>
          <div className="text-xs text-gray-500">{new Date(file.uploaded_at).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onMove(file.id)} className="px-3 py-1 border rounded text-sm">Move</button>
        <a href={file.file} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded text-sm">View</a>
        <button onClick={() => onDelete(file.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
      </div>
    </motion.div>
  );
}
