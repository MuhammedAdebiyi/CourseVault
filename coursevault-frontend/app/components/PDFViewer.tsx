"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: Use a stable URL - only create iframe once
  const stableUrl = useRef(fileUrl);

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    // Handle ESC key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen, onClose]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        ref={containerRef}
        className={`
          bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all
          ${
            isFullscreen
              ? "w-full h-full rounded-none"
              : "w-[95vw] h-[95vh] md:w-[90vw] md:h-[90vh]"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 truncate flex-1 mr-4">
            {fileName}
          </h3>

          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <FiMinimize2 size={20} />
              ) : (
                <FiMaximize2 size={20} />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* PDF Iframe - ✅ NO RELOADING */}
        <div className="flex-1 relative bg-gray-100">
          <iframe
            ref={iframeRef}
            src={stableUrl.current} // ✅ Use stable ref, not prop
            className="w-full h-full border-0"
            title={fileName}
            // ✅ Prevent iframe from reloading
            key="pdf-viewer" // Static key
          />
        </div>

        {/* Footer (Optional) */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}