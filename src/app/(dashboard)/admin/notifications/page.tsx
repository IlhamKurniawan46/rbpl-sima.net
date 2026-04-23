'use client';

import TopBar from '@/components/layout/TopBar';
import NotificationItem from '@/components/ui/NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getNotificationsForUser } from '@/lib/mock-data';
import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const notifications = user ? getNotificationsForUser(user.id) : [];

  return (
    <>
      <TopBar title="Notifikasi" showBack backHref="/admin/more" showNotification={false} />
      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="Tidak Ada Notifikasi" message="Belum ada notifikasi untuk Anda." />
        ) : (
          notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>
    </>
  );
}
