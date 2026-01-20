import { apiFetch } from './client';
import { API_BASE_URL } from './client';
import { useAuthStore } from '../store/auth';
import { ApiError } from './client';

export async function askQuestion(question: string) {
  return apiFetch<{ answer: string }>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function askQuestionStream(
  question: string,
  onDelta: (chunk: string) => void
): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}/ai/ask-stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question }),
  });

  // 如果后端尚未部署流式接口，降级为普通 ask
  if (response.status === 404) {
    const fallback = await askQuestion(question);
    onDelta(fallback.answer);
    return;
  }

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const payload = await response.json();
      message = payload.message || payload.detail || message;
      code = payload.code;
    } catch {
      // non-json stream
    }
    throw new ApiError(message, response.status, code);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError('No response stream', 500);
  }

  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onDelta(text);
  }
}
