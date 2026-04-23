'use client';

import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getCustomerByUserId } from '@/lib/mock-data';
import { getInitials } from '@/lib/utils/formatters';
import { Mail, Phone, MapPin, CreditCard, LogOut } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const customer = user ? getCustomerByUserId(user.id) : null;

  return (
    <>
      <TopBar title="Profil" showNotification={false} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <div className="w-20 h-20 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {getInitials(user?.full_name || '')}
          </div>
          <h2 className="text-lg font-bold text-text-heading">{user?.full_name}</h2>
          <p className="text-xs text-text-muted mt-1">Pelanggan</p>
          <div className="mt-4 space-y-2.5 text-left">
            <div className="flex items-center gap-2 text-sm text-text-muted"><Mail size={15} /> {user?.email}</div>
            <div className="flex items-center gap-2 text-sm text-text-muted"><Phone size={15} /> {user?.phone}</div>
            {customer && (
              <>
                <div className="flex items-start gap-2 text-sm text-text-muted"><MapPin size={15} className="mt-0.5 flex-shrink-0" /> <span className="flex-1">{customer.address}</span></div>
                <div className="flex items-center gap-2 text-sm text-text-muted"><CreditCard size={15} /> NIK: {customer.nik}</div>
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
