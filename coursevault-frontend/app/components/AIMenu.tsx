"use client";

import React, { useState } from "react";
import { FiZap, FiFileText, FiLayers, FiHelpCircle } from "react-icons/fi";
import api from "@/app/utils/api";
import QuizModal from "./QuizModal";

interface AIMenuProps {
  pdfId: number;
  pdfTitle: string;
}

export default function AIMenu({ pdfId, pdfTitle }: AIMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setShowMenu(false);
    try {
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-summary/`);
      setSummary(response.data.summary);
      alert("✨ Summary generated!");
    } catch (error) {
      console.error("Failed to generate summary:", error);
      alert("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setLoading(true);
    setShowMenu(false);
    try {
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-flashcards/`, {
        num_cards: 10,
      });
      setFlashcards(response.data.flashcards);
      setShowFlashcards(true);
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      alert("Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowMenu(false);
    setShowQuiz(true);
  };

  return (
    <>
      {/* AI Button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          title="AI Features"
        >
          <FiZap size={16} />
          AI Tools
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  AI Features
                </p>

                {/* Generate Quiz */}
                <button
                  onClick={handleStartQuiz}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiHelpCircle className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Generate Quiz
                    </p>
                    <p className="text-xs text-gray-500">
                      Test your knowledge
                    </p>
                  </div>
                </button>

                {/* Generate Summary */}
                <button
                  onClick={handleGenerateSummary}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg transition text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="text-green-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Generate Summary
                    </p>
                    <p className="text-xs text-gray-500">
                      AI-powered overview
                    </p>
                  </div>
                </button>

                {/* Generate Flashcards */}
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-lg transition text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiLayers className="text-purple-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Create Flashcards
                    </p>
                    <p className="text-xs text-gray-500">
                      Study key concepts
                    </p>
                  </div>
                </button>
              </div>

              <div className="border-t border-gray-200 p-2 bg-gray-50">
                <p className="text-xs text-gray-500 px-3">
                  Powered by Claude AI
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          pdfId={pdfId}
          pdfTitle={pdfTitle}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* Summary Modal */}
      {summary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSummary(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">AI Summary</h2>
              <p className="text-sm text-gray-600 mt-1">{pdfTitle}</p>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                {summary.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setSummary(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcards Modal */}
      {showFlashcards && flashcards.length > 0 && (
        <FlashcardsViewer
          flashcards={flashcards}
          onClose={() => {
            setShowFlashcards(false);
            setFlashcards([]);
          }}
        />
      )}
    </>
  );
}

// Flashcards Viewer Component
function FlashcardsViewer({
  flashcards,
  onClose,
}: {
  flashcards: any[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = flashcards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((currentIndex + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flashcards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Card */}
        <div className="p-8">
          <div
            className="relative h-64 cursor-pointer perspective-1000"
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className={`
                absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8
                flex items-center justify-center text-white text-center transition-all duration-500
                ${flipped ? "opacity-0 rotate-y-180" : "opacity-100"}
              `}
            >
              <p className="text-xl font-medium">{current.front}</p>
            </div>
            <div
              className={`
                absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-8
                flex items-center justify-center text-white text-center transition-all duration-500
                ${flipped ? "opacity-100" : "opacity-0 rotate-y-180"}
              `}
            >
              <p className="text-xl font-medium">{current.back}</p>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            Click card to flip
          </p>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t flex justify-between">
          <button
            onClick={handlePrev}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}