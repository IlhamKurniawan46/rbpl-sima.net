'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { Users, Wrench, Ticket, CreditCard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DashStats {
  totalCustomers: number;
  pendingInstalls: number;
  openTickets: number;
}

interface RecentTicket {
  id: string;
  type: string;
  title?: string | null;
  description: string | null;
  status: string;
  created_at: string;
  customer: { profile: { full_name: string } | null } | null;
}

const TICKET_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  submitted: 'bg-gold-50 text-gold-700 border-gold-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  done: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  submitted: 'Diajukan',
  in_progress: 'Diproses',
  success: 'Selesai',
  completed: 'Selesai',
  done: 'Selesai',
  failed: 'Gagal',
};

const TICKET_TYPE_LABELS: Record<string, string> = {
  new_installation: 'Pemasangan Baru',
  complaint: 'Komplain',
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashStats>({ totalCustomers: 0, pendingInstalls: 0, openTickets: 0 });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const supabase = createClient();

        const [customersRes, ticketsRes, installsRes] = await Promise.all([
          supabase.from('customers').select('id, status', { count: 'exact' }),
          supabase
            .from('installations_and_tickets')
            .select(`*, customer:customers(profile:profiles!profile_id(full_name))`)
            .eq('type', 'complaint')
            .order('created_at', { ascending: false }),
          supabase
            .from('installations_and_tickets')
            .select('id')
            .eq('type', 'new_installation')
            .in('status', ['submitted', 'in_progress']),
        ]);

        const allCustomers = customersRes.data || [];
        const pendingInstalls = installsRes.data?.length || 0;

        setStats({
          totalCustomers: allCustomers.filter((c: any) => c.status === 'active').length,
          pendingInstalls,
          openTickets: ticketsRes.data?.length || 0,
        });

        setRecentTickets((ticketsRes.data as any[]) || []);
      } catch (err: any) {
        console.error('Admin dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <>
      <TopBar title="Dashboard Admin" showNotification />
      <div className="p-4 space-y-5">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">
            Halo, {profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Ringkasan sistem hari ini</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <StatCard icon={Users} label="Pelanggan Aktif" value={loading ? '—' : stats.totalCustomers} color="maroon" />
          <StatCard icon={Wrench} label="Pemasangan" value={loading ? '—' : stats.pendingInstalls} trend="Menunggu" color="gold" />
          <StatCard icon={Ticket} label="Tiket Aktif" value={loading ? '—' : stats.openTickets} color="blue" />
          <StatCard icon={CreditCard} label="Tagihan" value="—" color="green" />
        </div>

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-heading">Tiket Terbaru</h3>
            <Link href="/admin/tickets" className="text-xs text-maroon-600 font-semibold">
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-border-light text-center">
              <p className="text-xs text-text-muted">Belum ada tiket aktif</p>
            </div>
          ) : (
            <div className="space-y-2.5 stagger-children">
              {recentTickets.map((ticket) => (
                <ListCard
                  key={ticket.id}
                  href="/admin/tickets"
                  avatar={
                    <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                      {getInitials(ticket.customer?.profile?.full_name || '')}
                    </div>
                  }
                  title={ticket.title || ticket.description || 'Komplain'}
                  subtitle={`${ticket.customer?.profile?.full_name || 'Pelanggan Baru'} · ${new Date(ticket.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}`}
                  trailing={
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={ticket.status === 'pending' ? 'Menunggu' : (ticket.status === 'completed' || ticket.status === 'success') ? 'Selesai' : (TICKET_STATUS_LABELS[ticket.status] || ticket.status)}
                        colorClass={ticket.status === 'pending' ? 'bg-gold-50 text-gold-700 border-gold-200' : (ticket.status === 'completed' || ticket.status === 'success') ? 'bg-green-50 text-green-700 border-green-200' : (TICKET_STATUS_COLORS[ticket.status] || '')}
                      />
                    </div>
                  }
                  showChevron={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pending install alert */}
        {!loading && stats.pendingInstalls > 0 && (
          <div className="p-3.5 bg-gold-50 border border-gold-200 rounded-2xl flex items-start gap-3 animate-fade-in">
            <AlertTriangle size={18} className="text-gold-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gold-700">Pemasangan Menunggu</p>
              <p className="text-xs text-gold-600 mt-0.5">
                {stats.pendingInstalls} pelanggan baru menunggu jadwal pemasangan
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
