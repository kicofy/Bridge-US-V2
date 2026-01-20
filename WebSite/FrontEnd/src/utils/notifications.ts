import type { TFunction } from 'i18next';
import type { NotificationResponse } from '../api/notifications';
import type { Notification } from '../components/NotificationDropdown';

const resolveType = (type: string): Notification['type'] => {
  if (type.includes('reply')) return 'reply';
  if (type.includes('helpful') || type.includes('rated')) return 'helpful';
  if (type.includes('verify') || type.includes('verification')) return 'verified';
  return 'system';
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
};

const buildMessage = (payload: Record<string, unknown> | null, t: TFunction) => {
  if (!payload) return t('notifications.genericMessage');
  if (typeof payload.reason === 'string' && payload.reason) return payload.reason;
  if (typeof payload.message === 'string' && payload.message) return payload.message;
  const parts: string[] = [];
  const postTitle = typeof payload.post_title === 'string' ? payload.post_title : null;
  const replyExcerpt =
    typeof payload.reply_excerpt === 'string' ? payload.reply_excerpt : null;
  const fromUser =
    typeof payload.from_user_name === 'string' ? payload.from_user_name : null;
  const rating =
    typeof payload.rating === 'number' || typeof payload.rating === 'string'
      ? String(payload.rating)
      : null;
  const status = typeof payload.status === 'string' ? payload.status : null;
  const method = typeof payload.method === 'string' ? payload.method : null;
  if (postTitle) parts.push(t('notifications.postTitle', { title: postTitle }));
  if (replyExcerpt) {
    parts.push(t('notifications.replyExcerpt', { excerpt: replyExcerpt }));
  }
  if (fromUser) parts.push(t('notifications.fromUser', { name: fromUser }));
  if (rating) parts.push(t('notifications.rating', { rating }));
  if (status) parts.push(t('notifications.statusUpdate', { status }));
  if (method) parts.push(t('notifications.method', { method }));
  if (parts.length) return parts.join(' • ');
  const postId = typeof payload.post_id === 'string' ? payload.post_id : null;
  const replyId = typeof payload.reply_id === 'string' ? payload.reply_id : null;
  const reportId = typeof payload.report_id === 'string' ? payload.report_id : null;
  const appealId = typeof payload.appeal_id === 'string' ? payload.appeal_id : null;
  if (postId) return t('notifications.relatedPost', { id: postId.slice(0, 6) });
  if (replyId) return t('notifications.relatedReply', { id: replyId.slice(0, 6) });
  if (reportId) return t('notifications.relatedReport', { id: reportId.slice(0, 6) });
  if (appealId) return t('notifications.relatedAppeal', { id: appealId.slice(0, 6) });
  return t('notifications.genericMessage');
};

const buildLink = (payload: Record<string, unknown> | null): string | undefined => {
  if (!payload) return undefined;
  const postId = typeof payload.post_id === 'string' ? payload.post_id : null;
  if (postId) return `/posts/${postId}`;
  const reportId = typeof payload.report_id === 'string' ? payload.report_id : null;
  const appealId = typeof payload.appeal_id === 'string' ? payload.appeal_id : null;
  const requestId = typeof payload.request_id === 'string' ? payload.request_id : null;
  if (reportId || appealId || requestId) return '/profile';
  return undefined;
};

export const mapNotification = (item: NotificationResponse, t: TFunction): Notification => {
  const type = resolveType(item.type);
  return {
    id: item.id,
    type,
    title: t(`notifications.labels.${type}`),
    message: buildMessage(item.payload ?? null, t),
    link: buildLink(item.payload ?? null),
    timestamp: formatTimestamp(item.created_at),
    read: Boolean(item.read_at),
  };
};

