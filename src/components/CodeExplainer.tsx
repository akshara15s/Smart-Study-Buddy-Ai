import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  Bookmark,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer.tsx';
import { SavedItem } from '../types.ts';

interface CodeExplainerProps {
  initialLanguage?: string;
  onSaveToBinder: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  targetYear: string;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  initialLanguage = 'Python',
  onSaveToBinder,
  targetYear,
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(`def fibonacci(n):
    # Base cases
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    # Recursive calculation
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test with 6th term
print("Result:", fibonacci(6))`);

  const [focusArea, setFocusArea] = useState('Line-by-line syntax & memory flow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const codeSnippets: Record<string, { title: string; lang: string; snippet: string }> = {
    py_fibo: {
      title: 'Python: Recursive Fibonacci',
      lang: 'Python',
      snippet: `def fibonacci(n):
    # Base cases
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    # Recursive calculation
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test with 6th term
print("Result:", fibonacci(6))`,
    },
    c_pointers: {
      title: 'C: Swap Using Pointers',
      lang: 'C',
      snippet: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a; // Dereference a to get value
    *a = *b;       // Put value of b into address a
    *b = temp;     // Put temp into address b
}

int main() {
    int x = 10, y = 20;
    printf("Before: x=%d, y=%d\\n", x, y);
    swap(&x, &y); // Pass memory addresses
    printf("After:  x=%d, y=%d\\n", x, y);
    return 0;
}`,
    },
    java_oop: {
      title: 'Java: Class & Inheritance',
      lang: 'Java',
      snippet: `class Student {
    protected String name;
    protected int studentId;

    public Student(String name, int id) {
        this.name = name;
        this.studentId = id;
    }

    public void displayInfo() {
        System.out.println("ID: " + studentId + ", Name: " + name);
    }
}

class CSStudent extends Student {
    private String favoriteLanguage;

    public CSStudent(String name, int id, String lang) {
        super(name, id);
        this.favoriteLanguage = lang;
    }
}`,
    },
    html_card: {
      title: 'HTML: Responsive Card',
      lang: 'HTML',
      snippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .student-card {
      max-width: 350px;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-family: sans-serif;
      background: #ffffff;
    }
    .badge {
      background: #dc2626;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="student-card">
    <span class="badge">Freshman CS</span>
    <h2>Data Structures 101</h2>
    <p>Mastering linked lists and binary search trees.</p>
  </div>
</body>
</html>`,
    },
    c_bsearch: {
      title: 'C: Binary Search Array',
      lang: 'C',
      snippet: `int binarySearch(int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target)
            return mid; // Target found
        else if (arr[mid] < target)
            low = mid + 1; // Search right half
        else
            high = mid - 1; // Search left half
    }
    return -1; // Not found
}`,
    },
  };

  const handleSelectSnippet = (key: string) => {
    const item = codeSnippets[key];
    if (item) {
      setLanguage(item.lang);
      setCode(item.snippet);
    }
  };

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please paste or write a code snippet.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          language,
          focusArea,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to explain code');
      }

      setExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate code explanation. Please try again.');
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
    link.download = `${language.toLowerCase()}_code_walkthrough.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!explanation) return;
    onSaveToBinder({
      type: 'code',
      title: `${language} Code Breakdown`,
      subtitle: `${code.split('\n')[0].slice(0, 35)}...`,
      data: {
        language,
        code,
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
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Line-by-Line Code Explainer</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Python • Java • C • C++ • HTML
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Demystify code line by line with visual dry runs, time complexity breakdowns, and beginner gotchas.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <form onSubmit={handleExplain} className="space-y-5">
          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Load Beginner College Algorithms & Examples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(codeSnippets).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectSnippet(key)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-800 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Language and focus selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code-lang-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Programming Language
              </label>
              <select
                id="code-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              >
                <option value="Python">Python</option>
                <option value="C">C (Pointers & Structs)</option>
                <option value="Java">Java (OOP & Collections)</option>
                <option value="C++">C++</option>
                <option value="HTML/CSS">HTML & CSS</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>

            <div>
              <label htmlFor="focus-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Specific Doubt or Focus
              </label>
              <input
                id="focus-input"
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g., Why do we use *a here? What is the base case?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Code Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="code-editor" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Source Code to Explain <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCode('')}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span className="text-red-400 font-semibold">{language} Code Input</span>
                <span>{code.split('\n').length} lines</span>
              </div>
              <textarea
                id="code-editor"
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste beginner code snippet here..."
                className="w-full p-4 font-mono text-xs sm:text-sm text-emerald-300 bg-slate-950 focus:outline-none resize-y selection:bg-red-700 selection:text-white leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dissecting Code & Computing Dry Run...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Explain Code Line-by-Line</span>
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
            <p className="font-semibold">Code Explanation Failed</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Action Toolbar */}
          <div className="no-print bg-red-50/60 border-b border-red-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Code Breakdown: {language}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800 font-bold">Saved!</span>
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

          {/* Content */}
          <div className="p-6 sm:p-10 prose max-w-none">
            <MarkdownViewer content={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
