'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import SearchBar from '@/components/ui/SearchBar';
import FilterChips from '@/components/ui/FilterChips';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Customer } from '@/lib/types/database';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'inactive', label: 'Nonaktif' },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('customers')
          .select(`
            id,
            profile_id,
            managed_by,
            isp_id,
            installation_address,
            installation_area,
            status,
            created_at,
            updated_at,
            profile:profiles!customers_profile_id_fkey(id, full_name, phone, role, created_at)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setCustomers((data as any[]) || []);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Gagal memuat data pelanggan');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const fullName = c.profile?.full_name || '';
    const address = c.installation_address || '';
    const matchSearch =
      !search ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase());
    
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
              <p className="text-xs">Memuat data pelanggan...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">Gagal terhubung ke database.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-border-light text-center">
              <p className="text-sm font-semibold text-text-heading">Belum ada pelanggan ditemukan</p>
              <p className="text-xs text-text-muted mt-1">Gunakan kata kunci pencarian atau filter yang berbeda.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <ListCard
                key={c.id}
                href={`/admin/customers/${c.id}`}
                avatar={
                  <div className="w-10 h-10 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                    {getInitials(c.profile?.full_name || '')}
                  </div>
                }
                title={c.profile?.full_name || ''}
                subtitle={`${c.installation_area || 'Umum'} · ${c.installation_address}`}
                trailing={<StatusBadge label={CUSTOMER_STATUS_LABELS[c.status]} colorClass={CUSTOMER_STATUS_COLORS[c.status]} />}
                showChevron
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
