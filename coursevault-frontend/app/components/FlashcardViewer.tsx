"use client";

import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiRotateCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardViewer({ flashcards, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Flashcards</h2>
            <p className="text-sm text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        <div
          className="relative h-80 mb-6 cursor-pointer"
          onClick={handleFlip}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center ${
                isFlipped ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <div className="text-white">
                <p className="text-sm font-semibold mb-4 opacity-75">
                  {isFlipped ? "Answer" : "Question"}
                </p>
                <p className="text-xl font-bold">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Flip hint */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-xs opacity-75 flex items-center justify-center gap-2">
                  <FiRotateCw size={14} />
                  Click to flip
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft />
            Previous
          </button>

          <div className="flex gap-2">
            {flashcards.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentIndex ? "bg-orange-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <FiChevronRight />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Use arrow keys to navigate • Click card to flip
        </p>
      </div>
    </div>
  );
}