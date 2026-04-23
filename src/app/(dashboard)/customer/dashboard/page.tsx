'use client';

import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomerByUserId, getInvoicesForCustomer, getTicketsForCustomer, getInstallationsForCustomer } from '@/lib/mock-data';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatCurrency, formatDateShort } from '@/lib/utils/formatters';
import { Wifi, CreditCard, Ticket, Plus, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const customer = user ? getCustomerByUserId(user.id) : null;
  const invoices = customer ? getInvoicesForCustomer(customer.id) : [];
  const tickets = customer ? getTicketsForCustomer(customer.id) : [];
  const installations = customer ? getInstallationsForCustomer(customer.id) : [];

  const activeService = installations.find((i) => i.status === 'success');
  const latestInvoice = invoices[0];
  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid');

  return (
    <>
      <TopBar title="SIMA.NET" />
      <div className="p-4 space-y-5">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">Halo, {user?.full_name?.split(' ')[0]} 👋</h2>
          <p className="text-xs text-text-muted mt-0.5">Selamat datang kembali</p>
        </div>

        {/* Active Service Card */}
        {activeService && (
          <div className="bg-maroon-600 rounded-2xl p-4 text-white animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Wifi size={18} />
              <span className="text-xs font-medium opacity-80">Layanan Aktif</span>
            </div>
            <p className="text-xl font-bold">{activeService.package?.name}</p>
            <p className="text-sm opacity-80 mt-0.5">{activeService.package?.speed_mbps} Mbps</p>
            <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
              <span className="text-xs opacity-70">Biaya bulanan</span>
              <span className="text-lg font-bold">{formatCurrency(activeService.package?.price_monthly || 0)}</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <StatCard icon={CreditCard} label="Belum Bayar" value={unpaidInvoices.length} color={unpaidInvoices.length > 0 ? 'gold' : 'green'} />
          <StatCard icon={Ticket} label="Tiket Aktif" value={tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length} color="blue" />
        </div>

        {/* Overdue Warning */}
        {invoices.some((i) => i.status === 'overdue') && (
          <div className="p-3.5 bg-gold-50 border border-gold-200 rounded-2xl flex items-start gap-3 animate-fade-in">
            <AlertTriangle size={18} className="text-gold-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gold-700">Tagihan Jatuh Tempo</p>
              <p className="text-xs text-gold-600 mt-0.5">Segera lakukan pembayaran untuk menghindari pemutusan layanan.</p>
            </div>
          </div>
        )}

        {/* Latest Invoice */}
        {latestInvoice && (
          <div>
            <h3 className="text-sm font-bold text-text-heading mb-2">Tagihan Terbaru</h3>
            <button
              onClick={() => router.push(`/customer/invoices/${latestInvoice.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-text-heading">{latestInvoice.description}</p>
                  <p className="text-xs text-text-muted mt-0.5">Jatuh tempo: {formatDateShort(latestInvoice.due_date)}</p>
                </div>
                <StatusBadge label={INVOICE_STATUS_LABELS[latestInvoice.status]} colorClass={INVOICE_STATUS_COLORS[latestInvoice.status]} />
              </div>
              <p className={`text-xl font-bold mt-2 ${latestInvoice.status === 'paid' ? 'text-green-600' : 'text-text-heading'}`}>
                {formatCurrency(latestInvoice.amount)}
              </p>
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-text-heading mb-2">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => router.push('/customer/tickets/new')}
              className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light text-center hover:border-maroon-200 transition-colors active:scale-[0.97]"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Plus size={20} className="text-red-600" />
              </div>
              <p className="text-xs font-semibold text-text-heading">Lapor Gangguan</p>
            </button>
            <button
              onClick={() => router.push('/customer/invoices')}
              className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light text-center hover:border-maroon-200 transition-colors active:scale-[0.97]"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CreditCard size={20} className="text-green-600" />
              </div>
              <p className="text-xs font-semibold text-text-heading">Bayar Tagihan</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
