import { apiFetch } from './client';

export async function askQuestion(question: string) {
  return apiFetch<{ answer: string }>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

