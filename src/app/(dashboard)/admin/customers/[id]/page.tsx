'use client';

import { use, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS, TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils/formatters';
import { MapPin, Phone, CreditCard, Mail, Wifi, Ticket } from 'lucide-react';
import type { CustomerStatus, TicketStatus } from '@/lib/types/database';

interface CustomerDetail {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  created_at: string;
  profile: { full_name: string; phone: string | null } | null;
  isp: { name: string; speed_limit: string; price: number } | null;
}

interface TicketRow {
  id: string;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface InstallRow {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [instHistory, setInstHistory] = useState<InstallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const { data: custData, error: custErr } = await supabase
          .from('customers')
          .select(`
            id, status, installation_address, installation_area, created_at,
            profile:profiles!customers_profile_id_fkey(full_name, phone),
            isp:isps(name, speed_limit, price)
          `)
          .eq('id', id)
          .maybeSingle();

        if (custErr) throw custErr;
        if (!custData) { setNotFound(true); return; }
        setCustomer(custData as any);

        const [ticketsRes, instRes] = await Promise.all([
          supabase
            .from('installations_and_tickets')
            .select('id, type, status, description, created_at')
            .eq('customer_id', id)
            .eq('type', 'complaint')
            .order('created_at', { ascending: false }),
          supabase
            .from('installations_and_tickets')
            .select('id, type, status, created_at')
            .eq('customer_id', id)
            .eq('type', 'new_installation')
            .order('created_at', { ascending: false }),
        ]);

        setTickets((ticketsRes.data as any[]) || []);
        setInstHistory((instRes.data as any[]) || []);
      } catch (err: any) {
        console.error('Error fetching customer detail:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar title="Detail Pelanggan" showBack backHref="/admin/customers" />
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !customer) {
    return (
      <>
        <TopBar title="Detail Pelanggan" showBack backHref="/admin/customers" />
        <div className="p-6 text-center text-text-muted">Pelanggan tidak ditemukan</div>
      </>
    );
  }

  const statusKey = customer.status as CustomerStatus;

  return (
    <>
      <TopBar title="Detail Pelanggan" showBack backHref="/admin/customers" />
      <div className="p-4 space-y-4 pb-10">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <div className="w-16 h-16 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
            {getInitials(customer.profile?.full_name || '')}
          </div>
          <h2 className="text-lg font-bold text-text-heading">{customer.profile?.full_name || '—'}</h2>
          <div className="mt-1">
            <StatusBadge
              label={CUSTOMER_STATUS_LABELS[statusKey] || customer.status}
              colorClass={CUSTOMER_STATUS_COLORS[statusKey] || ''}
              size="md"
            />
          </div>
          <div className="mt-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-text-muted"><Phone size={14} /> {customer.profile?.phone || '—'}</div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MapPin size={14} />
              <span>{customer.installation_area ? `${customer.installation_area} · ` : ''}{customer.installation_address}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-light grid grid-cols-2 gap-2 text-center">
            <div><p className="text-lg font-bold text-text-heading">{tickets.length}</p><p className="text-[10px] text-text-muted">Tiket</p></div>
            <div><p className="text-lg font-bold text-text-heading">{instHistory.length}</p><p className="text-[10px] text-text-muted">Pemasangan</p></div>
          </div>
        </div>

        {/* Subscription Info */}
        {customer.isp && (
          <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-2">
            <h3 className="text-sm font-bold text-text-heading mb-2">Paket Berlangganan</h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center flex-shrink-0">
                <Wifi size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-heading">{customer.isp.name}</p>
                <p className="text-xs text-text-muted">{customer.isp.speed_limit} · {formatCurrency(customer.isp.price)}/bln</p>
              </div>
            </div>
          </div>
        )}

        {/* Installation History */}
        {instHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-heading mb-2">Riwayat Pemasangan</h3>
            <div className="space-y-2">
              {instHistory.map((ins) => {
                const instStatusKey = ins.status as TicketStatus;
                return (
                  <div key={ins.id} className="bg-white rounded-xl p-3 border border-border-light flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Wifi size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-heading">Pemasangan Baru</p>
                      <p className="text-xs text-text-muted">{formatDate(ins.created_at)}</p>
                    </div>
                    <StatusBadge
                      label={TICKET_STATUS_LABELS[instStatusKey] || ins.status}
                      colorClass={TICKET_STATUS_COLORS[instStatusKey] || ''}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Complaint Tickets */}
        {tickets.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-heading mb-2">Tiket Keluhan</h3>
            <div className="space-y-2">
              {tickets.map((t) => {
                const ticketStatusKey = t.status as TicketStatus;
                return (
                  <div key={t.id} className="bg-white rounded-xl p-3 border border-border-light flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center flex-shrink-0">
                      <Ticket size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-heading truncate">{t.description || 'Komplain'}</p>
                      <p className="text-xs text-text-muted">{formatDate(t.created_at)}</p>
                    </div>
                    <StatusBadge
                      label={TICKET_STATUS_LABELS[ticketStatusKey] || t.status}
                      colorClass={TICKET_STATUS_COLORS[ticketStatusKey] || ''}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
