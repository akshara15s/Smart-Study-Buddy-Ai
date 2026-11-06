import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { NotesGenerator } from './components/NotesGenerator.tsx';
import { ConceptExplainer } from './components/ConceptExplainer.tsx';
import { QuizGenerator } from './components/QuizGenerator.tsx';
import { ImportantQuestions } from './components/ImportantQuestions.tsx';
import { CodeExplainer } from './components/CodeExplainer.tsx';
import { StudyPlanner } from './components/StudyPlanner.tsx';
import { SavedBinderModal } from './components/SavedBinderModal.tsx';
import { FeatureType, SavedItem } from './types.ts';
import {
  GraduationCap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'smart_study_buddy_saved_items_v1';
const YEAR_KEY = 'smart_study_buddy_target_year';

export default function App() {
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('dashboard');
  const [targetYear, setTargetYear] = useState<string>(() => {
    return localStorage.getItem(YEAR_KEY) || '1st Year';
  });

  // Quick jump topic for launching directly from dashboard chips
  const [initialFeatureTopic, setInitialFeatureTopic] = useState<string>('');

  // Saved Binder Items
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [binderModalOpen, setBinderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync saved items with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to save items to localStorage', e);
    }
  }, [savedItems]);

  const handleYearChange = (year: string) => {
    setTargetYear(year);
    localStorage.setItem(YEAR_KEY, year);
    showToast(`Switched mode to ${year} College Student`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const handleSaveToBinder = (item: Omit<SavedItem, 'id' | 'timestamp'>) => {
    const newItem: SavedItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setSavedItems((prev) => [newItem, ...prev]);
    showToast(`Saved "${item.title}" to your Study Binder!`);
  };

  const handleDeleteSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from Study Binder');
  };

  const handleClearAllSaved = () => {
    if (window.confirm('Are you sure you want to clear your entire saved Study Binder?')) {
      setSavedItems([]);
      showToast('Study Binder cleared');
    }
  };

  const handleQuickStart = (feature: FeatureType, topic: string) => {
    setInitialFeatureTopic(topic);
    setCurrentFeature(feature);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadItemIntoTool = (item: SavedItem) => {
    setCurrentFeature(item.type);
    if (item.type === 'notes') {
      setInitialFeatureTopic(item.data.topic || item.title);
    } else if (item.type === 'explainer') {
      setInitialFeatureTopic(item.data.concept || item.title);
    } else if (item.type === 'quiz') {
      setInitialFeatureTopic(item.data.topic || item.title);
    } else if (item.type === 'questions') {
      setInitialFeatureTopic(item.data.subject || item.title);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Navbar */}
      <Navbar
        currentFeature={currentFeature}
        onSelectFeature={(feat) => {
          setInitialFeatureTopic('');
          setCurrentFeature(feat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedItems.length}
        onOpenBinder={() => setBinderModalOpen(true)}
        targetYear={targetYear}
        onChangeTargetYear={handleYearChange}
      />

      {/* Breadcrumb Navigation when inside a feature */}
      {currentFeature !== 'dashboard' && (
        <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => {
                setInitialFeatureTopic('');
                setCurrentFeature('dashboard');
              }}
              className="hover:text-red-600 transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-red-700 font-bold capitalize">
              {currentFeature === 'notes' && 'AI Notes Generator'}
              {currentFeature === 'explainer' && 'Simple Concept Explainer'}
              {currentFeature === 'quiz' && 'AI Quiz Generator (5 MCQs)'}
              {currentFeature === 'questions' && 'Revision Practice Questions'}
              {currentFeature === 'code' && 'Line-by-Line Code Explainer'}
              {currentFeature === 'planner' && 'Realistic Study Planner'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentFeature === 'dashboard' && (
          <Dashboard
            onSelectFeature={(feat) => {
              setInitialFeatureTopic('');
              setCurrentFeature(feat);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onQuickStart={handleQuickStart}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'notes' && (
          <NotesGenerator
            initialTopic={initialFeatureTopic}
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'explainer' && (
          <ConceptExplainer
            initialConcept={initialFeatureTopic}
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'quiz' && (
          <QuizGenerator
            initialTopic={initialFeatureTopic}
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'questions' && (
          <ImportantQuestions
            initialSubject={initialFeatureTopic}
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'code' && (
          <CodeExplainer
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}

        {currentFeature === 'planner' && (
          <StudyPlanner
            onSaveToBinder={handleSaveToBinder}
            targetYear={targetYear}
          />
        )}
      </main>

      {/* Study Binder Modal */}
      <SavedBinderModal
        isOpen={binderModalOpen}
        onClose={() => setBinderModalOpen(false)}
        savedItems={savedItems}
        onDeleteItem={handleDeleteSavedItem}
        onClearAll={handleClearAllSaved}
        onLoadItemIntoTool={handleLoadItemIntoTool}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-sm">
                Smart Study Buddy AI
              </span>
              <span className="text-xs text-slate-400">
                • Generative AI in Education
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
              <button
                onClick={() => setCurrentFeature('notes')}
                className="hover:text-red-600 transition-colors"
              >
                Notes Generator
              </button>
              <button
                onClick={() => setCurrentFeature('explainer')}
                className="hover:text-red-600 transition-colors"
              >
                Concept Explainer
              </button>
              <button
                onClick={() => setCurrentFeature('quiz')}
                className="hover:text-red-600 transition-colors"
              >
                Quiz Generator
              </button>
              <button
                onClick={() => setCurrentFeature('questions')}
                className="hover:text-red-600 transition-colors"
              >
                Revision Bank
              </button>
              <button
                onClick={() => setCurrentFeature('code')}
                className="hover:text-red-600 transition-colors"
              >
                Code Explainer
              </button>
              <button
                onClick={() => setCurrentFeature('planner')}
                className="hover:text-red-600 transition-colors"
              >
                Study Planner
              </button>
            </div>

            <div className="text-xs text-slate-400 text-center sm:text-right">
              Powered by Google Gemini • For College 1st & 2nd Year Students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
