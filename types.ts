
export enum UserRole {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  phone?: string;
  institution?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}

export interface SourceCard {
  siteName: string;
  url: string;
  snippet: string;
  similarityScore?: number;
  credibilityScore?: number;
}

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface NoteContent {
  id: string;
  title: string;
  category: 'Business' | 'Technical' | 'Creative' | 'General';
  structuredNotes: string;
  detailedAnalysis?: string;
  summary: string;
  keyTerms: string[];
  visualData?: string;
  equations?: string[];
  sources: SourceCard[];
  whatIfScenarios: string[];
  actionItems?: ActionItem[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'MCQ' | 'SHORT' | 'LONG' | 'SCENARIO';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  code: string;
  timeLimit: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  createdBy: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
  answers: Record<string, string>;
  feedback?: string;
}
