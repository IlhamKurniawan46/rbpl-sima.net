'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import EmptyState from '@/components/ui/EmptyState';
import ActionButton from '@/components/ui/ActionButton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatDateShort } from '@/lib/utils/formatters';
import { Wrench, Wifi, MapPin, Zap, User, X, Phone, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface TechTask {
  id: string;
  type: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
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

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'in_progress', label: 'Menunggu' },
  { value: 'completed', label: 'Selesai' },
];

function TechTasksContent() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState<TechTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TechTask | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('installations_and_tickets')
        .select(`
          id,
          type,
          status,
          scheduled_date,
          created_at,
          customer:customers(
            id,
            installation_address,
            installation_area,
            profile:profiles!customers_profile_id_fkey(
              full_name,
              phone
            ),
            isp:isps(
              name,
              speed_limit
            )
          )
        `)
        .eq('technician_id', profile.id)
        .eq('type', 'new_installation');

      if (error) throw error;
      setTasks((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchTasks();
    }
  }, [profile?.id, fetchTasks]);

  // Open task if ID is passed in query parameters
  useEffect(() => {
    const taskId = searchParams.get('id');
    if (taskId && tasks.length > 0) {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setSelectedTask(found);
      }
    }
  }, [searchParams, tasks]);

  const handleMarkComplete = async (task: TechTask) => {
    if (!profile || !task.customer?.id) return;
    setCompleting(task.id);
    try {
      const supabase = createClient();

      // A. Update the task status in installations_and_tickets table
      const { error: taskErr } = await supabase
        .from('installations_and_tickets')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', task.id);
      if (taskErr) throw taskErr;

      // B. Update the customer's account service status to 'active' in customers table
      const { error: custErr } = await supabase
        .from('customers')
        .update({ status: 'active' })
        .eq('id', task.customer.id);
      if (custErr) throw custErr;

      showToast('Pemasangan berhasil diselesaikan! Status pelanggan telah diperbarui.', 'success');
      
      // Optimistically update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed' } : t
        )
      );

      // Also update selected task modal if open
      if (selectedTask?.id === task.id) {
        setSelectedTask((prev) => prev ? { ...prev, status: 'completed' } : null);
      }
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
      <TopBar title="Tugas Pemasangan" showBack backHref="/technician/dashboard" />
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
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTask(item)}
                className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3 cursor-pointer hover:border-maroon-200 transition-all active:scale-[0.99]"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Wifi size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-heading">
                        {item.customer?.isp?.name || 'Paket Internet'}
                      </p>
                      {item.customer?.isp?.speed_limit && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Zap size={11} className="text-gold-500" />
                          <span className="text-xs text-text-muted">{item.customer.isp.speed_limit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge
                    label={item.status === 'completed' ? 'Selesai' : 'Menunggu'}
                    colorClass={
                      item.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gold-50 text-gold-700 border-gold-200'
                    }
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <User size={12} />
                    <span className="font-medium text-text-primary">
                      {item.customer?.profile?.full_name || 'Pelanggan Baru'}
                    </span>
                    {item.customer?.profile?.phone && <span>· {item.customer.profile.phone}</span>}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {item.customer?.installation_area ? `${item.customer.installation_area} · ` : ''}
                      {item.customer?.installation_address || 'Alamat tidak tersedia'}
                    </span>
                  </div>
                  {item.scheduled_date && (
                    <p className="text-[10px]">Jadwal: {formatDateShort(item.scheduled_date)}</p>
                  )}
                  <p className="text-[10px]">Masuk: {formatDateShort(item.created_at)}</p>
                </div>

                {/* Complete button only for pending tasks */}
                {item.status === 'in_progress' && (
                  <div className="pt-2 border-t border-border-light" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                      fullWidth
                      loading={completing === item.id}
                      onClick={() => handleMarkComplete(item)}
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 space-y-5 animate-slide-up pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">Detail Pemasangan</h3>
                <p className="text-xs text-text-muted mt-0.5">Tugas #{selectedTask.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-maroon-50 rounded-2xl p-4 space-y-3 text-xs text-maroon-700">
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-maroon-600" />
                <span className="font-bold text-text-heading text-sm">
                  {selectedTask.customer?.isp?.name || 'Paket Internet'}
                </span>
                <span className="opacity-60">·</span>
                <Zap size={12} className="text-gold-600" />
                <span className="font-semibold">{selectedTask.customer?.isp?.speed_limit}</span>
              </div>

              <div className="border-t border-maroon-100 my-2" />

              <div className="space-y-2 text-text-primary text-xs">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-text-muted" />
                  <span className="font-semibold">{selectedTask.customer?.profile?.full_name || 'Pelanggan Baru'}</span>
                </div>
                {selectedTask.customer?.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-text-muted" />
                    <span>{selectedTask.customer.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
                  <span>
                    {selectedTask.customer?.installation_area ? `${selectedTask.customer.installation_area} · ` : ''}
                    {selectedTask.customer?.installation_address}
                  </span>
                </div>
                {selectedTask.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted" />
                    <span className="font-medium text-maroon-800">
                      Jadwal: {formatDateShort(selectedTask.scheduled_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons inside Modal */}
            {selectedTask.status === 'in_progress' ? (
              <ActionButton
                fullWidth
                loading={completing === selectedTask.id}
                onClick={() => handleMarkComplete(selectedTask)}
              >
                Tandai Pemasangan Selesai
              </ActionButton>
            ) : (
              <div className="text-center py-2.5 bg-green-50 text-green-700 text-xs font-semibold rounded-xl border border-green-200">
                Pemasangan Telah Selesai
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function TechTasksPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen text-text-muted gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
        <p className="text-xs">Memuat...</p>
      </div>
    }>
      <TechTasksContent />
    </Suspense>
  );
}
