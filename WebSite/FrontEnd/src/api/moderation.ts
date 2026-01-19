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

