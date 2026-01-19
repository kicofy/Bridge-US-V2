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

export const mapNotification = (item: NotificationResponse, t: TFunction): Notification => {
  const type = resolveType(item.type);
  return {
    id: item.id,
    type,
    title: t(`notifications.labels.${type}`),
    message: buildMessage(item.payload ?? null, t),
    timestamp: formatTimestamp(item.created_at),
    read: Boolean(item.read_at),
  };
};

