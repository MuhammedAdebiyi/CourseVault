"use client";

import { useState, useEffect } from "react";
import { FiX, FiCopy, FiCheck, FiGlobe, FiLock } from "react-icons/fi";
import api from "@/app/utils/api";

interface ShareModalProps {
  folderId: number;
  folderTitle: string;
  isPublic: boolean;
  onClose: () => void;
  onTogglePublic: () => void;
}

export default function ShareModal({ folderId, folderTitle, isPublic: initialIsPublic, onClose, onTogglePublic }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPublic) {
      fetchShareUrl();
    }
  }, [isPublic, folderId]);

  const fetchShareUrl = async () => {
    try {
      const response = await api.get(`/folders/${folderId}/`);
      if (response.data.share_url) {
        setShareUrl(response.data.share_url);
      }
    } catch (error) {
      console.error("Failed to fetch share URL:", error);
    }
  };

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/folders/${folderId}/toggle-public/`);
      setIsPublic(response.data.is_public);
      if (response.data.share_url) {
        setShareUrl(response.data.share_url);
      }
      onTogglePublic();
    } catch (error: any) {
      console.error("Failed to toggle public:", error);
      alert(error.response?.data?.detail || "Failed to change visibility");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Share "{folderTitle}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <FiGlobe className="text-green-600" size={24} />
              ) : (
                <FiLock className="text-gray-600" size={24} />
              )}
              <div>
                <p className="font-semibold">
                  {isPublic ? "Public folder" : "Private folder"}
                </p>
                <p className="text-sm text-gray-600">
                  {isPublic 
                    ? "Anyone with the link can view" 
                    : "Only you can access this folder"}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition
                ${isPublic ? "bg-green-600" : "bg-gray-300"}
                disabled:opacity-50
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${isPublic ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>

        {/* Share Link */}
        {isPublic && shareUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`
                  px-4 py-2 rounded-lg font-medium transition flex items-center gap-2
                  ${copied 
                    ? "bg-green-100 text-green-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                {copied ? (
                  <>
                    <FiCheck size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <FiCopy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {isPublic ? (
              <>
                <strong>Note:</strong> Public folders are visible in the Discover page and can be added to anyone's library.
              </>
            ) : (
              <>
                <strong>Note:</strong> Make this folder public to share it with others and allow them to discover it.
              </>
            )}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}