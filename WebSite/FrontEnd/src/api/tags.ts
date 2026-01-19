import { apiFetch } from './client';

export type TagResponse = {
  id: string;
  name: string;
  slug: string;
};

export async function listTags() {
  return apiFetch<TagResponse[]>('/tags', { method: 'GET', auth: false });
}

export async function createTag(payload: { name: string; slug: string }) {
  return apiFetch<TagResponse>('/tags', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTag(tagId: string, payload: { name?: string; slug?: string }) {
  return apiFetch<TagResponse>(`/tags/${tagId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTag(tagId: string) {
  return apiFetch<{ status: string }>(`/tags/${tagId}`, { method: 'DELETE' });
}

