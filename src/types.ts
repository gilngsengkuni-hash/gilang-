export type UserRole = 'admin' | 'guru' | 'siswa';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_name: string;
}

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  created_by: string;
  created_at?: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  created_by: string;
  created_at?: string;
  questions?: Question[];
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
}

export interface Answer {
  id: string;
  user_id: string;
  exam_id: string;
  question_id: string;
  answer: string;
}

export interface ExamResult {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  completed_at: string;
  exam?: Exam;
  user?: UserProfile;
}
