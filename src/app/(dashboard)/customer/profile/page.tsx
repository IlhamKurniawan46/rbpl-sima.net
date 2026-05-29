'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getInitials, formatCurrency } from '@/lib/utils/formatters';
import { Mail, Phone, MapPin, Wifi, LogOut, Zap } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';

interface CustomerRecord {
  installation_address: string;
  installation_area: string | null;
  status: string;
  isp: { name: string; speed_limit: string; price: number } | null;
}

export default function CustomerProfilePage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [instStatus, setInstStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      if (!profile) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('customers')
          .select(`id, installation_address, installation_area, status, isp:isps(name, speed_limit, price)`)
          .eq('profile_id', profile.id)
          .maybeSingle();
        setCustomer(data as any);

        if (data) {
          const { data: instData } = await supabase
            .from('installations_and_tickets')
            .select('status')
            .eq('customer_id', data.id)
            .eq('type', 'new_installation')
            .maybeSingle();
          if (instData) {
            setInstStatus(instData.status);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [profile]);

  const STATUS_LABELS: Record<string, string> = {
    active: 'Aktif',
    pending: 'Menunggu Pemasangan',
    inactive: 'Nonaktif',
  };

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-gold-50 text-gold-700 border-gold-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const isAccountActive = 
    customer?.status === 'active' || 
    instStatus === 'success' || 
    instStatus === 'done' || 
    instStatus === 'completed' ||
    (profile as any)?.customers?.status === 'active' || 
    (profile as any)?.status === 'active';

  return (
    <>
      <TopBar title="Profil" showNotification={false} />
      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {getInitials(profile?.full_name || '')}
          </div>
          <h2 className="text-lg font-bold text-text-heading">{profile?.full_name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-text-muted">Pelanggan</span>
            <StatusBadge
              label={isAccountActive ? 'Aktif' : 'Menunggu Pemasangan'}
              colorClass={isAccountActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gold-50 text-gold-700 border-gold-200'}
            />
          </div>

          <div className="mt-4 space-y-2.5 text-left">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Mail size={15} /> {user?.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Phone size={15} /> {profile?.phone || '—'}
            </div>
            {!loading && customer && (
              <>
                <div className="flex items-start gap-2 text-sm text-text-muted">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{customer.installation_address}</span>
                </div>
                {customer.installation_area && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <MapPin size={15} />
                    Area: {customer.installation_area}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        {!loading && customer && (
          <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-heading">Status Layanan</h3>
              <StatusBadge
                label={isAccountActive ? 'Aktif' : 'Menunggu Pemasangan'}
                colorClass={isAccountActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gold-50 text-gold-700 border-gold-200'}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center flex-shrink-0">
                <Wifi size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-heading">{customer.isp?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Zap size={11} className="text-gold-500" />
                  <span className="text-xs text-text-muted">{customer.isp?.speed_limit}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted font-semibold">
                    {formatCurrency(customer.isp?.price || 0)}/bln
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <ActionButton
          fullWidth
          variant="danger"
          icon={<LogOut size={16} />}
          onClick={() => {
            logout();
            router.replace('/');
          }}
        >
          Keluar
        </ActionButton>
      </div>
    </>
  );
}
