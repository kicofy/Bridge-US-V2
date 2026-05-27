import { apiFetch } from './client';

export interface AIHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askQuestion(question: string, history: AIHistoryMessage[] = []) {
  return apiFetch<{ answer: string }>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question, history }),
  });
}
