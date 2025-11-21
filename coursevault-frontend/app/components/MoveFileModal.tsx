"use client";
import { useEffect, useState } from "react";

interface Folder {
  id: number | string;
  name: string;
}

interface MoveFileModalProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  onMove: (fileId: number, folderId: number) => void; 
  fileId: number; 
}

export default function MoveFileModal({
  open,
  onClose,
  folders,
  onMove,
  fileId,
}: MoveFileModalProps) {
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    if (folders?.length) setTarget(String(folders[0].id));
  }, [folders]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="font-semibold mb-2">Move file</h3>

        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          {folders.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            onClick={() => {
              if (fileId && target) {
                onMove(fileId, Number(target));
              }
              onClose();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
