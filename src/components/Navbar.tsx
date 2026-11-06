import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Code2,
  CalendarDays,
  Bookmark,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { FeatureType } from '../types.ts';

interface NavbarProps {
  currentFeature: FeatureType;
  onSelectFeature: (feature: FeatureType) => void;
  savedCount: number;
  onOpenBinder: () => void;
  targetYear: string;
  onChangeTargetYear: (year: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFeature,
  onSelectFeature,
  savedCount,
  onOpenBinder,
  targetYear,
  onChangeTargetYear,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as FeatureType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes' as FeatureType, label: 'AI Notes', icon: BookOpen },
    { id: 'explainer' as FeatureType, label: 'Concept Explainer', icon: Sparkles },
    { id: 'quiz' as FeatureType, label: 'Quiz Generator', icon: HelpCircle },
    { id: 'questions' as FeatureType, label: 'Revision Questions', icon: FileQuestion },
    { id: 'code' as FeatureType, label: 'Code Explainer', icon: Code2 },
    { id: 'planner' as FeatureType, label: 'Study Planner', icon: CalendarDays },
  ];

  const handleNavClick = (id: FeatureType) => {
    onSelectFeature(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-950 via-red-800 to-red-600 bg-clip-text text-transparent">
                  Smart Study Buddy
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Student Learning Assistant
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentFeature === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-red-50 text-red-700 shadow-xs border border-red-200/80'
                      : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Year Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => onChangeTargetYear('1st Year')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  targetYear === '1st Year'
                    ? 'bg-white text-red-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="First Year Freshman Focus"
              >
                1st Year
              </button>
              <button
                onClick={() => onChangeTargetYear('2nd Year')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  targetYear === '2nd Year'
                    ? 'bg-white text-red-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Second Year Sophomore Focus"
              >
                2nd Year
              </button>
            </div>

            {/* Study Binder Button */}
            <button
              onClick={onOpenBinder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100/80 text-red-700 text-xs font-semibold transition-all shadow-xs"
              title="Open Saved Study Binder"
            >
              <Bookmark className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Saved Binder</span>
              {savedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center ml-0.5">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-red-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-medium text-slate-500">Student Level:</span>
            <div className="flex gap-1">
              {['1st Year', '2nd Year'].map((year) => (
                <button
                  key={year}
                  onClick={() => onChangeTargetYear(year)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    targetYear === year
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentFeature === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
