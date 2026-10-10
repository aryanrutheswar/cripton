export type NoteFormat = 
  | 'QUICK REVISION'
  | 'DETAILED STUDY NOTES'
  | 'UNIVERSITY EXAM ANSWER'
  | '2-MARK ANSWER'
  | '5-MARK ANSWER'
  | '10-MARK ANSWER'
  | 'LAST-MINUTE REVISION'
  | 'VIVA PREPARATION';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  follow_ups?: string[];
}

export interface ChatSession {
  session_id: string;
  title: string;
  first_question?: string;
  last_message?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface StudyNote {
  id: string;
  title: string;
  topic: string;
  format: NoteFormat;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface DocumentInfo {
  document_id: string;
  filename: string;
  page_count: number;
  word_count: number;
  chunk_count: number;
  is_scanned: boolean;
  preview_snippet: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

export interface SystemConfig {
  has_api_key: boolean;
  model: string;
  available_formats: NoteFormat[];
}
