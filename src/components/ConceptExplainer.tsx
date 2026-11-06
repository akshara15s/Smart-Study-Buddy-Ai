import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Bookmark,
  Download,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer.tsx';
import { SavedItem } from '../types.ts';

interface ConceptExplainerProps {
  initialConcept?: string;
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  initialConcept = '',
  onSaveToBinder,
  targetYear,
}) => {
  const [concept, setConcept] = useState(initialConcept);
  const [field, setField] = useState('Computer Science & Tech');
  const [style, setStyle] = useState('Intuitive & Relatable College Freshman');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const academicFields = [
    'Computer Science & Tech',
    'Physics & Engineering',
    'Mathematics & Statistics',
    'Biology & Medicine',
    'Chemistry & Materials',
    'Economics & Finance',
    'Philosophy & Logic',
    'General Sciences',
  ];

  const explanationStyles = [
    {
      id: 'Intuitive & Relatable College Freshman',
      title: 'Freshman Intuitive',
      desc: 'Balanced, conversational, analogies + college-level rigor',
    },
    {
      id: 'ELI5 (Everyday Metaphors & Analogy)',
      title: 'ELI5 & Metaphors',
      desc: 'Ultra-simple, comparing concepts to cooking, sports & smartphones',
    },
    {
      id: 'Visual Step-by-Step Logic Model',
      title: 'Visual Logic Flow',
      desc: 'Sequential mental models and flowchart-style steps',
    },
    {
      id: 'Deep Dive with Practical College Context',
      title: 'Deep College Context',
      desc: 'Connects concept to lab work, exams, and real-world tools',
    },
  ];

  const presetConcepts = [
    'Pointers in C & Memory Addresses',
    'Recursion vs Iteration',
    'Entropy & The 2nd Law of Thermodynamics',
    'Database Normalization (1NF to 3NF)',
    'Opportunity Cost & Marginal Utility',
    'Central Dogma of Molecular Biology',
    'Time Complexity & Big O Notation',
  ];

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) {
      setError('Please enter a concept to explain.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept.trim(),
          field,
          style,
          studentYear: targetYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to explain concept');
      }

      setExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!explanation) return;
    const blob = new Blob([explanation], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${concept.toLowerCase().replace(/\s+/g, '_')}_explained.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!explanation) return;
    onSaveToBinder({
      type: 'explainer',
      title: concept,
      subtitle: `${field} • ${style}`,
      data: {
        concept,
        field,
        style,
        explanation,
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
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Simple Concept Explainer</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              No Jargon Zone
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Demystify difficult college theories with relatable metaphors, step-by-step logic, and intuition checks.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleExplain} className="space-y-5">
          {/* Concept Input */}
          <div>
            <label htmlFor="concept-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Concept, Theory, or Term <span className="text-rose-500">*</span>
            </label>
            <input
              id="concept-input"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Pointers in C, Entropy in Thermodynamics, Recursion, Normalization"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm font-medium transition-all"
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Commonly Confusing Freshman Concepts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetConcepts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConcept(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Field & Style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Academic Discipline
              </label>
              <select
                id="field-select"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm font-medium transition-all"
              >
                {academicFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="style-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Explanation Tone
              </label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm font-medium transition-all"
              >
                {explanationStyles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.desc.slice(0, 30)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Distilling Concept into Simple Intuition...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span>Explain Concept Simply</span>
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
            <p className="font-semibold">Explanation Error</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Action Toolbar */}
          <div className="no-print bg-rose-50/60 border-b border-rose-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Simple Explanation: {concept}
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
                onClick={handleSave}
                disabled={saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-rose-600" />
                    <span>Save to Binder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explanation Content */}
          <div className="p-6 sm:p-10 prose max-w-none">
            <MarkdownViewer content={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
