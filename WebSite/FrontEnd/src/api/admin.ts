import { apiFetch } from './client';

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  last_login_at?: string | null;
  created_at?: string | null;
};

export type AdminMe = {
  id: string;
  email: string;
  role: string;
  is_root: boolean;
};

export async function listAdminUsers(limit = 20, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<AdminUser[]>(`/admin/users?${query.toString()}`, { method: 'GET' });
}

export type AdminUserDetail = AdminUser & {
  posts_count: number;
  replies_count: number;
  reports_filed: number;
  reports_received: number;
  display_name?: string | null;
  language_preference?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
};

export async function getAdminUserDetail(userId: string) {
  return apiFetch<AdminUserDetail>(`/admin/users/${userId}`, { method: 'GET' });
}

export async function getAdminMe() {
  return apiFetch<AdminMe>('/admin/me', { method: 'GET' });
}

export async function banUser(userId: string) {
  return apiFetch<{ status: string; user_id: string; user_status: string }>(`/admin/users/${userId}/ban`, {
    method: 'POST',
  });
}

export async function unbanUser(userId: string) {
  return apiFetch<{ status: string; user_id: string; user_status: string }>(`/admin/users/${userId}/unban`, {
    method: 'POST',
  });
}

export async function makeAdmin(userId: string) {
  return apiFetch<{ status: string; user_id: string; user_role: string }>(`/admin/users/${userId}/make-admin`, {
    method: 'POST',
  });
}

export async function setUserRole(userId: string, role: 'user' | 'admin') {
  return apiFetch<{ status: string; user_id: string; user_role: string }>(`/admin/users/${userId}/set-role`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function adminHidePost(postId: string) {
  return apiFetch<{ status: string; post_id: string; post_status: string }>(`/admin/posts/${postId}/hide`, {
    method: 'POST',
  });
}

export async function adminRestorePost(postId: string) {
  return apiFetch<{ status: string; post_id: string; post_status: string }>(`/admin/posts/${postId}/restore`, {
    method: 'POST',
  });
}

export async function adminHideReply(replyId: string) {
  return apiFetch<{ status: string; reply_id: string; reply_status: string }>(`/admin/replies/${replyId}/hide`, {
    method: 'POST',
  });
}

export async function adminRestoreReply(replyId: string) {
  return apiFetch<{ status: string; reply_id: string; reply_status: string }>(`/admin/replies/${replyId}/restore`, {
    method: 'POST',
  });
}

export type AuditLogResponse = {
  id: string;
  moderator_id: string;
  moderator_email?: string | null;
  target_type: string;
  target_id: string;
  target_email?: string | null;
  action: string;
  reason?: string | null;
  created_at?: string | null;
};

export async function listAuditLogs(limit = 50, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<AuditLogResponse[]>(`/admin/audit/logs?${query.toString()}`, { method: 'GET' });
}

export type AdminStatsResponse = {
  summary: {
    total_users: number;
    total_posts: number;
    total_replies: number;
    pending_reports: number;
    resolved_reports: number;
    active_today: number;
  };
  user_growth: { label: string; value: number }[];
  content_activity: { label: string; posts: number; replies: number }[];
  category_distribution: { name: string; value: number }[];
};

export async function getAdminStats() {
  return apiFetch<AdminStatsResponse>('/admin/stats', { method: 'GET' });
}

