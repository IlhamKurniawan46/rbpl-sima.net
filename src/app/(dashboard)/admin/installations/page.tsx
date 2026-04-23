'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import { mockInstallations } from '@/lib/mock-data';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDateShort, getInitials } from '@/lib/utils/formatters';
import { Wifi } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'in_progress', label: 'Proses' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
];

export default function AdminInstallationsPage() {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? mockInstallations : mockInstallations.filter((i) => i.status === filter);

  return (
    <>
      <TopBar title="Pemasangan" showBack backHref="/admin/more" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        <div className="space-y-2.5 stagger-children">
          {list.map((ins) => (
            <ListCard
              key={ins.id}
              avatar={<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wifi size={18} /></div>}
              title={ins.customer?.user?.full_name || 'Pelanggan'}
              subtitle={`${ins.package?.name} · ${ins.area_code} · ${formatDateShort(ins.created_at)}`}
              trailing={<StatusBadge label={INSTALLATION_STATUS_LABELS[ins.status]} colorClass={INSTALLATION_STATUS_COLORS[ins.status]} />}
              showChevron={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
