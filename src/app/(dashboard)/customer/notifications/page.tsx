'use client';

import TopBar from '@/components/layout/TopBar';
import EmptyState from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function CustomerNotificationsPage() {
  return (
    <>
      <TopBar title="Notifikasi" showNotification={false} />
      <div className="p-4 space-y-2">
        <EmptyState icon={Bell} title="Tidak Ada Notifikasi" message="Belum ada notifikasi untuk Anda." />
      </div>
    </>
  );
}
