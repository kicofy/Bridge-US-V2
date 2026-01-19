import { apiFetch } from './client';

export type NotificationResponse = {
  id: string;
  user_id: string;
  type: string;
  payload?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at?: string | null;
};

export async function listNotifications(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<NotificationResponse[]>(`/notifications?${query.toString()}`, {
    method: 'GET',
  });
}

export async function markNotificationsRead(ids: string[]) {
  return apiFetch<{ status: string }>('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function markAllNotificationsRead() {
  return apiFetch<{ status: string }>('/notifications/read-all', {
    method: 'POST',
  });
}

