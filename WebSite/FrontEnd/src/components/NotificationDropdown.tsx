import { useState, useRef, useEffect } from 'react';
import { Bell, MessageCircle, ThumbsUp, Shield, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { use3DHover } from '../hooks/use3DHover';
import { useTranslation } from 'react-i18next';
import { listNotifications, markAllNotificationsRead, markNotificationsRead } from '../api/notifications';
import { mapNotification } from '../utils/notifications';

export interface Notification {
  id: string;
  type: 'reply' | 'helpful' | 'verified' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface NotificationDropdownProps {
  onNotificationClick?: (notification: Notification) => void;
  onViewAll?: () => void;
}

export function NotificationDropdown({ onNotificationClick, onViewAll }: NotificationDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellBtn3D = use3DHover({ maxRotation: 8, scale: 1.08 });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    listNotifications(6, 0)
      .then((items) => setNotifications(items.map((item) => mapNotification(item, t))))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isOpen, t]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    await markNotificationsRead([id]);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    await markAllNotificationsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAll?.();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-[var(--bridge-blue)]" />;
      case 'helpful':
        return <ThumbsUp className="h-4 w-4 text-[var(--bridge-green)]" />;
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-[var(--trust-verified)]" />;
      case 'system':
        return <Shield className="h-4 w-4 text-[var(--trust-gold)]" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <div
        ref={bellBtn3D.ref}
        style={bellBtn3D.style}
        onMouseMove={bellBtn3D.onMouseMove}
        onMouseEnter={bellBtn3D.onMouseEnter}
        onMouseLeave={bellBtn3D.onMouseLeave}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-xl h-9 w-9 p-0"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-96 rounded-2xl border bg-white shadow-2xl z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="font-semibold text-base">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('notifications.unreadCount', { count: unreadCount })}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs rounded-lg h-auto py-1.5 px-3 text-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)]"
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t('status.loading')}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t('notifications.noNotifications')}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors relative cursor-pointer ${
                      !notification.read ? 'bg-[var(--bridge-blue-light)]/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--bridge-blue)] mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* Mark as read button for unread notifications */}
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="shrink-0 p-1 hover:bg-background rounded-lg transition-colors"
                          title={t('notifications.markRead')}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-xl text-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)]"
                onClick={handleViewAll}
              >
                {t('notifications.viewAll')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}