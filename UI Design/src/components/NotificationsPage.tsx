import { useState } from 'react';
import { Bell, MessageCircle, ThumbsUp, Shield, CheckCircle2, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card3D } from './Card3D';
import { Notification } from './NotificationDropdown';

interface NotificationsPageProps {
  onNotificationClick?: (notification: Notification) => void;
}

// Mock notifications data (same as dropdown but more)
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reply',
    title: 'New reply on your post',
    message: 'Maria Garcia replied to "F-1 Visa Application Process Guide"',
    timestamp: '5 minutes ago',
    read: false,
    author: {
      name: 'Maria Garcia',
    },
  },
  {
    id: '2',
    type: 'helpful',
    title: 'Your post was marked helpful',
    message: '15 people found your post about "Finding Housing Near Campus" helpful',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'reply',
    title: 'New reply on your post',
    message: 'Ahmed Hassan replied to "Health Insurance Options"',
    timestamp: '3 hours ago',
    read: true,
    author: {
      name: 'Ahmed Hassan',
    },
  },
  {
    id: '4',
    type: 'verified',
    title: 'Congratulations!',
    message: 'Your account has been verified as an international student',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'helpful',
    title: 'Your reply was marked helpful',
    message: '8 people found your reply helpful',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Welcome to BridgeUS!',
    message: 'Start exploring posts and connect with other international students',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: '7',
    type: 'reply',
    title: 'New reply on your post',
    message: 'Li Wei replied to "Part-time Job Opportunities"',
    timestamp: '4 days ago',
    read: true,
    author: {
      name: 'Li Wei',
    },
  },
  {
    id: '8',
    type: 'helpful',
    title: 'Your post was marked helpful',
    message: '25 people found your post about "Driver\'s License Guide" helpful',
    timestamp: '5 days ago',
    read: true,
  },
];

export function NotificationsPage({ onNotificationClick }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    onNotificationClick?.(notification);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-[var(--bridge-blue)]" />;
      case 'helpful':
        return <ThumbsUp className="h-5 w-5 text-[var(--bridge-green)]" />;
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-[var(--trust-verified)]" />;
      case 'system':
        return <Shield className="h-5 w-5 text-[var(--trust-gold)]" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="rounded-xl"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            filter === 'all'
              ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            filter === 'unread'
              ? 'border-[var(--bridge-blue)] text-[var(--bridge-blue)]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border bg-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {filter === 'unread' 
                ? 'You\'re all caught up! Check back later for new updates.'
                : 'When you receive notifications, they\'ll appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card3D
              key={notification.id}
              className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
                !notification.read ? 'ring-2 ring-[var(--bridge-blue)]/20' : ''
              }`}
              maxRotation={6}
              scale={1.02}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--bridge-blue)]" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="rounded-lg h-8 text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNotificationClick(notification)}
                      className="rounded-lg h-8 text-xs text-[var(--bridge-blue)] hover:bg-[var(--bridge-blue-light)]"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-red-600 ml-auto"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card3D>
          ))
        )}
      </div>
    </div>
  );
}