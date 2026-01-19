import { apiFetch } from './client';
import type { PostResponse } from './posts';

export async function searchPosts(params: {
  q?: string;
  language: string;
  categoryId?: string;
  tags?: string[];
  sort?: 'newest' | 'helpful' | 'accuracy';
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  query.set('language', params.language);
  if (params.categoryId && params.categoryId !== 'all') {
    query.set('category_id', params.categoryId);
  }
  if (params.tags && params.tags.length > 0) {
    query.set('tags', params.tags.join(','));
  }
  query.set('sort', params.sort ?? 'newest');
  query.set('limit', String(params.limit ?? 20));
  query.set('offset', String(params.offset ?? 0));
  return apiFetch<{ items: PostResponse[]; total: number }>(
    `/search?${query.toString()}`,
    { method: 'GET', auth: false }
  );
}

export async function fetchSuggestions(q: string, limit = 10) {
  const query = new URLSearchParams({ q, limit: String(limit) });
  return apiFetch<{ items: string[] }>(`/search/suggestions?${query.toString()}`, {
    method: 'GET',
    auth: false,
  });
}

export async function fetchTrending(language: string, limit = 10) {
  const query = new URLSearchParams({ language, limit: String(limit) });
  return apiFetch<{ items: PostResponse[] }>(`/search/trending?${query.toString()}`, {
    method: 'GET',
    auth: false,
  });
}

