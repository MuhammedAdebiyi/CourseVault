"use client";

import { useState } from "react";
import { FiZap, FiFileText, FiBook, FiCreditCard } from "react-icons/fi";
import api from "@/app/utils/api";
import QuizModal from "./QuizModal";
import FlashcardViewer from "./FlashcardViewer";

interface AIFeaturesProps {
  pdfId: number;
  pdfTitle: string;
}

export default function AIFeatures({ pdfId, pdfTitle }: AIFeaturesProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFlashcardViewer, setShowFlashcardViewer] = useState(false);

  // Extract text first (needed for all AI features)
  const extractText = async () => {
    try {
      setLoading("extract");
      const response = await api.post(`/folders/pdfs/${pdfId}/extract-text/`);
      alert(response.data.message || "Text extracted successfully!");
      return true;
    } catch (error: any) {
      console.error("Extract error:", error);
      alert(error.response?.data?.error || "Failed to extract text");
      return false;
    } finally {
      setLoading(null);
    }
  };

  // Generate AI summary
  const generateSummary = async () => {
    try {
      setLoading("summary");
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-summary/`);
      setSummary(response.data.summary);
    } catch (error: any) {
      console.error("Summary error:", error);
      alert(error.response?.data?.error || "Failed to generate summary");
    } finally {
      setLoading(null);
    }
  };

  // Generate flashcards
  const generateFlashcards = async () => {
    try {
      setLoading("flashcards");
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-flashcards/`, {
        num_cards: 10
      });
      setFlashcards(response.data.flashcards);
      setShowFlashcardViewer(true);
    } catch (error: any) {
      console.error("Flashcards error:", error);
      alert(error.response?.data?.error || "Failed to generate flashcards");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiZap className="text-purple-600" size={24} />
          <h3 className="text-xl font-bold">AI Features</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Use AI to analyze and learn from <span className="font-semibold">{pdfTitle}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Extract Text */}
          <button
            onClick={extractText}
            disabled={loading !== null}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiFileText className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-semibold">Extract Text</p>
            {loading === "extract" && (
              <div className="mt-2 text-xs text-blue-600">Processing...</div>
            )}
          </button>

          {/* Generate Summary */}
          <button
            onClick={generateSummary}
            disabled={loading !== null}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiBook className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-semibold">Generate Summary</p>
            {loading === "summary" && (
              <div className="mt-2 text-xs text-green-600">Generating...</div>
            )}
          </button>

          {/* Generate Flashcards */}
          <button
            onClick={generateFlashcards}
            disabled={loading !== null}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCreditCard className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-semibold">Flashcards</p>
            {loading === "flashcards" && (
              <div className="mt-2 text-xs text-orange-600">Generating...</div>
            )}
          </button>

          {/* Generate Quiz */}
          <button
            onClick={() => setShowQuizModal(true)}
            disabled={loading !== null}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiZap className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-semibold">Generate Quiz</p>
          </button>
        </div>

        {/* Display Summary */}
        {summary && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <FiBook size={18} />
              AI Summary:
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showQuizModal && (
        <QuizModal
          pdfId={pdfId}
          pdfTitle={pdfTitle}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {showFlashcardViewer && flashcards.length > 0 && (
        <FlashcardViewer
          flashcards={flashcards}
          onClose={() => setShowFlashcardViewer(false)}
        />
      )}
    </>
  );
}