'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/layout/BottomNav';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (profile && profile.role !== 'customer') {
      router.replace('/');
    }
  }, [isAuthenticated, profile, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-surface-alt flex items-center justify-center text-text-muted">Memuat...</div>;
  }

  if (!isAuthenticated || profile?.role !== 'customer') return null;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="pb-20">{children}</div>
      <BottomNav role="customer" />
    </div>
  );
}
