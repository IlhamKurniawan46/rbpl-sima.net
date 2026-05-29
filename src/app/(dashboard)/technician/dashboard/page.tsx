'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Wifi, Clock, CheckCircle, Wrench } from 'lucide-react';
import Link from 'next/link';

interface DashboardTask {
  id: string;
  type: string;
  status: string;
  scheduled_date: string | null;
  customer: {
    id: string;
    installation_address: string;
    installation_area: string | null;
    profile: {
      full_name: string;
      phone: string | null;
    } | null;
    isp: {
      name: string;
      speed_limit: string;
    } | null;
  } | null;
}

export default function TechDashboard() {
  const { profile } = useAuth();
  const [pending, setPending] = useState<DashboardTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return;
      try {
        const supabase = createClient();

        const [tasksRes, ticketsRes] = await Promise.all([
          supabase
            .from('installations_and_tickets')
            .select(`
              id,
              type,
              status,
              scheduled_date,
              customer_id,
              customer:customers (
                id,
                installation_address,
                installation_area,
                profile:profiles!profile_id (
                  full_name,
                  phone
                ),
                isp:isps (
                  name,
                  speed_limit
                )
              )
            `)
            .eq('technician_id', profile.id)
            .eq('type', 'new_installation'),
          supabase
            .from('installations_and_tickets')
            .select('id, status')
            .eq('type', 'complaint')
            .or(`technician_id.eq.${profile.id},technician_id.is.null`)
        ]);

        if (tasksRes.error) throw tasksRes.error;
        if (ticketsRes.error) throw ticketsRes.error;

        const allTasks = (tasksRes.data as any[]) || [];
        setPending(allTasks.filter((t) => t.status === 'in_progress' || t.status === 'pending'));
        setCompletedCount(allTasks.filter((t) => t.status === 'completed' || t.status === 'success' || t.status === 'done').length);

        const allTickets = (ticketsRes.data as any[]) || [];
        const activeTickets = allTickets.filter(
          (t) => t.status === 'submitted' || t.status === 'in_progress'
        );
        setTicketCount(activeTickets.length);
      } catch (err: any) {
        console.error('Tech dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile]);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4 space-y-5">
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">
            Halo, {profile?.full_name?.split(' ')[0]} 🔧
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Tugas pemasangan hari ini</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 stagger-children">
          <StatCard icon={Clock} label="Pending" value={loading ? '—' : pending.length} color="gold" />
          <StatCard icon={CheckCircle} label="Selesai" value={loading ? '—' : completedCount} color="green" />
          <StatCard icon={Wrench} label="Tiket" value={loading ? '—' : ticketCount} color="blue" />
        </div>

        {/* Active Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-heading">Antrean Pemasangan</h3>
            <Link href="/technician/tasks" className="text-xs text-maroon-600 font-semibold">
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-border-light text-center">
              <p className="text-xs text-text-muted">Tidak ada antrean pemasangan</p>
            </div>
          ) : (
            <div className="space-y-2.5 stagger-children">
              {pending && pending.slice(0, 4).map((task) => {
                const customerName = 
                  task.customer?.profile?.full_name ||
                  (task.customer as any)?.profiles?.full_name ||
                  (task.customer as any)?.full_name ||
                  task.customer?.profile?.phone ||
                  'Pelanggan';
                return (
                  <ListCard
                    key={task.id}
                    href={`/technician/tasks?id=${task.id}`}
                    avatar={
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wifi size={18} />
                      </div>
                    }
                    title={customerName}
                    subtitle={`${task.customer?.isp?.name || ''} · ${task.customer?.isp?.speed_limit || ''} · ${task.customer?.installation_area || ''}`}
                    trailing={
                      <StatusBadge
                        label="Menunggu"
                        colorClass="bg-gold-50 text-gold-700 border-gold-200"
                      />
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
