'use client';

import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { mockCustomers, mockInstallations, mockTickets, mockInvoices } from '@/lib/mock-data';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS, TICKET_PRIORITY_LABELS } from '@/lib/utils/constants';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { Users, Wrench, Ticket, CreditCard, AlertTriangle } from 'lucide-react';
import { getInitials } from '@/lib/utils/formatters';

export default function AdminDashboard() {
  const { user } = useAuth();
  const totalCustomers = mockCustomers.length;
  const pendingInstalls = mockInstallations.filter((i) => i.status === 'pending' || i.status === 'in_progress').length;
  const openTickets = mockTickets.filter((t) => t.status === 'submitted' || t.status === 'processing').length;
  const totalRevenue = mockInvoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  const recentTickets = mockTickets.slice(0, 4);

  return (
    <>
      <TopBar title="Dashboard Admin" showNotification />
      <div className="p-4 space-y-5">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">Halo, {user?.full_name?.split(' ')[0]} 👋</h2>
          <p className="text-xs text-text-muted mt-0.5">Ringkasan sistem hari ini</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <StatCard icon={Users} label="Pelanggan" value={totalCustomers} color="maroon" />
          <StatCard icon={Wrench} label="Pemasangan" value={pendingInstalls} trend="Menunggu" color="gold" />
          <StatCard icon={Ticket} label="Tiket Aktif" value={openTickets} color="blue" />
          <StatCard icon={CreditCard} label="Pendapatan" value={formatCurrency(totalRevenue)} color="green" />
        </div>

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-heading">Tiket Terbaru</h3>
            <button onClick={() => {}} className="text-xs text-maroon-600 font-semibold">Lihat Semua</button>
          </div>
          <div className="space-y-2.5 stagger-children">
            {recentTickets.map((ticket) => (
              <ListCard
                key={ticket.id}
                href={`/admin/tickets`}
                avatar={
                  <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                    {ticket.customer ? getInitials(ticket.customer.user?.full_name || '') : '?'}
                  </div>
                }
                title={ticket.subject}
                subtitle={`${ticket.customer?.user?.full_name} · ${formatRelativeTime(ticket.created_at)}`}
                trailing={
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge label={TICKET_STATUS_LABELS[ticket.status]} colorClass={TICKET_STATUS_COLORS[ticket.status]} />
                    <StatusBadge label={TICKET_PRIORITY_LABELS[ticket.priority]} colorClass={TICKET_PRIORITY_COLORS[ticket.priority]} />
                  </div>
                }
                showChevron={false}
              />
            ))}
          </div>
        </div>

        {/* Overdue Alert */}
        {mockInvoices.some((i) => i.status === 'overdue') && (
          <div className="p-3.5 bg-gold-50 border border-gold-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-gold-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gold-700">Tagihan Jatuh Tempo</p>
              <p className="text-xs text-gold-600 mt-0.5">
                {mockInvoices.filter((i) => i.status === 'overdue').length} tagihan melewati batas pembayaran
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
