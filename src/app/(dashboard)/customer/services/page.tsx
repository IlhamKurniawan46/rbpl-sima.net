'use client';

import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomerByUserId, getInstallationsForCustomer } from '@/lib/mock-data';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { Wifi, Zap, MapPin, Calendar } from 'lucide-react';

export default function CustomerServicesPage() {
  const { user } = useAuth();
  const customer = user ? getCustomerByUserId(user.id) : null;
  const installations = customer ? getInstallationsForCustomer(customer.id) : [];

  return (
    <>
      <TopBar title="Layanan Saya" />
      <div className="p-4">
        {installations.length === 0 ? (
          <EmptyState icon={Wifi} title="Belum Ada Layanan" message="Anda belum memiliki layanan yang terdaftar." />
        ) : (
          <div className="space-y-3 stagger-children">
            {installations.map((ins) => (
              <div key={ins.id} className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center">
                      <Wifi size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-heading">{ins.package?.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Zap size={12} className="text-gold-500" />
                        <span className="text-xs text-text-muted">{ins.package?.speed_mbps} Mbps</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge label={INSTALLATION_STATUS_LABELS[ins.status]} colorClass={INSTALLATION_STATUS_COLORS[ins.status]} />
                </div>
                <div className="space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2"><MapPin size={13} /> {ins.address}</div>
                  <div className="flex items-center gap-2"><Calendar size={13} /> {formatDate(ins.created_at)}</div>
                </div>
                {ins.status === 'success' && (
                  <div className="mt-3 pt-3 border-t border-border-light flex justify-between items-center">
                    <span className="text-xs text-text-muted">Biaya bulanan</span>
                    <span className="text-base font-bold text-maroon-600">{formatCurrency(ins.package?.price_monthly || 0)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
