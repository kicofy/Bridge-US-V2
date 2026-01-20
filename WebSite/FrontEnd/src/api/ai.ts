import { apiFetch, API_BASE_URL, ApiError } from './client';
import { useAuthStore } from '../store/auth';

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
  const debugPrefix = '[askQuestionStream]';
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  console.info(`${debugPrefix} sending`, { apiBase: API_BASE_URL, hasToken: Boolean(accessToken) });

  const response = await fetch(`${API_BASE_URL}/ai/ask-stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question }),
  });

  // 如果后端尚未部署流式接口，降级为普通 ask
  if (response.status === 404) {
    console.warn(`${debugPrefix} 404 fallback to /ai/ask`);
    const fallback = await askQuestion(question);
    onDelta(fallback.answer);
    return;
  }

  if (!response.ok) {
    console.error(`${debugPrefix} non-OK status`, response.status);
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

  console.info(`${debugPrefix} streaming start`, {
    status: response.status,
    contentLength: response.headers.get('content-length'),
    contentType: response.headers.get('content-type'),
    xAccelBuffering: response.headers.get('x-accel-buffering'),
    transferEncoding: response.headers.get('transfer-encoding'),
  });

  const reader = response.body?.getReader();
  if (!reader) {
    console.error(`${debugPrefix} no reader`);
    throw new ApiError('No response stream', 500);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.info(`${debugPrefix} stream done`);
      break;
    }
    console.debug(`${debugPrefix} chunk bytes`, value?.length ?? 0);
    const text = decoder.decode(value, { stream: true });
    if (text) {
      console.debug(`${debugPrefix} chunk text`, text);
      buffer += text;
      // SSE 事件以空行分隔
      while (buffer.includes('\n\n')) {
        const idx = buffer.indexOf('\n\n');
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = event.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const payload = line.replace(/^data:\s*/, '');
            if (payload) onDelta(payload);
          }
        }
      }
    }
  }
  // flush any remaining buffered bytes
  const tail = decoder.decode();
  if (tail) {
    buffer += tail;
  }
  if (buffer.trim()) {
    console.debug(`${debugPrefix} tail buffer`, buffer);
    const lines = buffer.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const payload = line.replace(/^data:\s*/, '');
        if (payload) onDelta(payload);
      }
    }
  }
}
