import { apiFetch } from './client';

export type ReportResponse = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  evidence?: string | null;
  status: string;
  created_at?: string | null;
  resolved_at?: string | null;
};

export async function createReport(payload: {
  target_type: 'post' | 'reply';
  target_id: string;
  reason: string;
  evidence?: string | null;
}) {
  return apiFetch<{ status?: string; id?: string } | Record<string, unknown>>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listMyReports(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<ReportResponse[]>(`/reports/me?${query.toString()}`, {
    method: 'GET',
  });
}

export async function listReports(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<ReportResponse[]>(`/reports?${query.toString()}`, {
    method: 'GET',
  });
}

export async function resolveReport(
  reportId: string,
  payload: { action: 'hide' | 'restore' | 'reject'; note?: string | null }
) {
  return apiFetch<ReportResponse>(`/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

