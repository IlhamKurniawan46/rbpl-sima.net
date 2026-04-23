'use client';

import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getTechnicianByUserId } from '@/lib/mock-data';
import { getInitials } from '@/lib/utils/formatters';
import { Mail, Phone, MapPin, Wrench, LogOut } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';

export default function TechProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const tech = user ? getTechnicianByUserId(user.id) : null;

  return (
    <>
      <TopBar title="Profil" showNotification={false} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <div className="w-20 h-20 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {getInitials(user?.full_name || '')}
          </div>
          <h2 className="text-lg font-bold text-text-heading">{user?.full_name}</h2>
          <p className="text-xs text-text-muted mt-1">Teknisi</p>
          <div className="mt-4 space-y-2.5 text-left">
            <div className="flex items-center gap-2 text-sm text-text-muted"><Mail size={15} /> {user?.email}</div>
            <div className="flex items-center gap-2 text-sm text-text-muted"><Phone size={15} /> {user?.phone}</div>
            {tech && (
              <>
                <div className="flex items-center gap-2 text-sm text-text-muted"><Wrench size={15} /> {tech.specialization}</div>
                <div className="flex items-center gap-2 text-sm text-text-muted"><MapPin size={15} /> Area: {tech.assigned_area}</div>
              </>
            )}
          </div>
        </div>
        <ActionButton fullWidth variant="danger" icon={<LogOut size={16} />} onClick={() => { logout(); router.replace('/'); }}>
          Keluar
        </ActionButton>
      </div>
    </>
  );
}
