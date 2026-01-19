import { apiFetch } from './client';

export type ReplyResponse = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  helpful_count: number;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function listReplies(params: {
  postId: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams({
    post_id: params.postId,
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  return apiFetch<ReplyResponse[]>(`/replies?${query.toString()}`, { method: 'GET', auth: false });
}

export async function createReply(postId: string, content: string) {
  const query = new URLSearchParams({ post_id: postId });
  return apiFetch<ReplyResponse>(`/replies?${query.toString()}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function listMyReplies(params: { limit?: number; offset?: number }) {
  const query = new URLSearchParams({
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  return apiFetch<ReplyResponse[]>(`/replies/me?${query.toString()}`, { method: 'GET' });
}

export async function listAllReplies(params: { limit?: number; offset?: number; status?: string }) {
  const query = new URLSearchParams({
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  if (params.status) {
    query.set('status', params.status);
  }
  return apiFetch<ReplyResponse[]>(`/replies/admin?${query.toString()}`, { method: 'GET' });
}

