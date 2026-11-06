import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Code2,
  CalendarDays,
  Search,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { SavedItem, FeatureType } from '../types.ts';
import { MarkdownViewer } from './MarkdownViewer.tsx';

interface SavedBinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onLoadItemIntoTool: (item: SavedItem) => void;
}

export const SavedBinderModal: React.FC<SavedBinderModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onDeleteItem,
  onClearAll,
  onLoadItemIntoTool,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getIconForType = (type: FeatureType) => {
    switch (type) {
      case 'notes':
        return BookOpen;
      case 'explainer':
        return Sparkles;
      case 'quiz':
        return HelpCircle;
      case 'questions':
        return FileQuestion;
      case 'code':
        return Code2;
      case 'planner':
        return CalendarDays;
      default:
        return Bookmark;
    }
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCopySelected = () => {
    if (!selectedItem) return;
    let textToCopy = '';
    if (selectedItem.type === 'notes') textToCopy = selectedItem.data.content;
    else if (selectedItem.type === 'explainer') textToCopy = selectedItem.data.explanation;
    else if (selectedItem.type === 'questions') textToCopy = selectedItem.data.questions;
    else if (selectedItem.type === 'code') textToCopy = selectedItem.data.explanation;
    else textToCopy = JSON.stringify(selectedItem.data, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Personal Study Binder
              </h2>
              <p className="text-xs text-slate-500">
                Saved notes, quizzes, questions, and revision blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedItems.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved binder..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'notes', label: 'Notes' },
              { id: 'explainer', label: 'Concepts' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'questions', label: 'Questions' },
              { id: 'code', label: 'Code' },
              { id: 'planner', label: 'Plans' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeFilter === f.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Left List, Right Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Item List */}
          <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs font-medium">No saved items found.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Save to Binder" on any generated notes, quiz, or plan to store it here.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = getIconForType(item.type);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 cursor-pointer transition-colors relative flex items-start gap-3 group ${
                      isSelected
                        ? 'bg-red-50/90 border-l-4 border-red-600'
                        : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                        if (selectedItem?.id === item.id) setSelectedItem(null);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete saved item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Preview Pane */}
          <div className="hidden sm:flex flex-1 flex-col overflow-y-auto bg-white p-6">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Preview Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                      Saved {selectedItem.type.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedItem.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySelected}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadItemIntoTool(selectedItem);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Tool</span>
                    </button>
                  </div>
                </div>

                {/* Content Render */}
                <div className="prose max-w-none text-xs sm:text-sm">
                  {selectedItem.type === 'notes' && (
                    <MarkdownViewer content={selectedItem.data.content} />
                  )}
                  {selectedItem.type === 'explainer' && (
                    <MarkdownViewer content={selectedItem.data.explanation} />
                  )}
                  {selectedItem.type === 'questions' && (
                    <MarkdownViewer content={selectedItem.data.questions} />
                  )}
                  {selectedItem.type === 'code' && (
                    <MarkdownViewer content={selectedItem.data.explanation} />
                  )}
                  {selectedItem.type === 'quiz' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 text-red-900 rounded-lg text-xs font-medium">
                        Quiz Title: <strong>{selectedItem.data.quiz?.quizTitle}</strong> ({selectedItem.data.quiz?.questions?.length || 5} Questions)
                      </div>
                      {selectedItem.data.quiz?.questions?.map((q: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-slate-800">
                            {q.id}. {q.question}
                          </p>
                          <p className="text-emerald-700 font-semibold">
                            Correct: Option {q.correctAnswer}
                          </p>
                          <p className="text-slate-600 text-[11px]">{q.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedItem.type === 'planner' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 text-red-900 rounded-lg text-xs font-medium">
                        {selectedItem.data.plan?.summary}
                      </div>
                      <div className="text-xs text-slate-600">
                        {selectedItem.data.plan?.schedule?.length} Days scheduled. Open in tool to view interactive checklist.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Bookmark className="w-10 h-10 stroke-1" />
                <p className="text-xs">Select any item on the left to preview its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
