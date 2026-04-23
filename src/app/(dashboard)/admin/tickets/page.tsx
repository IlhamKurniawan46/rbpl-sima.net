'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import { mockTickets } from '@/lib/mock-data';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/lib/utils/constants';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'processing', label: 'Diproses' },
  { value: 'resolved', label: 'Selesai' },
  { value: 'closed', label: 'Ditutup' },
];

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState('all');
  const tickets = filter === 'all' ? mockTickets : mockTickets.filter((t) => t.status === filter);

  return (
    <>
      <TopBar title="Semua Tiket" showBack backHref="/admin/dashboard" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        <div className="space-y-2.5 stagger-children">
          {tickets.map((t) => (
            <ListCard
              key={t.id}
              avatar={
                <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                  {getInitials(t.customer?.user?.full_name || '')}
                </div>
              }
              title={t.subject}
              subtitle={`${t.customer?.user?.full_name} · ${formatRelativeTime(t.created_at)}`}
              trailing={
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge label={TICKET_STATUS_LABELS[t.status]} colorClass={TICKET_STATUS_COLORS[t.status]} />
                  <StatusBadge label={TICKET_PRIORITY_LABELS[t.priority]} colorClass={TICKET_PRIORITY_COLORS[t.priority]} />
                </div>
              }
              showChevron={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
