"use client";

import { useState, useEffect } from "react";
import { FiX, FiCheck, FiXCircle, FiClock } from "react-icons/fi";
import api from "@/app/utils/api";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

interface QuizModalProps {
  pdfId: number;
  pdfTitle: string;
  onClose: () => void;
}

export default function QuizModal({ pdfId, pdfTitle, onClose }: QuizModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/folders/pdfs/${pdfId}/generate-quiz/`, {
        num_questions: 5
      });
      setQuestions(response.data.questions);
      setTimeStarted(Date.now());
    } catch (error: any) {
      console.error("Quiz error:", error);
      alert(error.response?.data?.error || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const submitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);
    
    try {
      const response = await api.post(`/folders/pdfs/${pdfId}/submit-quiz/`, {
        answers: answers,
        time_taken: timeTaken
      });
      setResults(response.data);
      setShowResults(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      alert("Failed to submit quiz");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          {/* Score Summary */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{results.percentage.toFixed(1)}%</p>
              <p className="text-lg">{results.score} out of {results.total} correct</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            {results.results.map((result: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  result.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {result.is_correct ? (
                    <FiCheck className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  ) : (
                    <FiXCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">
                      {idx + 1}. {result.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Your answer:</span>{" "}
                        <span className={result.is_correct ? "text-green-700" : "text-red-700"}>
                          {result.user_answer || "Not answered"}
                        </span>
                      </p>
                      {!result.is_correct && (
                        <p className="text-gray-700">
                          <span className="font-medium">Correct answer:</span>{" "}
                          <span className="text-green-700">{result.correct_answer}</span>
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-gray-600 mt-2 p-2 bg-white rounded">
                          <span className="font-medium">Explanation:</span> {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                fetchQuiz();
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Retake Quiz
            </button>
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

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quiz: {pdfTitle}</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
          <p className="text-lg font-semibold mb-4">{question.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  answers[question.id] === option
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <p className="text-sm text-gray-600">
            {Object.keys(answers).length} / {questions.length} answered
          </p>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}