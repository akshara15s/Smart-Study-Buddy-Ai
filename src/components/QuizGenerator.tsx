import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  Bookmark,
  Printer,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Lightbulb,
  Check,
} from 'lucide-react';
import { QuizData, SavedItem } from '../types.ts';

interface QuizGeneratorProps {
  initialTopic?: string;
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  initialTopic = '',
  onSaveToBinder,
  targetYear,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState('Beginner College Level');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Quiz Taking State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
  const [saved, setSaved] = useState(false);

  const presetTopics = [
    'Python Programming Basics',
    'Linear Algebra & Matrices',
    'Intro to Cell Biology & ATP',
    'Ohm’s Law & DC Circuits',
    'Microeconomics: Elasticity of Demand',
    'Data Structures: Arrays & Linked Lists',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic to generate a quiz.');
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitted(false);
    setUserAnswers({});
    setRevealedHints({});
    setCurrentQuestionIndex(0);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          questionCount: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setQuizData(data.quiz);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLabel: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  const handleToggleHint = (questionId: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 5, percentage: 0 };
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const percentage = Math.round((correct / quizData.questions.length) * 100);
    return { score: correct, total: quizData.questions.length, percentage };
  };

  const handleRetake = () => {
    setUserAnswers({});
    setSubmitted(false);
    setRevealedHints({});
    setCurrentQuestionIndex(0);
  };

  const handleSaveQuiz = () => {
    if (!quizData) return;
    const { score, total, percentage } = calculateScore();
    onSaveToBinder({
      type: 'quiz',
      title: quizData.quizTitle || `${topic} Quiz`,
      subtitle: submitted ? `Score: ${score}/${total} (${percentage}%)` : `5 Questions • ${difficulty}`,
      data: {
        topic,
        difficulty,
        quiz: quizData,
        userAnswers,
        submitted,
        score,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const { score, total, percentage } = calculateScore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Quiz Generator</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              5 MCQs with Explanations
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Test your conceptual knowledge with auto-graded multiple-choice questions and detailed explanations.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label htmlFor="quiz-topic" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Quiz Topic or Chapter <span className="text-rose-500">*</span>
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Python OOP, Newton's Laws, Microeconomics Supply & Demand, DNA Replication"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Quick Practice Topics:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetTopics.map((pt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(pt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Difficulty
              </label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value="Beginner College Level">Beginner College (1st Year Foundation)</option>
                <option value="Intermediate College Level">Intermediate College (2nd Year Core)</option>
                <option value="Challenging Exam Trap Mode">Challenging (Examiner Traps & Nuance)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating 5 Conceptual MCQs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 5-MCQ Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Quiz Generation Failed</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Quiz Interactive Interface */}
      {quizData && quizData.questions && quizData.questions.length > 0 && (
        <div className="space-y-6">
          {/* Quiz Header & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Interactive Practice Test
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {quizData.quizTitle || `${topic} Quiz`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {quizData.overview || 'Answer all 5 questions and click Submit to see your score and explanations.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setViewMode(viewMode === 'step' ? 'all' : 'step')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                {viewMode === 'step' ? 'View All 5 Questions' : 'One-by-One Mode'}
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                title="Print quiz or save as PDF"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={handleSaveQuiz}
                disabled={saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>

          {/* Submission Score Banner */}
          {submitted && (
            <div
              className={`p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${
                percentage >= 80
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : percentage >= 60
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    percentage >= 80
                      ? 'bg-emerald-600'
                      : percentage >= 60
                      ? 'bg-red-600'
                      : 'bg-amber-600'
                  }`}
                >
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Quiz Completed!
                  </div>
                  <div className="text-2xl font-black">
                    Your Score: {score} / {total} ({percentage}%)
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    {percentage >= 80
                      ? 'Outstanding work! You have strong conceptual mastery.'
                      : percentage >= 60
                      ? 'Good job! Review the explanations below to patch your weak spots.'
                      : 'Solid effort! Go through each detailed explanation to build intuition.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-800 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all border border-slate-200"
              >
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Retake Quiz</span>
              </button>
            </div>
          )}

          {/* Questions Container */}
          {viewMode === 'step' ? (
            /* One Question at a Time View */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-3 border-b border-slate-100">
                <span>
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </span>
                <span className="text-red-600 font-bold">
                  {Object.keys(userAnswers).length} of {quizData.questions.length} Answered
                </span>
              </div>

              {/* Current Question */}
              {(() => {
                const q = quizData.questions[currentQuestionIndex];
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <div className="space-y-5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.id}. {q.question}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-3">
                      {q.options.map((opt) => {
                        const isChosen = selectedOpt === opt.label;
                        let optionStyle =
                          'border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-800';

                        if (submitted) {
                          if (opt.label === q.correctAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                          } else {
                            optionStyle = 'border-slate-200 opacity-60 text-slate-500';
                          }
                        } else if (isChosen) {
                          optionStyle =
                            'border-red-600 bg-red-50/70 text-red-950 font-semibold shadow-xs';
                        }

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.label)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-sm ${optionStyle}`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                submitted
                                  ? opt.label === q.correctAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : isChosen
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                  : isChosen
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>

                            {submitted && opt.label === q.correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {submitted && isChosen && !isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint section */}
                    {q.hint && !submitted && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleToggleHint(q.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{revealedHints[q.id] ? 'Hide Hint' : 'Need a Hint?'}</span>
                        </button>
                        {revealedHints[q.id] && (
                          <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                            💡 <strong>Hint:</strong> {q.hint}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post-submission explanation */}
                    {submitted && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isCorrect ? '✓ Correct Answer!' : `✗ Incorrect (Correct is Option ${q.correctAnswer})`}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      {currentQuestionIndex < quizData.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIndex((prev) =>
                              Math.min(quizData.questions.length - 1, prev + 1)
                            )
                          }
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                        >
                          <span>Next Question</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : !submitted ? (
                        <button
                          type="button"
                          onClick={() => setSubmitted(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Quiz for Grading</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* View All 5 Questions Mode */
            <div className="space-y-6">
              {quizData.questions.map((q, idx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                        Question {idx + 1} of 5
                      </span>
                      {submitted && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt) => {
                        const isChosen = selectedOpt === opt.label;
                        let optionStyle =
                          'border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-800';

                        if (submitted) {
                          if (opt.label === q.correctAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                          } else {
                            optionStyle = 'border-slate-200 opacity-60 text-slate-500';
                          }
                        } else if (isChosen) {
                          optionStyle =
                            'border-red-600 bg-red-50/70 text-red-950 font-semibold shadow-xs';
                        }

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.label)}
                            className={`text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 text-xs sm:text-sm ${optionStyle}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                isChosen ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-1">
                          Correct Answer: Option {q.correctAnswer}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!submitted && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Submit All 5 Questions</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
