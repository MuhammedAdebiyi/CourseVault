"use client";

import React, { useState } from "react";
import { FiGlobe, FiLock, FiCopy, FiCheck } from "react-icons/fi";
import api from "@/app/utils/api";

interface ShareToggleProps {
  folderId: number;
  initialIsPublic: boolean;
  folderSlug: string;
}

export default function ShareToggle({
  folderId,
  initialIsPublic,
  folderSlug,
}: ShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${folderSlug}`;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/folders/folders/${folderId}/toggle-public/`);
      setIsPublic(response.data.is_public);
      
      if (response.data.is_public) {
        alert("✨ Folder is now public! Share the link with anyone.");
      } else {
        alert("🔒 Folder is now private. Only you can access it.");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("Failed to update folder visibility");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <FiGlobe size={24} className="text-green-600" />
          ) : (
            <FiLock size={24} className="text-gray-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {isPublic ? "Public Folder" : "Private Folder"}
            </h3>
            <p className="text-sm text-gray-600">
              {isPublic
                ? "Anyone with the link can view this folder"
                : "Only you can access this folder"}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`
            relative inline-flex h-8 w-14 items-center rounded-full transition-colors
            ${isPublic ? "bg-green-600" : "bg-gray-300"}
            ${loading ? "opacity-50" : ""}
          `}
        >
          <span
            className={`
              inline-block h-6 w-6 transform rounded-full bg-white transition-transform
              ${isPublic ? "translate-x-7" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* Share Link (only if public) */}
      {isPublic && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
          >
            {copied ? (
              <>
                <FiCheck size={16} />
                Copied!
              </>
            ) : (
              <>
                <FiCopy size={16} />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}