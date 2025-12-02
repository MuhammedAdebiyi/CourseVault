"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiDownload, FiClock, FiEye } from "react-icons/fi";
import Link from "next/link";
import api from "@/app/utils/api";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import AIFeatures from "@/app/components/AIFeatures";

interface FileDetail {
  id: number;
  title: string;
  file: string;
  description: string;
  tags: string[];
  file_size: number;
  uploaded_at: string;
  last_viewed: string;
  view_count: number;
  folder: number;
  download_url: string;
}

export default function FileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [file, setFile] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch file details
  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      const response = await api.get(`/folders/pdfs/${id}/`);
      setFile(response.data);
    } catch (error) {
      console.error("Failed to fetch file:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <LoadingSpinner />;
  if (!file) return null;

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/folders/${file.folder}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to Folder
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mt-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{file.title}</h1>

            {file.description && (
              <p className="text-gray-600 mb-4">{file.description}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FiClock size={16} />
                Uploaded {formatDate(file.uploaded_at)}
              </div>

              <div className="flex items-center gap-1">
                <FiEye size={16} />
                {file.view_count} views
              </div>

              <div>{formatFileSize(file.file_size)}</div>
            </div>
          </div>

          {/* Download Button */}
          {file.download_url && (
            <a
              href={file.download_url}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiDownload />
              Download
            </a>
          )}
        </div>

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {file.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* PDF Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Document Preview</h3>

              {file.download_url ? (
                <iframe
                  src={`${file.download_url}#toolbar=0`}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  title={file.title}
                />
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Preview not available</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Tools */}
          <div className="lg:col-span-1">
            <AIFeatures pdfId={file.id} pdfTitle={file.title} />
          </div>
        </div>
      </div>
    </main>
  );
}
