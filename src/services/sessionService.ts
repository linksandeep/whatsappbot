// src/services/sessionService.ts
// import { biz } from '../data/bizData';

// Session interface
export interface Session {
  phone: string;
  currentTopic: 'agentic_ai' | 'data_analytics' | null;
  conversationStage: 'new' | 'greeting' | 'topic_selected';
  lastQuestion: string | null;
  lastResponseType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory session store (use Redis for production)
const sessions = new Map<string, Session>();

// Helper functions
export const cleanText = (text: string): string => {
  return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
};

export const updateSession = async (phone: string, updates: Partial<Session>): Promise<Session> => {
  const existingSession = sessions.get(phone);
  
  const session: Session = existingSession || {
    phone,
    currentTopic: null,
    conversationStage: 'new',
    lastQuestion: null,
    lastResponseType: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  Object.assign(session, updates, { updatedAt: new Date() });
  sessions.set(phone, session);
  
  return session;
};

export const getSession = (phone: string): Session => {
  const session = sessions.get(phone);
  if (!session) {
    // Create a new session if none exists
    return {
      phone,
      currentTopic: null,
      conversationStage: 'new',
      lastQuestion: null,
      lastResponseType: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return session;
};

export const clearSession = (phone: string): void => {
  sessions.delete(phone);
};