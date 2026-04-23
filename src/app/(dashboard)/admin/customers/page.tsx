'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import SearchBar from '@/components/ui/SearchBar';
import FilterChips from '@/components/ui/FilterChips';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockCustomers } from '@/lib/mock-data';
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/formatters';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'inactive', label: 'Nonaktif' },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockCustomers.filter((c) => {
    const matchSearch = !search || c.user?.full_name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <TopBar title="Pelanggan" showBack backHref="/admin/dashboard" />
      <div className="p-4 space-y-4">
        <SearchBar placeholder="Cari pelanggan..." value={search} onChange={setSearch} />
        <FilterChips options={FILTER_OPTIONS} selected={filter} onChange={setFilter} />
        <div className="space-y-2.5 stagger-children">
          {filtered.map((c) => (
            <ListCard
              key={c.id}
              href={`/admin/customers/${c.id}`}
              avatar={
                <div className="w-10 h-10 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                  {getInitials(c.user?.full_name || '')}
                </div>
              }
              title={c.user?.full_name || ''}
              subtitle={`${c.area_code} · ${c.address}`}
              trailing={<StatusBadge label={CUSTOMER_STATUS_LABELS[c.status]} colorClass={CUSTOMER_STATUS_COLORS[c.status]} />}
              showChevron
            />
          ))}
        </div>
      </div>
    </>
  );
}
