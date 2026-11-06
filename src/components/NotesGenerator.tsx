import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
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

interface NotesGeneratorProps {
  initialTopic?: string;
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({
  initialTopic = '',
  onSaveToBinder,
  targetYear,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState('Computer Science');
  const [depth, setDepth] = useState('Standard College Lecture Notes');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const subjects = [
    'Computer Science',
    'Data Structures & Algorithms',
    'Physics & Mechanics',
    'Chemistry & Thermodynamics',
    'Calculus & Linear Algebra',
    'Biology & Genetics',
    'Electrical & Electronics Eng',
    'Economics & Business',
    'Psychology & Human Behavior',
  ];

  const depthOptions = [
    { label: 'Quick High-Yield Revision', desc: 'Concise summary, formulas & 5-min recap' },
    { label: 'Standard College Lecture Notes', desc: 'Comprehensive definitions, examples & mechanics' },
    { label: 'In-Depth Exam Preparation', desc: 'Full theory, proofs, common exam gotchas & flashcards' },
  ];

  const popularTopics = [
    'Binary Search Trees',
    'Photosynthesis Light Reactions',
    'Ohm’s Law & Kirchhoff’s Rules',
    'First Law of Thermodynamics',
    'Database Normalization (1NF to 3NF)',
    'Limits & Continuity in Calculus',
    'Newtonian Gravity & Orbits',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic or concept to generate notes.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          subject,
          depth,
          additionalInstructions: additionalNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      setGeneratedNotes(data.notes);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong while connecting to the AI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedNotes) return;
    const blob = new Blob([generatedNotes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic.toLowerCase().replace(/\s+/g, '_')}_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!generatedNotes) return;
    onSaveToBinder({
      type: 'notes',
      title: topic,
      subtitle: `${subject} • ${depth}`,
      data: {
        topic,
        subject,
        depth,
        content: generatedNotes,
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
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Notes Generator</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              {targetYear} Level
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate clean, structured academic notes with definitions, real-world examples, and flashcard summaries.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Topic or Lecture Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Binary Search Trees, 1st Law of Thermodynamics, Pointers in C"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
            />
          </div>

          {/* Quick Preset Topics */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Popular College Topics (Click to try):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularTopics.map((pt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopic(pt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Subject & Depth Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Subject / Course
              </label>
              <select
                id="subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="depth-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Note Depth
              </label>
              <select
                id="depth-select"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                {depthOptions.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional instructions */}
          <div>
            <label htmlFor="additional-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Optional Custom Instructions (Optional)
            </label>
            <input
              id="additional-input"
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g., Focus on numerical formulas and common exam definitions"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Structured College Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Notes</span>
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
            <p className="font-semibold">Generation Failed</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Output Notes Section */}
      {generatedNotes && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Action Toolbar */}
          <div className="no-print bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Generated Notes Preview
              </span>
              <span className="text-xs text-slate-400 font-medium">({subject})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Copy all notes to clipboard"
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
                title="Download as Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Print notes or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Save to your browser Study Binder"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-red-600" />
                    <span>Save to Binder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notes Content */}
          <div className="p-6 sm:p-10 prose max-w-none">
            <MarkdownViewer content={generatedNotes} />
          </div>
        </div>
      )}
    </div>
  );
};
