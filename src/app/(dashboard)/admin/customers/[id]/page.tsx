'use client';

import { use } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockCustomers, getInvoicesForCustomer, getTicketsForCustomer, getInstallationsForCustomer } from '@/lib/mock-data';
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS, INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils/formatters';
import { MapPin, Phone, CreditCard, Mail, Wifi } from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) return <div className="p-6 text-center text-text-muted">Pelanggan tidak ditemukan</div>;

  const invoices = getInvoicesForCustomer(customer.id);
  const tickets = getTicketsForCustomer(customer.id);
  const installations = getInstallationsForCustomer(customer.id);

  return (
    <>
      <TopBar title="Detail Pelanggan" showBack backHref="/admin/customers" />
      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <div className="w-16 h-16 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
            {getInitials(customer.user?.full_name || '')}
          </div>
          <h2 className="text-lg font-bold text-text-heading">{customer.user?.full_name}</h2>
          <StatusBadge label={CUSTOMER_STATUS_LABELS[customer.status]} colorClass={CUSTOMER_STATUS_COLORS[customer.status]} size="md" />
          <div className="mt-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-text-muted"><Mail size={14} /> {customer.user?.email}</div>
            <div className="flex items-center gap-2 text-sm text-text-muted"><Phone size={14} /> {customer.user?.phone}</div>
            <div className="flex items-center gap-2 text-sm text-text-muted"><MapPin size={14} /> {customer.address}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-light grid grid-cols-2 gap-2 text-center">
            <div><p className="text-lg font-bold text-text-heading">{invoices.length}</p><p className="text-[10px] text-text-muted">Tagihan</p></div>
            <div><p className="text-lg font-bold text-text-heading">{tickets.length}</p><p className="text-[10px] text-text-muted">Tiket</p></div>
          </div>
        </div>

        {/* Installations */}
        <div>
          <h3 className="text-sm font-bold text-text-heading mb-2">Riwayat Pemasangan</h3>
          <div className="space-y-2">
            {installations.map((ins) => (
              <div key={ins.id} className="bg-white rounded-xl p-3 border border-border-light flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Wifi size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-heading truncate">{ins.package?.name}</p>
                  <p className="text-xs text-text-muted">{formatDate(ins.created_at)}</p>
                </div>
                <StatusBadge label={INSTALLATION_STATUS_LABELS[ins.status]} colorClass={INSTALLATION_STATUS_COLORS[ins.status]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
