'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianByUserId, getInstallationsForTechnician } from '@/lib/mock-data';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDateShort } from '@/lib/utils/formatters';
import { Wrench, Wifi } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'in_progress', label: 'Proses' },
  { value: 'success', label: 'Selesai' },
];

export default function TechTasksPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const tech = user ? getTechnicianByUserId(user.id) : null;
  const all = tech ? getInstallationsForTechnician(tech.id) : [];
  const tasks = filter === 'all' ? all : all.filter((i) => i.status === filter);

  return (
    <>
      <TopBar title="Tugas Pemasangan" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        {tasks.length === 0 ? (
          <EmptyState icon={Wrench} title="Tidak Ada Tugas" message="Belum ada tugas pemasangan untuk Anda." />
        ) : (
          <div className="space-y-2.5 stagger-children">
            {tasks.map((ins) => (
              <ListCard
                key={ins.id}
                href={`/technician/tasks/${ins.id}`}
                avatar={<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wifi size={18} /></div>}
                title={ins.customer?.user?.full_name || 'Pelanggan'}
                subtitle={`${ins.package?.name} · ${ins.area_code} · ${formatDateShort(ins.created_at)}`}
                trailing={<StatusBadge label={INSTALLATION_STATUS_LABELS[ins.status]} colorClass={INSTALLATION_STATUS_COLORS[ins.status]} />}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
