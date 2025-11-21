"use client";
import { useState, useRef } from "react";

export default function UploadFile({ onUploaded, folderId }: any) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement|null>(null);

  const upload = async (file: File) => {
    // placeholder - replace with your api util
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", String(folderId));
    // await fetch("/api/files/upload", { method: "POST", body: fd });
    onUploaded && onUploaded({ title: file.name, uploaded_at: new Date().toISOString(), file: URL.createObjectURL(file) });
  };

  return (
    <div>
      <div
        onDragOver={(e)=>{e.preventDefault(); setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={(e)=>{e.preventDefault(); setDrag(false); const f = e.dataTransfer?.files?.[0]; if(f) upload(f);}}
        className={`p-6 border-2 border-dashed rounded ${drag ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]; if(f) upload(f); }} />
        <p className="text-center">Drag & drop PDF here or <button onClick={()=>inputRef.current?.click()} className="underline">browse</button></p>
      </div>
    </div>
  );
}
