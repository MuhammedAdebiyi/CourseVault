"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiAlertCircle, FiAward } from "react-icons/fi";
import api from "@/app/utils/api";

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: string;
}

interface QuizModalProps {
  pdfId: number;
  pdfTitle: string;
  onClose: () => void;
}

export default function QuizModal({ pdfId, pdfTitle, onClose }: QuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, [pdfId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Try to get existing quiz
      const response = await api.get(`/folders/pdfs/${pdfId}/quiz/`);
      
      if (response.data.count > 0) {
        setQuestions(response.data.questions);
      } else {
        // No quiz exists, generate one
        await generateQuiz();
      }
    } catch (error) {
      console.error("Failed to load quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-quiz/`, {
        num_questions: 5,
      });
      
      setQuestions(response.data.questions);
      alert("✨ Quiz generated successfully!");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Failed to generate quiz. Make sure you have ANTHROPIC_API_KEY set.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await api.post(`/folders/pdfs/${pdfId}/submit-quiz/`, {
        answers,
        time_taken: timeTaken,
      });

      setResults(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz");
    }
  };

  const currentQuestion = questions[currentIndex];

  if (loading || generating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              {generating ? "🤖 AI is generating quiz questions..." : "Loading quiz..."}
            </p>
            {generating && (
              <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <FiAlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Quiz Available</h3>
            <p className="text-gray-600 mb-6">Generate a quiz from this PDF?</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={generateQuiz}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (submitted && results) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">Quiz Results</h2>
                <p className="text-white/80">{pdfTitle}</p>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-4">
              <FiAward size={48} />
              <div>
                <p className="text-4xl font-bold">{Math.round(results.percentage)}%</p>
                <p className="text-white/80">
                  {results.score} / {results.total} correct
                </p>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="p-6 space-y-4">
            {results.results.map((result: any, index: number) => (
              <div
                key={result.question_id}
                className={`border rounded-lg p-4 ${
                  result.is_correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {result.is_correct ? (
                    <FiCheck className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  ) : (
                    <FiX className="text-red-600 flex-shrink-0 mt-1" size={20} />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {index + 1}. {result.question}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Your answer:</span>{" "}
                      <span className={result.is_correct ? "text-green-700" : "text-red-700"}>
                        {result.user_answer || "Not answered"}
                      </span>
                    </p>
                    {!result.is_correct && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Correct answer:</span>{" "}
                        <span className="text-green-700">{result.correct_answer}</span>
                      </p>
                    )}
                    {result.explanation && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        💡 {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quiz: {pdfTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-4">
              {currentQuestion.difficulty}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswer(currentQuestion.id, key)}
                  className={`
                    w-full text-left p-4 border-2 rounded-lg transition
                    ${
                      answers[currentQuestion.id] === key
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="font-medium text-blue-600 mr-3">{key}.</span>
                  <span className="text-gray-900">{value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              {Object.keys(answers).length} / {questions.length} answered
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}