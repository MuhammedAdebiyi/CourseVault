"use client";

import React, { useEffect, useState } from "react";
import { FiHeart, FiTrash2, FiExternalLink, FiFolder } from "react-icons/fi";
import api from "@/app/utils/api";

interface LibraryEntry {
  id: number;
  folder: {
    id: number;
    title: string;
    slug: string;
    owner_name: string;
    file_count: number;
    updated_at: string;
  };
  custom_name: string;
  added_at: string;
}

export default function LibraryPage() {
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const response = await api.get("/folders/library/");
      setLibrary(response.data);
    } catch (error) {
      console.error("Failed to load library:", error);
      alert("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleRemove = async (folderId: number, title: string) => {
    if (!confirm(`Remove "${title}" from your library?`)) return;

    try {
      await api.delete(`/folders/library/remove/${folderId}/`);
      alert("Removed from library");
      fetchLibrary();
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove from library");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <FiHeart size={36} className="text-red-500" />
          My Library
        </h1>
        <p className="text-gray-600 text-lg">
          Public folders you've added to your collection
        </p>
      </div>

      {/* Empty State */}
      {library.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiHeart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Your library is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Browse the Discover page to add public folders
          </p>
          <a
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiExternalLink size={18} />
            Go to Discover
          </a>
        </div>
      )}

      {/* Library Grid */}
      {library.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Preview */}
              <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
                  <FiFolder size={48} className="text-white/90" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {entry.custom_name || entry.folder.title}
                </h3>

                {/* Original title if custom name exists */}
                {entry.custom_name && (
                  <p className="text-sm text-gray-500 mb-2">
                    Original: {entry.folder.title}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>by {entry.folder.owner_name}</span>
                  <span>{entry.folder.file_count} files</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Open Button */}
                  <a
                    href={`/share/${entry.folder.slug}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm font-medium"
                  >
                    Open
                  </a>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(entry.folder.id, entry.custom_name || entry.folder.title)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition text-sm text-gray-700 hover:text-red-600"
                    title="Remove from library"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mt-3">
                  Added {new Date(entry.added_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}