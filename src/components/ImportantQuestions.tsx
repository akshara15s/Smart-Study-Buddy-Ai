import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Download,
  Printer,
  Bookmark,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer.tsx';
import { SavedItem } from '../types.ts';

interface ImportantQuestionsProps {
  initialSubject?: string;
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const ImportantQuestions: React.FC<ImportantQuestionsProps> = ({
  initialSubject = '',
  onSaveToBinder,
  targetYear,
}) => {
  const [subject, setSubject] = useState(initialSubject || 'Object Oriented Programming');
  const [unitOrTopic, setUnitOrTopic] = useState('Inheritance, Polymorphism & Virtual Functions');
  const [examFormat, setExamFormat] = useState('Semester Midterm / Final Examination');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const presetUnits = [
    { subject: 'Data Structures & Algorithms', topic: 'Trees, Heaps & Graph Traversals (BFS/DFS)' },
    { subject: 'Digital Logic & Computer Organization', topic: 'K-Maps, Combinational Circuits & Registers' },
    { subject: 'Engineering Physics', topic: 'Wave Optics, Interference & Laser Principles' },
    { subject: 'Calculus & Differential Equations', topic: 'First Order ODEs, Taylor Series & Partial Derivatives' },
    { subject: 'Database Management Systems', topic: 'ER Diagrams, SQL Queries & 1NF/2NF/3NF Normalization' },
    { subject: 'General Chemistry', topic: 'Chemical Kinetics, Equilibrium & Electrochemistry' },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !unitOrTopic.trim()) {
      setError('Please provide a subject or topic/unit.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/important-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          unitOrTopic: unitOrTopic.trim(),
          examFormat,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate practice questions');
      }

      setQuestions(data.questions);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate revision questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!questions) return;
    navigator.clipboard.writeText(questions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!questions) return;
    const blob = new Blob([questions], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject.toLowerCase().replace(/\s+/g, '_')}_revision_questions.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!questions) return;
    onSaveToBinder({
      type: 'questions',
      title: `${subject} – Revision Bank`,
      subtitle: `${unitOrTopic} • ${examFormat}`,
      data: {
        subject,
        unitOrTopic,
        examFormat,
        questions,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Important Question Generator</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Revision Practice Bank
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Categorized revision practice questions (2-mark, 5-mark, and 10-mark) with model answers and scoring rubrics.
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <strong className="font-bold text-amber-950">Academic Integrity Notice:</strong>{' '}
          These questions are curated strictly as <strong>revision practice questions for self-assessment</strong> based on standard college syllabus frameworks. They are <strong>NOT guaranteed exam questions or official exam paper leaks</strong>. Use them to test your readiness and master answer structuring!
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Subject / Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="subject-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Object Oriented Programming, Calculus I, Physics"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="unit-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Unit / Module / Topic Area <span className="text-rose-500">*</span>
              </label>
              <input
                id="unit-input"
                type="text"
                value={unitOrTopic}
                onChange={(e) => setUnitOrTopic(e.target.value)}
                placeholder="e.g., Unit 3: Inheritance & Polymorphism, Chapter 4: Thermodynamics"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Quick Syllabus Modules (Click to fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetUnits.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubject(item.subject);
                    setUnitOrTopic(item.topic);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-800 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {item.subject}: {item.topic.slice(0, 24)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="exam-format-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Examination Target
            </label>
            <select
              id="exam-format-select"
              value={examFormat}
              onChange={(e) => setExamFormat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
            >
              <option value="Semester Midterm / Final Examination">
                Semester Midterm / Final Examination (2-mark, 5-mark, 10-mark)
              </option>
              <option value="Weekly Class Quiz & Internal Assessment">
                Internal Assessment & Short Tests
              </option>
              <option value="Viva Voce & Lab Practical Oral Exam">
                Lab Viva / Practical Oral Defense Questions
              </option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (!subject.trim() && !unitOrTopic.trim())}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assembling Curated Revision Bank with Model Answers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Revision Questions Bank</span>
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
            <p className="font-semibold">Question Generation Failed</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {questions && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Action Toolbar */}
          <div className="no-print bg-red-50/60 border-b border-red-200/80 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-900">
                Revision Bank: {subject}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 bg-red-100/70 hover:bg-red-200 text-red-900 text-xs font-semibold transition-colors shadow-2xs"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800 font-bold">Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-red-700" />
                    <span>Save to Binder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Printable Disclaimer banner in document */}
          <div className="px-6 sm:px-10 pt-6">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
              💡 <em>Disclaimer: Self-assessment revision practice questions for {targetYear} students. Not official or guaranteed exam questions.</em>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10 prose max-w-none">
            <MarkdownViewer content={questions} />
          </div>
        </div>
      )}
    </div>
  );
};
