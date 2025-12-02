"use client";

import { useState, useEffect } from "react";
import { FiClock, FiFile, FiEye } from "react-icons/fi";
import api from "@/app/utils/api";
import Link from "next/link";

interface RecentFile {
  id: number;
  title: string;
  folder: number;
  uploaded_at: string;
  last_viewed: string | null;
  view_count: number;
}

export default function RecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'viewed' | 'uploaded'>('viewed');

  useEffect(() => {
    fetchRecentFiles();
  }, [viewType]);

  const fetchRecentFiles = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/folders/recent-files/?type=${viewType}`);
      setRecentFiles(response.data || []);
    } catch (error) {
      console.error("Failed to fetch recent files:", error);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiClock className="text-blue-600" />
          Recent Files
        </h2>
        
        {/* Toggle View Type */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('viewed')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              viewType === 'viewed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recently Viewed
          </button>
          <button
            onClick={() => setViewType('uploaded')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              viewType === 'uploaded'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recently Uploaded
          </button>
        </div>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recentFiles.length > 0 ? (
        <div className="space-y-2">
          {recentFiles.map((file) => (
            <Link
              key={file.id}
              href={`/folders/${file.folder}?file=${file.id}`}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                <FiFile className="text-blue-600" size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition">
                  {file.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  {viewType === 'viewed' && file.last_viewed ? (
                    <>
                      <span className="flex items-center gap-1">
                        <FiEye size={12} />
                        {formatTimeAgo(file.last_viewed)}
                      </span>
                      <span>•</span>
                      <span>{file.view_count} {file.view_count === 1 ? 'view' : 'views'}</span>
                    </>
                  ) : (
                    <span>Uploaded {formatTimeAgo(file.uploaded_at)}</span>
                  )}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiClock className="mx-auto text-gray-300 mb-2" size={40} />
          <p className="text-gray-500">No recent files</p>
          <p className="text-sm text-gray-400 mt-1">
            {viewType === 'viewed' 
              ? 'Files you view will appear here'
              : 'Your uploaded files will appear here'
            }
          </p>
        </div>
      )}
    </div>
  );
}