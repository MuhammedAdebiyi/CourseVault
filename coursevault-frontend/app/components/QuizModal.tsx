"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import api from "@/app/utils/api";

type QuestionTypeKey = "objective" | "theory" | "both";

interface Question {
  id: number;
  question: string;
  options?: string[]; 
  correct_answer?: string;
  explanation?: string;
  difficulty?: string;
  
  answer?: string;
  type?: "objective" | "theory";
}

interface QuizModalProps {
  pdfId: number;
  pdfTitle: string;
  onClose: () => void;
}

export default function QuizModal({ pdfId, pdfTitle, onClose }: QuizModalProps) {
  // UI steps: 'setup' (small modal), 'loading', 'quiz', 'results', 'error'
  const [step, setStep] = useState<"setup" | "loading" | "quiz" | "results" | "error">("setup");

  // setup state
  const [questionType, setQuestionType] = useState<QuestionTypeKey>("objective");
  const [numObjective, setNumObjective] = useState<number>(30); // default min
  const [numTheory, setNumTheory] = useState<number>(5); // default min
  const [setupError, setSetupError] = useState<string | null>(null);

  // quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [results, setResults] = useState<any>(null);
  const [timeStarted, setTimeStarted] = useState<number>(0);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // validation constants
  const OBJ_MIN = 30;
  const OBJ_MAX = 60;
  const TH_MIN = 5;
  const TH_MAX = 15;

  // Helpers
  const clamp = (v:number, min:number, max:number) => Math.max(min, Math.min(max, v));

  const validateSetup = (): boolean => {
    setSetupError(null);
    if (questionType === "objective") {
      if (!Number.isInteger(numObjective) || numObjective < OBJ_MIN || numObjective > OBJ_MAX) {
        setSetupError(`Objective questions must be between ${OBJ_MIN} and ${OBJ_MAX}.`);
        return false;
      }
    } else if (questionType === "theory") {
      if (!Number.isInteger(numTheory) || numTheory < TH_MIN || numTheory > TH_MAX) {
        setSetupError(`Theory questions must be between ${TH_MIN} and ${TH_MAX}.`);
        return false;
      }
    } else { 
      if (!Number.isInteger(numObjective) || numObjective < OBJ_MIN || numObjective > OBJ_MAX) {
        setSetupError(`Objective questions must be between ${OBJ_MIN} and ${OBJ_MAX}.`);
        return false;
      }
      if (!Number.isInteger(numTheory) || numTheory < TH_MIN || numTheory > TH_MAX) {
        setSetupError(`Theory questions must be between ${TH_MIN} and ${TH_MAX}.`);
        return false;
      }
    }
    return true;
  };

  const getTotalRequested = () => {
    if (questionType === "objective") return numObjective;
    if (questionType === "theory") return numTheory;
    return numObjective + numTheory;
  };

  
  const handleGenerate = async () => {
    if (!validateSetup()) return;

    setStep("loading");
    setLoadingMsg("Preparing request...");

    
    const payload: any = {};
    payload.question_type = questionType;
    payload.num_objective =
  questionType === "objective" || questionType === "both"
    ? clamp(numObjective, OBJ_MIN, OBJ_MAX)
    : undefined;
   payload.num_theory =
  questionType === "theory" || questionType === "both"
    ? clamp(numTheory, TH_MIN, TH_MAX)
    : undefined;
    payload.types = ((): string[] => {
      if (questionType === "objective") return ["objective"];
      if (questionType === "theory") return ["theory"];
      return ["objective", "theory"];
    })();
   payload.num_questions =
  (payload.num_objective ?? 0) + (payload.num_theory ?? 0);

    try {
      setLoadingMsg("Generating questions (this may take a while)...");
      const resp = await api.post(`/folders/pdfs/${pdfId}/generate-quiz/`, payload, { timeout: 120000 }); 
      
      if (resp?.data?.questions && Array.isArray(resp.data.questions) && resp.data.questions.length > 0) {
        const qs: Question[] = resp.data.questions.map((q: any, idx: number) => ({
          id: q.id ?? (q.question ? idx + 1 : idx + 1),
          question: q.question || q.prompt || "Untitled question",
          options: q.options ?? q.choices ?? undefined,
          correct_answer: q.correct_answer ?? q.answer_key ?? undefined,
          explanation: q.explanation ?? undefined,
          difficulty: q.difficulty ?? undefined,
          answer: q.answer ?? undefined,
          type: q.type ?? (q.options ? "objective" : "theory"),
        }));

        setQuestions(qs);
        setTimeStarted(Date.now());
        setCurrentQuestion(0);
        setAnswers({});
        setFetchError(null);
        setStep("quiz");
      } else {
        setFetchError("No questions were returned from the server.");
        setStep("error");
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      const msg = err?.response?.data?.error || err.message || "Failed to generate quiz.";
      setFetchError(msg);
      setStep("error");
    } finally {
      setLoadingMsg(null);
    }
  };

  
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  
  const submitQuiz = async () => {
    setSubmitLoading(true);
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);

    try {
      const resp = await api.post(`/folders/pdfs/${pdfId}/submit-quiz/`, {
        answers,
        time_taken: timeTaken,
      });

      setResults(resp.data);
      setStep("results");
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err?.response?.data?.error || "Failed to submit quiz.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  
  const SetupModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Generate Quiz — Setup</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Choose question type and number of questions to generate.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question type</label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-lg border ${questionType === "objective" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
              onClick={() => setQuestionType("objective")}
            >
              Objective
            </button>
            <button
              className={`px-3 py-1 rounded-lg border ${questionType === "theory" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
              onClick={() => setQuestionType("theory")}
            >
              Theory
            </button>
            <button
              className={`px-3 py-1 rounded-lg border ${questionType === "both" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
              onClick={() => setQuestionType("both")}
            >
              Both
            </button>
          </div>
        </div>

        {/* Counts */}
        <div className="space-y-4 mb-4">
          {(questionType === "objective" || questionType === "both") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of objective questions</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={OBJ_MIN}
                  max={OBJ_MAX}
                  value={numObjective}
                  onChange={(e) => setNumObjective(clamp(parseInt(e.target.value || "0"), OBJ_MIN, OBJ_MAX))}
                  className="w-28 px-3 py-2 border rounded"
                />
                <div className="text-sm text-gray-600">min {OBJ_MIN} • max {OBJ_MAX}</div>
              </div>
            </div>
          )}

          {(questionType === "theory" || questionType === "both") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of theory questions</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={TH_MIN}
                  max={TH_MAX}
                  value={numTheory}
                  onChange={(e) => setNumTheory(clamp(parseInt(e.target.value || "0"), TH_MIN, TH_MAX))}
                  className="w-28 px-3 py-2 border rounded"
                />
                <div className="text-sm text-gray-600">min {TH_MIN} • max {TH_MAX}</div>
              </div>
            </div>
          )}
        </div>

        {setupError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{setupError}</div>}

        <div className="flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 mr-2">Will generate <strong>{getTotalRequested()}</strong> questions</div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading modal
  const LoadingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-4">
          <FiLoader className="animate-spin text-purple-600" size={36} />
        </div>
        <h4 className="text-lg font-semibold mb-2">Generating questions...</h4>
        <p className="text-sm text-gray-600">{loadingMsg ?? "This can take 30s – 2min depending on document size."}</p>
        <div className="mt-6">
          <button onClick={() => { setStep("setup"); }} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    </div>
  );

  // Error modal
  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-4">
          <FiAlertCircle className="text-red-600" size={24} />
          <div>
            <h4 className="text-lg font-semibold">Failed to generate quiz</h4>
            <p className="text-sm text-gray-700 mt-1">{fetchError ?? "An unexpected error occurred."}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setStep("setup"); setFetchError(null); }} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded">Try again</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );

  // Quiz view
  const QuizView = () => {
    const total = questions.length;
    const question = questions[currentQuestion];
    const progress = total ? ((currentQuestion + 1) / total) * 100 : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">Quiz: {pdfTitle}</h3>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {total}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setStep("setup"); }} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Edit Setup</button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="mb-4">
            {question?.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)} mr-2`}>{question.difficulty}</span>
            )}
            <p className="text-lg font-semibold mt-2 mb-4">{question?.question}</p>

            {/* Objective options */}
            {question?.options && question.options.length > 0 ? (
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                
                  const letter = String.fromCharCode(65 + idx);
                  const selected = answers[question.id] === letter;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(question.id, letter)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition ${selected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"}`}
                    >
                      <span className="font-medium mr-2">{letter}.</span>{opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">Your answer (short):</label>
                <textarea
                  rows={4}
                  value={answers[question.id] ?? ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="Write your answer here..."
                />
                
                {question.answer && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border text-sm text-gray-700">
                    <strong>Sample answer:</strong>
                    <div className="mt-2 whitespace-pre-wrap">{question.answer}</div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation preview */}
            {question.explanation && (
              <div className="mt-3 p-3 bg-white rounded border text-sm text-gray-700">
                <strong>Note:</strong> {question.explanation}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="text-sm text-gray-600">{Object.keys(answers).length} / {total} answered</div>

            {currentQuestion < total - 1 ? (
              <button
                onClick={() => setCurrentQuestion(Math.min(total - 1, currentQuestion + 1))}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length !== total || submitLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {submitLoading ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Results view
  const ResultsView = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Quiz Results</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 mb-6 text-center">
          <div className="text-4xl font-bold mb-1">{(results?.percentage ?? 0).toFixed(1)}%</div>
          <div>{results?.score ?? 0} out of {results?.total ?? 0} correct</div>
        </div>

        <div className="space-y-4">
          {(results?.results ?? []).map((r: any, idx: number) => (
            <div key={idx} className={`p-4 rounded-lg border-2 ${r.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {r.is_correct ? <FiCheck className="text-green-600 mt-1" /> : <FiXCircle className="text-red-600 mt-1" />}
                <div className="flex-1">
                  <div className="font-semibold mb-2">{idx + 1}. {r.question}</div>
                  <div className="text-sm text-gray-700 mb-1"><strong>Your answer:</strong> {r.user_answer ?? "Not answered"}</div>
                  {!r.is_correct && <div className="text-sm text-gray-700 mb-1"><strong>Correct:</strong> {r.correct_answer}</div>}
                  {r.explanation && <div className="mt-2 text-sm text-gray-600 p-2 bg-white rounded">{r.explanation}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => { setStep("setup"); setQuestions([]); setResults(null); }} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded">Generate another</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );

  
  if (step === "setup") return <SetupModal />;
  if (step === "loading") return <LoadingModal />;
  if (step === "error") return <ErrorModal />;
  if (step === "quiz") return <QuizView />;
  if (step === "results") return <ResultsView />;

  
  return null;
}
