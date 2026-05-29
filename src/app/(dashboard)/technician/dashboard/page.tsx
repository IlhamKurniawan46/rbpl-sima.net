'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils/formatters';
import { Wrench, CheckCircle, Clock, MapPin, Wifi, Zap } from 'lucide-react';
import Link from 'next/link';

interface PendingTask {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  profile: { full_name: string } | null;
  isp: { name: string; speed_limit: string } | null;
}

export default function TechDashboard() {
  const { profile } = useAuth();
  const [pending, setPending] = useState<PendingTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
            profile:profiles!customers_profile_id_fkey(full_name),
            isp:isps(name, speed_limit)
          `)
          .in('status', ['pending', 'active'])
          .order('created_at', { ascending: true });

        if (error) throw error;

        const all = (data as any[]) || [];
        const assigned = all.filter((t) => t.managed_by === profile.id);
        setPending(all.filter((t) => t.status === 'pending'));
        setCompletedCount(all.filter((t) => t.status === 'active' && t.managed_by === profile.id).length);
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
      <TopBar title="Dashboard Teknisi" />
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
          <StatCard icon={Wrench} label="Tiket" value="—" color="blue" />
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
              {pending.slice(0, 4).map((task) => (
                <ListCard
                  key={task.id}
                  href="/technician/tasks"
                  avatar={
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Wifi size={18} />
                    </div>
                  }
                  title={task.profile?.full_name || '—'}
                  subtitle={`${task.isp?.name || ''} · ${task.isp?.speed_limit || ''} · ${task.installation_area || ''}`}
                  trailing={
                    <StatusBadge
                      label="Menunggu"
                      colorClass="bg-gold-50 text-gold-700 border-gold-200"
                    />
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
