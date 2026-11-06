import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Plus,
  X,
  Clock,
  Bookmark,
  Printer,
  Check,
  Loader2,
  AlertCircle,
  Coffee,
  Brain,
  TrendingUp,
} from 'lucide-react';
import { StudyPlanData, SavedItem } from '../types.ts';

interface StudyPlannerProps {
  initialSubjects?: string[];
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  initialSubjects = ['Data Structures', 'Engineering Physics', 'Calculus II'],
  onSaveToBinder,
  targetYear,
}) => {
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [durationDays, setDurationDays] = useState('7-Day Sprint');
  const [preference, setPreference] = useState('Balanced Afternoon & Evening');
  const [studyTechnique, setStudyTechnique] = useState('Pomodoro (25 min study / 5 min break)');
  const [examGoal, setExamGoal] = useState('Midterm Exam Preparation');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlanData | null>(null);

  // Interactive Checklist of completed blocks: key `${dayIndex}-${blockIndex}`
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (subjects.length === 0) {
      setError('Please add at least one subject to plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedBlocks({});
    setSaved(false);

    try {
      const res = await fetch('/api/study-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          dailyHours,
          durationDays,
          preference,
          studyTechnique,
          examGoal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate study timetable');
      }

      setPlan(data.plan);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockCompleted = (key: string) => {
    setCompletedBlocks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateTotalBlocks = () => {
    if (!plan) return { completed: 0, total: 0, percent: 0 };
    let total = 0;
    plan.schedule.forEach((day) => {
      total += day.blocks.length;
    });
    const completed = Object.values(completedBlocks).filter(Boolean).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  const handleSavePlan = () => {
    if (!plan) return;
    const { completed, total, percent } = calculateTotalBlocks();
    onSaveToBinder({
      type: 'planner',
      title: plan.planTitle || `Study Plan: ${subjects.join(', ')}`,
      subtitle: `${dailyHours}h/day • ${durationDays} (${completed}/${total} done)`,
      data: {
        subjects,
        dailyHours,
        durationDays,
        plan,
        completedBlocks,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const { completed, total, percent } = calculateTotalBlocks();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Realistic Study Planner</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Anti-Burnout Routine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Build a sustainable, high-yield college timetable tailored to your subjects, peak energy hours, and breaks.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Subjects Tag Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Subjects & Courses to Study <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2 p-2 rounded-xl border border-slate-200 bg-slate-50/70 min-h-12">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100/80 text-red-800 text-xs font-bold border border-red-200/60 shadow-2xs"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {subjects.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  No subjects added yet. Type below to add your courses!
                </span>
              )}
            </div>

            {/* Add Subject Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="Type course name (e.g. Operating Systems, Thermodynamics) and press Add"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Daily Study Hours & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="daily-hours-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Daily Study Time
              </label>
              <select
                id="daily-hours-select"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value={2}>2 Hours / day (Gentle Pace)</option>
                <option value={3}>3 Hours / day (Balanced Routine)</option>
                <option value={4}>4 Hours / day (Standard College)</option>
                <option value={5}>5 Hours / day (Exam Sprint)</option>
                <option value={6}>6 Hours / day (Intensive Prep)</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Plan Duration
              </label>
              <select
                id="duration-select"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value="3-Day Weekend Intensive">3-Day Weekend Intensive</option>
                <option value="7-Day Sprint">7-Day Sprint (1 Week)</option>
                <option value="14-Day Midterm Plan">14-Day Midterm Plan (2 Weeks)</option>
                <option value="Ongoing Weekly Routine">Weekly Sustainable Routine</option>
              </select>
            </div>

            <div>
              <label htmlFor="energy-pref-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Peak Energy Window
              </label>
              <select
                id="energy-pref-select"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value="Early Morning Bird (06:00 - 12:00)">Morning Bird</option>
                <option value="Balanced Afternoon & Evening">Afternoon & Evening</option>
                <option value="Night Owl Focus (19:00 - 01:00)">Night Owl Focus</option>
              </select>
            </div>

            <div>
              <label htmlFor="technique-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Focus Technique
              </label>
              <select
                id="technique-select"
                value={studyTechnique}
                onChange={(e) => setStudyTechnique(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value="Pomodoro (25 min study / 5 min break)">Pomodoro (25 / 5 min)</option>
                <option value="50/10 Rule (50 min study / 10 min break)">50 / 10 Focus Blocks</option>
                <option value="Deep Work (90 min uninterrupted)">Deep Work (90 min)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || subjects.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Realistic Timetable with Spaced Repetition...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Realistic Timetable</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Planner Error</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Output Schedule */}
      {plan && plan.schedule && (
        <div className="space-y-6">
          {/* Plan Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Customized Study Schedule
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {plan.planTitle || `${durationDays} Study Blueprint`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {plan.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs"
                title="Print timetable or save as PDF"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={handleSavePlan}
                disabled={saved}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold shadow-2xs"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Progress Tracking Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Study Tracker Progress
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {completed} of {total} Sessions Completed ({percent}%)
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full sm:w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Strategy Tips Callout */}
          {plan.strategyTips && plan.strategyTips.length > 0 && (
            <div className="bg-gradient-to-r from-red-50/70 to-rose-50/70 rounded-2xl border border-red-100 p-5 space-y-2">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                <Brain className="w-4 h-4 text-red-600" />
                <span>Coach Strategy Tips for High Retention</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                {plan.strategyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Days Timetable Grid */}
          <div className="space-y-4">
            {plan.schedule.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
              >
                {/* Day Header */}
                <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h3 className="text-sm font-bold text-slate-900">{day.day}</h3>
                    <span className="text-xs text-slate-500 font-medium">— {day.theme}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                    {day.totalHours || dailyHours} Hours Total
                  </span>
                </div>

                {/* Blocks List */}
                <div className="divide-y divide-slate-100 p-2 sm:p-4 space-y-1">
                  {day.blocks.map((block, blockIdx) => {
                    const blockKey = `${dayIdx}-${blockIdx}`;
                    const isDone = completedBlocks[blockKey];

                    return (
                      <div
                        key={blockIdx}
                        onClick={() => toggleBlockCompleted(blockKey)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-emerald-50/50 border border-emerald-200/60 line-through text-slate-400'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <button
                            type="button"
                            aria-label="Toggle task completed"
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-red-500'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {block.timeSlot}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                                {block.subject}
                              </span>
                              {block.priority && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  {block.priority}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs sm:text-sm font-medium mt-1 leading-snug ${
                                isDone ? 'text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {block.activity}
                            </p>
                          </div>
                        </div>

                        {block.technique && (
                          <div className="self-end sm:self-center shrink-0">
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                              {block.technique}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Retention Advice Box */}
          {plan.retentionAdvice && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-start gap-3">
              <Coffee className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Spaced Repetition & Wellness Note:</strong>
                <p className="leading-relaxed">{plan.retentionAdvice}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
