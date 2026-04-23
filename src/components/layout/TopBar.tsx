'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/lib/mock-data';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function TopBar({
  title,
  showBack = false,
  showNotification = true,
  backHref,
  rightAction,
}: TopBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const notifPath = user
    ? `/${user.role === 'admin' ? 'admin' : user.role === 'technician' ? 'technician' : 'customer'}/notifications`
    : '/';

  return (
    <header className="sticky top-0 z-40 bg-maroon-600 safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or spacer */}
        <div className="w-10 flex items-center justify-start">
          {showBack && (
            <button
              onClick={() => (backHref ? router.push(backHref) : router.back())}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={22} />
            </button>
          )}
        </div>

        {/* Center: Title */}
        <h1 className="text-white font-semibold text-lg tracking-tight truncate flex-1 text-center">
          {title}
        </h1>

        {/* Right: Notification or custom action */}
        <div className="w-10 flex items-center justify-end">
          {rightAction ? (
            rightAction
          ) : showNotification ? (
            <button
              onClick={() => router.push(notifPath)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1 min-w-[18px] h-[18px] bg-gold-400 text-maroon-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
    </header>
  );
}
