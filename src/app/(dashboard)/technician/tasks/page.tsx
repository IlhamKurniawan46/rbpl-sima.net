'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import EmptyState from '@/components/ui/EmptyState';
import ActionButton from '@/components/ui/ActionButton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatDateShort, formatCurrency } from '@/lib/utils/formatters';
import { Wrench, Wifi, MapPin, Zap, User } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PendingCustomer {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  managed_by: string | null;
  created_at: string;
  profile: { full_name: string; phone: string | null } | null;
  isp: { name: string; speed_limit: string; price: number } | null;
}

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'active', label: 'Selesai' },
];

export default function TechTasksPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          status,
          installation_address,
          installation_area,
          managed_by,
          created_at,
          profile:profiles!customers_profile_id_fkey(full_name, phone),
          isp:isps(name, speed_limit, price)
        `)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMarkComplete = async (customerId: string) => {
    if (!profile) return;
    setCompleting(customerId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('customers')
        .update({
          status: 'active',
          managed_by: profile.id
        })
        .eq('id', customerId);

      if (error) throw error;
      showToast('Pemasangan berhasil diselesaikan! Status pelanggan telah diperbarui.', 'success');
      // Optimistically update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === customerId ? { ...t, status: 'active', managed_by: profile.id } : t
        )
      );
    } catch (err: any) {
      console.error('Error completing task:', err.message);
      showToast('Gagal memperbarui status pemasangan', 'error');
    } finally {
      setCompleting(null);
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <>
      <TopBar title="Tugas Pemasangan" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat tugas pemasangan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Wrench} title="Tidak Ada Tugas" message="Belum ada tugas pemasangan yang tersedia." />
        ) : (
          <div className="space-y-3 stagger-children">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Wifi size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-heading">{task.isp?.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Zap size={11} className="text-gold-500" />
                        <span className="text-xs text-text-muted">{task.isp?.speed_limit}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    label={task.status === 'active' ? 'Selesai' : 'Menunggu'}
                    colorClass={
                      task.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gold-50 text-gold-700 border-gold-200'
                    }
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <User size={12} />
                    <span className="font-medium text-text-primary">{task.profile?.full_name || 'Nama tidak tersedia'}</span>
                    {task.profile?.phone && <span>· {task.profile.phone}</span>}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{task.installation_area ? `${task.installation_area} · ` : ''}{task.installation_address}</span>
                  </div>
                  <p className="text-[10px]">Masuk: {formatDateShort(task.created_at)}</p>
                </div>

                {/* Complete button only for pending tasks */}
                {task.status === 'pending' && (
                  <div className="pt-2 border-t border-border-light">
                    <ActionButton
                      fullWidth
                      loading={completing === task.id}
                      onClick={() => handleMarkComplete(task.id)}
                    >
                      Tandai Pemasangan Selesai
                    </ActionButton>
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
