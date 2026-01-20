import { apiFetch } from './client';

export type AppealResponse = {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  reviewed_at?: string | null;
  created_at?: string | null;
};

export async function listMyAppeals(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<AppealResponse[]>(`/moderation/appeals/me?${query.toString()}`, {
    method: 'GET',
  });
}

export async function listAppeals(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<AppealResponse[]>(`/moderation/appeals?${query.toString()}`, {
    method: 'GET',
  });
}

export async function approveAppeal(appealId: string) {
  return apiFetch<AppealResponse>(`/moderation/appeals/${appealId}/approve`, {
    method: 'POST',
  });
}

export async function rejectAppeal(appealId: string) {
  return apiFetch<AppealResponse>(`/moderation/appeals/${appealId}/reject`, {
    method: 'POST',
  });
}

export type PendingPost = {
  id: string;
  author_id: string;
  author_email?: string | null;
  title?: string | null;
  original_language?: string | null;
  status: string;
  created_at?: string | null;
};

export async function listPendingPosts(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<PendingPost[]>(`/moderation/queue/posts?${query.toString()}`, {
    method: 'GET',
  });
}

export async function approvePendingPost(postId: string, reason?: string | null) {
  return apiFetch<{ status: string; post_id: string; post_status: string }>(
    `/moderation/posts/${postId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
}

export async function rejectPendingPost(postId: string, reason?: string | null) {
  return apiFetch<{ status: string; post_id: string; post_status: string }>(
    `/moderation/posts/${postId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
}

