import { apiFetch } from './client';

export type PostResponse = {
  id: string;
  author_id: string;
  author_name?: string | null;
  category_id: string | null;
  status: string;
  language: string;
  title: string;
  content: string;
  tags: string[];
  helpful_count: number;
  accuracy_avg: number;
  accuracy_count: number;
  created_at?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

export async function listPosts(params: {
  language: string;
  limit?: number;
  offset?: number;
  authorId?: string;
}) {
  const query = new URLSearchParams({
    language: params.language,
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  if (params.authorId) {
    query.set('author_id', params.authorId);
  }
  return apiFetch<PostResponse[]>(`/posts?${query.toString()}`, { method: 'GET', auth: false });
}

export async function listMyPosts(params: { language: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams({
    language: params.language,
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  return apiFetch<PostResponse[]>(`/posts/me?${query.toString()}`, { method: 'GET' });
}

export async function getPost(postId: string, language: string) {
  const query = new URLSearchParams({ language });
  return apiFetch<PostResponse>(`/posts/${postId}?${query.toString()}`, { method: 'GET', auth: false });
}

export async function createPost(payload: {
  title: string;
  content: string;
  category_id?: string | null;
  tags: string[];
  language: string;
  status: 'draft' | 'published';
}) {
  return apiFetch<PostResponse>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePost(
  postId: string,
  payload: {
    title?: string;
    content?: string;
    category_id?: string | null;
    tags?: string[];
    status?: string;
  }
) {
  return apiFetch<PostResponse>(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

