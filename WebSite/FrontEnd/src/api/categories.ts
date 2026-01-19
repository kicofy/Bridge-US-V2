import { apiFetch } from './client';

export type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  status: string;
};

export async function listCategories() {
  return apiFetch<CategoryResponse[]>('/categories', {
    method: 'GET',
    auth: false,
  });
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  sort_order?: number;
  status?: string;
}) {
  return apiFetch<CategoryResponse>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  categoryId: string,
  payload: { name?: string; slug?: string; sort_order?: number; status?: string }
) {
  return apiFetch<CategoryResponse>(`/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(categoryId: string) {
  return apiFetch<{ status: string }>(`/categories/${categoryId}`, { method: 'DELETE' });
}

