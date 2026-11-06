import React from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Code2,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  BrainCircuit,
  Flame,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { FeatureType } from '../types.ts';

interface DashboardProps {
  onSelectFeature: (feature: FeatureType) => void;
  onQuickStart?: (feature: FeatureType, initialTopic: string) => void;
  targetYear: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectFeature,
  onQuickStart,
  targetYear,
}) => {
  const features = [
    {
      id: 'notes' as FeatureType,
      title: 'AI Notes Generator',
      badge: 'High-Yield',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      description:
        'Transform any lecture topic into clean, structured college study notes with definitions, key mechanisms, formulas, and real-world examples.',
      icon: BookOpen,
      iconBg: 'from-red-600 to-rose-600',
      sampleTopics: ['Binary Search Trees', 'First Law of Thermodynamics', 'Database Normalization', 'Newton’s Laws of Motion'],
    },
    {
      id: 'explainer' as FeatureType,
      title: 'Simple Concept Explainer',
      badge: 'ELI5 & Intuitive',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      description:
        'Break down difficult, jargon-heavy academic concepts into beginner-friendly explanations with everyday analogies, mental models, and intuition checks.',
      icon: Sparkles,
      iconBg: 'from-rose-600 to-red-700',
      sampleTopics: ['Pointers in C', 'Recursion vs Iteration', 'Entropy & Heat Death', 'Opportunity Cost in Microeconomics'],
    },
    {
      id: 'quiz' as FeatureType,
      title: 'AI Quiz Generator',
      badge: 'Interactive Testing',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description:
        'Generate 5 multiple-choice questions with 4 options, interactive in-browser quiz mode, instant scoring, and detailed explanations for every answer.',
      icon: HelpCircle,
      iconBg: 'from-red-700 to-rose-800',
      sampleTopics: ['Python Fundamentals', 'Linear Algebra & Vectors', 'Cellular Respiration', 'Intro to Macroeconomics'],
    },
    {
      id: 'questions' as FeatureType,
      title: 'Important Question Generator',
      badge: 'Revision Bank',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description:
        'Generate structured revision practice questions categorized into 2-mark short recall, 5-mark conceptual, and 10-mark in-depth questions with model answers.',
      disclaimer: 'Practice questions for revision, not guaranteed exam papers.',
      icon: FileQuestion,
      iconBg: 'from-rose-700 to-red-800',
      sampleTopics: ['Object Oriented Programming', 'Calculus Derivatives', 'Organic Chemistry Reactions', 'Digital Logic Gates'],
    },
    {
      id: 'code' as FeatureType,
      title: 'Code Explainer',
      badge: 'Line-by-Line',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description:
        'Master beginner-level Python, Java, C, C++, and HTML/CSS with line-by-line syntax breakdowns, variable state dry-runs, Big-O complexity, and common bug alerts.',
      icon: Code2,
      iconBg: 'from-red-600 to-rose-700',
      sampleTopics: ['Python Recursive Fibonacci', 'C Pointer Swap Function', 'Java Polymorphism Demo', 'HTML Flexbox Center'],
    },
    {
      id: 'planner' as FeatureType,
      title: 'Study Planner',
      badge: 'Burnout-Proof',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description:
        'Create a realistic, balanced study timetable tailored to your courses, daily available study hours, and Pomodoro focus intervals with spaced repetition review.',
      icon: CalendarDays,
      iconBg: 'from-rose-600 to-red-600',
      sampleTopics: ['7-Day Midterm Sprint', 'Weekend Catch-Up', 'Daily 3-Hour Balanced Routine'],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950 via-red-900 to-rose-950 text-white p-6 sm:p-10 shadow-xl shadow-red-950/15">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-rose-200 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-rose-300" />
            <span>Tailored for {targetYear} College Students & Beginners</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smart Study Buddy AI
          </h1>
          <p className="text-rose-100/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
            Your 24/7 personal academic companion. Generate crystal-clear notes, master difficult concepts, practice with self-scoring quizzes, dissect beginner code line-by-line, and build a stress-free study routine.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectFeature('notes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-900 font-bold text-sm shadow-lg hover:bg-rose-50 hover:shadow-xl transition-all duration-200"
            >
              <span>Generate Quick Notes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectFeature('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <HelpCircle className="w-4 h-4 text-rose-300" />
              <span>Test Knowledge (5 MCQs)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats / Info strip */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Zero Hallucinated Fillers</span>
          </div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-rose-300 shrink-0" />
            <span>Pedagogical Structuring</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Active Recall Revision</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-300 shrink-0" />
            <span>Interactive Self-Paced UI</span>
          </div>
        </div>
      </section>

      {/* Six Feature Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Six Core Learning Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a specialized tool below to begin studying
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-red-300 transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.iconBg} flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase ${feature.badgeColor}`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {feature.disclaimer && (
                    <div className="mt-2 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-md px-2 py-1 border border-amber-200">
                      ⚠️ {feature.disclaimer}
                    </div>
                  )}

                  {/* Quick Starter Topic Pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Quick Start Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.sampleTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (onQuickStart) {
                              onQuickStart(feature.id, topic);
                            } else {
                              onSelectFeature(feature.id);
                            }
                          }}
                          className="px-2 py-1 rounded-md bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-medium border border-slate-200/60 transition-colors text-left"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-6 pt-3">
                  <button
                    onClick={() => onSelectFeature(feature.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-semibold text-xs transition-all duration-200 group-hover:shadow-md"
                  >
                    <span>Launch {feature.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* College Study Tips & Active Learning Guide */}
      <section className="rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200/80 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Freshman & Sophomore Success Playbook
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-based study habits recommended by cognitive science
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-white/90 p-4 rounded-xl border border-red-100 shadow-xs">
            <span className="font-bold text-red-800 block mb-1">1. Active Recall Over Re-reading</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Don’t just re-read notes passively. Use the <strong>AI Quiz Generator</strong> or flashcard recaps to force your brain to retrieve knowledge.
            </p>
          </div>
          <div className="bg-white/90 p-4 rounded-xl border border-red-100 shadow-xs">
            <span className="font-bold text-red-800 block mb-1">2. The Feynman Analogy Technique</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              If you can’t explain a theorem to a 10-year-old, you haven’t grasped it yet. Use the <strong>Concept Explainer</strong> to unlock real-life metaphors.
            </p>
          </div>
          <div className="bg-white/90 p-4 rounded-xl border border-red-100 shadow-xs">
            <span className="font-bold text-red-800 block mb-1">3. Realistic Spaced Blocks</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Three 45-minute focused blocks with breaks beat an exhausting 6-hour marathon. Build a sustainable timetable using the <strong>Study Planner</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
