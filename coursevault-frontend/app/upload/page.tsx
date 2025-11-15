'use client';

import { useState } from 'react';
import Sidebar from '../components/SideBar';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'shared'>('private');
  const [allowDownload, setAllowDownload] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ file, privacy, allowDownload });
    // TODO: connect to presign + file metadata API
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Upload File</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block mb-1 font-medium">Select File</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block mb-1 font-medium">Privacy</label>
            <select value={privacy} onChange={(e) => setPrivacy(e.target.value as any)} className="border px-3 py-2 rounded">
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} />
            <label>Allow download</label>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Upload
          </button>
        </form>
      </main>
    </div>
  );
}
