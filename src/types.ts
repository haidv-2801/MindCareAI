export interface UserProfile {
  fullName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  birthYear: number;
  bio?: string;
  interests?: string[];
  aiPersona?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  sessionTitle: string;
  sessionSummary?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  messageText: string;
  emotionDetected?: string;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  moodLevel: number;
  moodNote?: string;
  recordedDate: string;
}

export interface PsychologicalAssessment {
  id: string;
  userId: string;
  stressLevel: number;
  anxietyLevel: number;
  depressionLevel: number;
  sleepQuality: number;
  createdAt: string;
}

export interface CrisisAlert {
  id: string;
  userId: string;
  sessionId: string;
  alertLevel: 'low' | 'medium' | 'high';
  alertMessage: string;
  createdAt: string;
}
