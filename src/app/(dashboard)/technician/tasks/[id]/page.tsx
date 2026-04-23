'use client';

import { use } from 'react';
import TopBar from '@/components/layout/TopBar';
import TimelineTracker from '@/components/ui/TimelineTracker';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockInstallations } from '@/lib/mock-data';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';
import { MapPin, Package, User, Calendar } from 'lucide-react';
import type { InstallationStatus } from '@/lib/types/database';

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
  const task = mockInstallations.find((i) => i.id === id);
  if (!task) return <div className="p-6 text-center text-text-muted">Tugas tidak ditemukan</div>;

  return (
    <>
      <TopBar title="Detail Tugas" showBack backHref="/technician/tasks" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-heading">Pemasangan {task.package?.name}</h2>
            <StatusBadge label={INSTALLATION_STATUS_LABELS[task.status]} colorClass={INSTALLATION_STATUS_COLORS[task.status]} size="md" />
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-text-muted"><User size={15} /> <span>{task.customer?.user?.full_name}</span></div>
            <div className="flex items-center gap-2 text-text-muted"><MapPin size={15} /> <span>{task.address}</span></div>
            <div className="flex items-center gap-2 text-text-muted"><Package size={15} /> <span>{task.package?.name} — {task.package?.speed_mbps} Mbps</span></div>
            {task.scheduled_date && (
              <div className="flex items-center gap-2 text-text-muted"><Calendar size={15} /> <span>{formatDate(task.scheduled_date)}</span></div>
            )}
          </div>
          {task.notes && (
            <div className="mt-3 p-3 bg-surface-alt rounded-xl">
              <p className="text-xs text-text-muted font-medium mb-1">Catatan:</p>
              <p className="text-sm text-text-primary">{task.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <h3 className="text-sm font-bold text-text-heading mb-3">Status Pemasangan</h3>
          <TimelineTracker steps={getTimelineSteps(task.status)} />
        </div>

        {(task.status === 'pending' || task.status === 'in_progress') && (
          <div className="space-y-2.5">
            {task.status === 'pending' && <ActionButton fullWidth variant="primary">Mulai Pemasangan</ActionButton>}
            {task.status === 'in_progress' && (
              <>
                <ActionButton fullWidth variant="primary">Selesai — Berhasil</ActionButton>
                <ActionButton fullWidth variant="danger">Gagal</ActionButton>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
