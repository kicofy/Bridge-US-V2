import { apiFetch } from './client';

export type PostResponse = {
  id: string;
  author_id: string;
  author_name?: string | null;
  category_id: string | null;
  status: string;
  translation_status?: string | null;
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
  includeHidden?: boolean;
  auth?: boolean;
}) {
  const query = new URLSearchParams({
    language: params.language,
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  if (params.authorId) {
    query.set('author_id', params.authorId);
  }
  if (params.includeHidden) {
    query.set('include_hidden', 'true');
  }
  return apiFetch<PostResponse[]>(`/posts?${query.toString()}`, { method: 'GET', auth: params.auth ?? false });
}

export async function listMyPosts(params: { language: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams({
    language: params.language,
    limit: String(params.limit ?? 20),
    offset: String(params.offset ?? 0),
  });
  return apiFetch<PostResponse[]>(`/posts/me?${query.toString()}`, { method: 'GET' });
}

export async function getPost(postId: string, language: string, auth: boolean = false) {
  const query = new URLSearchParams({ language });
  return apiFetch<PostResponse>(`/posts/${postId}?${query.toString()}`, { method: 'GET', auth });
}

export async function createPost(payload: {
  title: string;
  content: string;
  category_id?: string | null;
  tags: string[];
  language: string;
  status: 'draft' | 'published' | 'pending';
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

export async function hidePost(postId: string) {
  return apiFetch<PostResponse>(`/posts/${postId}/hide`, { method: 'POST' });
}

export async function restorePost(postId: string) {
  return apiFetch<PostResponse>(`/posts/${postId}/restore`, { method: 'POST' });
}

export async function deletePost(postId: string) {
  return apiFetch<{ status: string }>(`/posts/${postId}`, { method: 'DELETE' });
}

