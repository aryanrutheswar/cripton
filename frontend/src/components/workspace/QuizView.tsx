import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Trophy, 
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, DocumentInfo } from '../../types';
import { api } from '../../services/api';

interface QuizViewProps {
  initialTopic?: string;
  activeDocument: DocumentInfo | null;
  onOpenSettings: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialTopic = 'Network Security Fundamentals',
  activeDocument,
  onOpenSettings,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setQuizFinished(false);
    setUserAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);

    try {
      const docId = activeDocument ? activeDocument.document_id : undefined;
      const res = await api.generateQuiz(topic.trim(), questionCount, docId);
      setQuestions(res.questions);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate quiz. Please check API key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (userAnswers[currentIndex] !== undefined) return; // already answered
    
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(userAnswers[currentIndex + 1] !== undefined);
    } else {
      // Finished!
      setQuizFinished(true);
      // Trigger confetti if scored >= 70%
      const score = calculateScore();
      if (score / questions.length >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowExplanation(userAnswers[currentIndex - 1] !== undefined);
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  const calculateScore = () => {
    return questions.reduce((score, q, idx) => {
      return userAnswers[idx] === q.correct_index ? score + 1 : score;
    }, 0);
  };

  const currentQ = questions[currentIndex];
  const answered = userAnswers[currentIndex] !== undefined;

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 sm:p-10 text-[#344536]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header & Controls */}
        <div className="bg-white/85 p-6 rounded-3xl border border-[#DCE8D5] shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
                <GraduationCap className="w-4 h-4 text-[#89966A]" /> Adaptive Knowledge Evaluation
              </div>
              <h2 className="font-display font-bold text-2xl text-[#344536]">
                Interactive Cybersecurity Quiz
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-[#DCE8D5] text-xs font-medium text-[#344536] bg-white focus:outline-none focus:border-[#89966A]"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter quiz topic (e.g. Asymmetric Encryption, XSS, MITM Attacks)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCE8D5] focus:border-[#89966A] focus:ring-2 focus:ring-[#B7E4A5]/30 text-sm text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none bg-white"
            />
            <button
              onClick={handleGenerateQuiz}
              disabled={!topic.trim() || loading}
              className="px-6 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B7E4A5]" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              onClick={onOpenSettings}
              className="px-3 py-1 rounded-lg bg-[#596B3D] text-white font-semibold cursor-pointer"
            >
              Settings
            </button>
          </div>
        )}

        {/* Empty state */}
        {questions.length === 0 && !loading && (
          <div className="p-12 text-center rounded-3xl bg-white/80 border border-[#DCE8D5] max-w-lg mx-auto space-y-3 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-[#DCE8D5]/50 text-[#596B3D] flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#344536]">Test Your Knowledge</h3>
            <p className="text-xs text-[#596B3D]">
              Enter any cybersecurity topic or click Generate Quiz to evaluate your understanding with real-time scoring and explanations.
            </p>
          </div>
        )}

        {/* Active Quiz Area */}
        {questions.length > 0 && !quizFinished && currentQ && (
          <div className="bg-white/90 p-6 sm:p-8 rounded-3xl border border-[#DCE8D5] shadow-xs space-y-6 backdrop-blur-md">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-[#596B3D] pb-4 border-b border-[#DCE8D5]">
              <span className="font-semibold text-[#344536]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>
                Score: {calculateScore()} / {Object.keys(userAnswers).length} Answered
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#DCE8D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#596B3D] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#344536] leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentIndex] === oIdx;
                const isCorrect = currentQ.correct_index === oIdx;
                
                let optionStyle = 'border-[#DCE8D5] hover:border-[#89966A] bg-white text-[#344536]';
                if (answered) {
                  if (isCorrect) {
                    optionStyle = 'border-[#89966A] bg-[#DCE8D5]/60 text-[#344536] font-semibold';
                  } else if (isSelected) {
                    optionStyle = 'border-rose-300 bg-rose-50 text-rose-950 font-semibold';
                  } else {
                    optionStyle = 'border-[#DCE8D5] opacity-60 bg-white text-[#89966A]';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={answered}
                    className={`w-full p-4 rounded-2xl border text-sm text-left transition-all flex items-center justify-between group cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-[#DCE8D5] flex items-center justify-center text-xs font-bold font-mono text-[#596B3D]">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {answered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#596B3D] shrink-0" />
                    )}
                    {answered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Callout */}
            {showExplanation && (
              <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5] text-xs text-[#344536] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#596B3D]">
                  <HelpCircle className="w-4 h-4" /> Explanation:
                </div>
                <p className="leading-relaxed text-[#4A5A38]">{currentQ.explanation}</p>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DCE8D5]">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-[#DCE8D5] disabled:opacity-40 text-xs font-semibold text-[#344536] cursor-pointer hover:bg-[#FAFAF4]"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!answered}
                className="px-5 py-2 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Finished Score Card */}
        {quizFinished && (
          <div className="bg-white/90 p-8 sm:p-10 rounded-3xl border border-[#DCE8D5] shadow-xs text-center space-y-6 backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-[#DCE8D5]/50 border border-[#89966A]/40 flex items-center justify-center text-[#596B3D] mx-auto shadow-xs">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-display font-bold text-3xl text-[#344536]">Quiz Completed!</h3>
              <p className="text-sm text-[#596B3D] mt-1">Topic: {topic}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5] inline-block min-w-[240px]">
              <div className="text-xs uppercase font-bold tracking-widest text-[#89966A]">Your Score</div>
              <div className="font-display font-extrabold text-4xl text-[#596B3D] mt-1">
                {calculateScore()} / {questions.length}
              </div>
              <div className="text-xs text-[#596B3D] mt-1">
                {Math.round((calculateScore() / questions.length) * 100)}% Accuracy
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 rounded-xl border border-[#DCE8D5] hover:bg-[#FAFAF4] text-[#344536] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#89966A]" />
                <span>Retry Quiz</span>
              </button>

              <button
                onClick={handleGenerateQuiz}
                className="px-6 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B7E4A5]" />
                <span>New Questions</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
