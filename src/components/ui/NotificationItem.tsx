'use client';

import { useRouter } from 'next/navigation';
import { Bell, CreditCard, Ticket, Wifi, AlertTriangle, Info } from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/types/database';
import { formatRelativeTime } from '@/lib/utils/formatters';

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  payment: CreditCard,
  ticket: Ticket,
  installation: Wifi,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-gold-100 text-gold-600',
  payment: 'bg-green-100 text-green-600',
  ticket: 'bg-maroon-100 text-maroon-600',
  installation: 'bg-purple-100 text-purple-600',
};

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${
        notification.is_read
          ? 'bg-white'
          : 'bg-maroon-50/50 border border-maroon-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[notification.type]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm truncate ${notification.is_read ? 'font-medium text-text-primary' : 'font-semibold text-text-heading'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <div className="w-2 h-2 bg-maroon-500 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-text-muted mt-1">{formatRelativeTime(notification.created_at)}</p>
      </div>
    </button>
  );
}
