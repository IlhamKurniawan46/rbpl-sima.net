'use client';

import { use, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import TimelineTracker from '@/components/ui/TimelineTracker';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';
import { MapPin, Package, User, Calendar, Play, CheckCircle, XCircle } from 'lucide-react';
import type { InstallationStatus } from '@/lib/types/database';

interface TaskRecord {
  id: string;
  type: string;
  status: InstallationStatus;
  description: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  customer: {
    id: string;
    installation_address: string;
    installation_area: string | null;
    profile: {
      full_name: string;
    } | null;
    isp: {
      name: string;
      speed_limit: string;
    } | null;
  } | null;
}

function getTimelineSteps(status: InstallationStatus) {
  const steps: { label: string; status: 'completed' | 'active' | 'pending' | 'failed' }[] = [
    { label: 'Menunggu', status: 'pending' },
    { label: 'Dalam Proses', status: 'pending' },
    { label: 'Selesai', status: 'pending' },
  ];
  if (status === 'pending') { steps[0].status = 'active'; }
  else if (status === 'in_progress') { steps[0].status = 'completed'; steps[1].status = 'active'; }
  else if (status === 'success') { steps[0].status = 'completed'; steps[1].status = 'completed'; steps[2].status = 'completed'; }
  else if (status === 'failed') { steps[0].status = 'completed'; steps[1].status = 'failed'; }
  return steps;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('installations_and_tickets')
        .select(`
          id,
          type,
          status,
          description,
          scheduled_date,
          completed_at,
          created_at,
          customer:customers!customer_id(
            id,
            installation_address,
            installation_area,
            profile:profiles!profile_id(
              full_name
            ),
            isp:isps!isp_id(
              name,
              speed_limit
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data as any);
    } catch (err: any) {
      console.error('Error fetching task details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStart = async () => {
    if (!task) return;
    setUpdating('start');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('installations_and_tickets')
        .update({ status: 'in_progress' })
        .eq('id', task.id);

      if (error) throw error;
      await fetchTask();
    } catch (err: any) {
      console.error('Error starting task:', err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleComplete = async (success: boolean) => {
    if (!task || !task.customer?.id) return;
    setUpdating(success ? 'complete' : 'fail');
    try {
      const supabase = createClient();
      
      // Update installations_and_tickets status
      const { error: taskErr } = await supabase
        .from('installations_and_tickets')
        .update({
          status: success ? 'success' : 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);
      if (taskErr) throw taskErr;

      // If successful installation, update customer account status to 'active'
      if (success) {
        const { error: custErr } = await supabase
          .from('customers')
          .update({ status: 'active' })
          .eq('id', task.customer.id);
        if (custErr) throw custErr;
      }

      await fetchTask();
    } catch (err: any) {
      console.error('Error completing task:', err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Detail Tugas" showBack backHref="/technician/tasks" />
        <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          <p className="text-xs">Memuat detail tugas...</p>
        </div>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <TopBar title="Detail Tugas" showBack backHref="/technician/tasks" />
        <div className="p-6 text-center text-text-muted">Tugas tidak ditemukan</div>
      </>
    );
  }

  const packageName = task.customer?.isp?.name || 'Paket Internet';
  const packageSpeed = task.customer?.isp?.speed_limit || '';

  return (
    <>
      <TopBar title="Detail Tugas" showBack backHref="/technician/tasks" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-heading">Pemasangan {packageName}</h2>
            <StatusBadge label={INSTALLATION_STATUS_LABELS[task.status]} colorClass={INSTALLATION_STATUS_COLORS[task.status]} size="md" />
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <User size={15} /> 
              <span>{task.customer?.profile?.full_name || 'Pelanggan'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin size={15} /> 
              <span>{task.customer?.installation_address || 'Alamat tidak ditentukan'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Package size={15} /> 
              <span>{packageName} {packageSpeed ? `— ${packageSpeed}` : ''}</span>
            </div>
            {task.scheduled_date && (
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={15} /> 
                <span>{formatDate(task.scheduled_date)}</span>
              </div>
            )}
          </div>
          {task.description && (
            <div className="mt-3 p-3 bg-surface-alt rounded-xl">
              <p className="text-xs text-text-muted font-medium mb-1">Catatan:</p>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <h3 className="text-sm font-bold text-text-heading mb-3">Status Pemasangan</h3>
          <TimelineTracker steps={getTimelineSteps(task.status)} />
        </div>

        {(task.status === 'pending' || task.status === 'in_progress') && (
          <div className="space-y-2.5">
            {task.status === 'pending' && (
              <ActionButton 
                fullWidth 
                variant="primary"
                icon={<Play size={16} />}
                onClick={handleStart}
                loading={updating === 'start'}
              >
                Mulai Pemasangan
              </ActionButton>
            )}
            {task.status === 'in_progress' && (
              <>
                <ActionButton 
                  fullWidth 
                  variant="primary"
                  icon={<CheckCircle size={16} />}
                  onClick={() => handleComplete(true)}
                  loading={updating === 'complete'}
                >
                  Selesai — Berhasil
                </ActionButton>
                <ActionButton 
                  fullWidth 
                  variant="danger"
                  icon={<XCircle size={16} />}
                  onClick={() => handleComplete(false)}
                  loading={updating === 'fail'}
                >
                  Gagal
                </ActionButton>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
