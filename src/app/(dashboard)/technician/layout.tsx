'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/layout/BottomNav';

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (user?.role !== 'technician') router.replace('/');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'technician') return null;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="pb-20">{children}</div>
      <BottomNav role="technician" />
    </div>
  );
}
