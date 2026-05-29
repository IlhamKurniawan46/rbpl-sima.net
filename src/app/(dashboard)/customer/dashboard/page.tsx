'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionButton from '@/components/ui/ActionButton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wifi, CreditCard, Ticket, Plus, AlertTriangle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomerRecord {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  isp: { name: string; speed_limit: string; price: number } | null;
}

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [activeTickets, setActiveTickets] = useState(0);
  const [instTaskStatus, setInstTaskStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      if (!profile) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            status,
            installation_address,
            installation_area,
            isp:isps(name, speed_limit, price)
          `)
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (error) throw error;
        setCustomer(data as any);

        if (data) {
          // Count active tickets (status: submitted or in_progress) of type complaint
          const { count, error: ticketErr } = await supabase
            .from('installations_and_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', data.id)
            .eq('type', 'complaint')
            .in('status', ['submitted', 'in_progress']);

          if (!ticketErr && count !== null) {
            setActiveTickets(count);
          }

          // Fetch the latest installation task status
          const { data: instData, error: instErr } = await supabase
            .from('installations_and_tickets')
            .select('status')
            .eq('customer_id', data.id)
            .eq('type', 'new_installation')
            .maybeSingle();

          if (!instErr && instData) {
            setInstTaskStatus(instData.status);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch customer record:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [profile]);

  return (
    <>
      <TopBar title="SIMA.NET" />
      <div className="p-4 space-y-5">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">
            Halo, {profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Selamat datang kembali</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted gap-2">
            <div className="w-7 h-7 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat data layanan...</p>
          </div>
        ) : customer ? (
          <>
            {/* Active/Pending Service Card */}
            <div
              className={`rounded-2xl p-4 text-white animate-fade-in ${
                customer.status === 'active' || instTaskStatus === 'success' || instTaskStatus === 'done' || instTaskStatus === 'completed'
                  ? 'bg-maroon-600'
                  : instTaskStatus === 'in_progress'
                  ? 'bg-blue-600'
                  : 'bg-gold-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={18} />
                <span className="text-xs font-medium opacity-80">
                  {customer.status === 'active' || instTaskStatus === 'success' || instTaskStatus === 'done' || instTaskStatus === 'completed'
                    ? 'Layanan Aktif'
                    : instTaskStatus === 'in_progress'
                    ? 'Proses Pemasangan'
                    : 'Menunggu Pemasangan'}
                </span>
              </div>
              <p className="text-xl font-bold">{customer.isp?.name}</p>
              <div className="flex items-center gap-1 mt-0.5 opacity-80">
                <Zap size={14} />
                <span className="text-sm">{customer.isp?.speed_limit}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
                <span className="text-xs opacity-70">Biaya bulanan</span>
                <span className="text-lg font-bold">
                  {formatCurrency(customer.isp?.price || 0)}
                </span>
              </div>
            </div>

            {/* Status info for pending/in_progress */}
            {(customer.status === 'pending' && !(instTaskStatus === 'success' || instTaskStatus === 'done' || instTaskStatus === 'completed')) && (
              <div className="p-3.5 bg-gold-50 border border-gold-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                <AlertTriangle size={18} className="text-gold-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gold-700">
                    {instTaskStatus === 'in_progress' ? 'Proses Pemasangan Sedang Berjalan' : 'Menunggu Jadwal Pemasangan'}
                  </p>
                  <p className="text-xs text-gold-600 mt-0.5">
                    {instTaskStatus === 'in_progress'
                      ? 'Teknisi sedang memproses pemasangan jaringan internet Anda.'
                      : 'Pembayaran Anda telah diterima. Teknisi kami akan segera menghubungi Anda.'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats (placeholder — invoices/tickets still from mock) */}
            <div className="grid grid-cols-2 gap-3 stagger-children">
              <StatCard
                icon={CreditCard}
                label="Status Pemasangan"
                value={
                  customer.status === 'active' || instTaskStatus === 'success' || instTaskStatus === 'done' || instTaskStatus === 'completed'
                    ? 'Selesai'
                    : instTaskStatus === 'in_progress'
                    ? 'Proses'
                    : 'Pending'
                }
                color={
                  customer.status === 'active' || instTaskStatus === 'success' || instTaskStatus === 'done' || instTaskStatus === 'completed'
                    ? 'green'
                    : instTaskStatus === 'in_progress'
                    ? 'blue'
                    : 'gold'
                }
              />
              <StatCard icon={Ticket} label="Tiket Aktif" value={activeTickets} color="blue" />
            </div>
          </>
        ) : (
          /* No subscription yet */
          <div className="bg-white rounded-2xl p-6 border border-border-light text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-maroon-50 rounded-2xl flex items-center justify-center mx-auto">
              <Wifi size={28} className="text-maroon-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-heading">Belum Berlangganan</h3>
              <p className="text-xs text-text-muted mt-1">
                Anda belum memiliki layanan internet aktif. Daftarkan paket sekarang!
              </p>
            </div>
            <div className="max-w-[200px] mx-auto">
              <ActionButton fullWidth icon={<Plus size={16} />} onClick={() => router.push('/customer/services')}>
                Daftar Layanan
              </ActionButton>
            </div>
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
              onClick={() => router.push('/customer/services')}
              className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light text-center hover:border-maroon-200 transition-colors active:scale-[0.97]"
            >
              <div className="w-10 h-10 bg-maroon-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Wifi size={20} className="text-maroon-600" />
              </div>
              <p className="text-xs font-semibold text-text-heading">Layanan Saya</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
