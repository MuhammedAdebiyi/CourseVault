"use client";

import { useState, useEffect } from "react";
import { FiX, FiDownload, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold truncate max-w-md">{fileName}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
            title="Download PDF"
          >
            <FiDownload size={18} />
            Download
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Close"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* PDF Iframe */}
      <div className="flex-1 relative bg-gray-800">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-xl mb-2">Failed to load PDF</p>
              <p className="text-gray-400">{error}</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Download Instead
              </button>
            </div>
          </div>
        )}
        
        <iframe
          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Unable to display PDF in browser");
          }}
          title={fileName}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 text-gray-400 px-4 py-2 text-sm flex items-center justify-between">
        <p>Use scroll or arrow keys to navigate</p>
        <p className="text-xs">Press ESC to close</p>
      </div>
    </div>
  );
}