export type FeatureType =
  | 'dashboard'
  | 'notes'
  | 'explainer'
  | 'quiz'
  | 'questions'
  | 'code'
  | 'planner';

export interface SavedItem {
  id: string;
  type: FeatureType;
  title: string;
  subtitle?: string;
  timestamp: number;
  data: any;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface QuizData {
  quizTitle: string;
  topic: string;
  overview?: string;
  questions: QuizQuestion[];
}

export interface StudyBlock {
  timeSlot: string;
  subject: string;
  activity: string;
  technique?: string;
  priority?: string;
  completed?: boolean;
}

export interface StudyDay {
  day: string;
  theme: string;
  totalHours: number;
  blocks: StudyBlock[];
}

export interface StudyPlanData {
  planTitle: string;
  summary: string;
  dailyTargetHours: number;
  strategyTips?: string[];
  schedule: StudyDay[];
  retentionAdvice?: string;
}
