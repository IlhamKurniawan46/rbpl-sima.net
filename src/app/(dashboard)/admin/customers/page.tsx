'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import SearchBar from '@/components/ui/SearchBar';
import FilterChips from '@/components/ui/FilterChips';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { getInitials } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';

interface CustomerRow {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  profile: { full_name: string; phone: string | null } | null;
  isp: { name: string; speed_limit: string } | null;
  managed_by_profile: { full_name: string } | null;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'inactive', label: 'Nonaktif' },
];

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  pending: 'Menunggu',
  inactive: 'Nonaktif',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  inactive: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
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
            status,
            installation_address,
            installation_area,
            profile:profiles!customers_profile_id_fkey(full_name, phone),
            isp:isps(name, speed_limit),
            managed_by_profile:profiles!customers_managed_by_fkey(full_name)
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
    const isp = c.isp?.name || '';
    const matchSearch =
      !search ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase()) ||
      isp.toLowerCase().includes(search.toLowerCase());
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
              <p className="text-xs text-text-muted mt-1">Coba ubah kata kunci atau filter pencarian.</p>
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
                title={c.profile?.full_name || '—'}
                subtitle={`${c.isp?.name || 'Tidak ada paket'} · ${c.installation_area || ''} · ${c.installation_address}`}
                trailing={
                  <StatusBadge
                    label={STATUS_LABELS[c.status] || c.status}
                    colorClass={STATUS_COLORS[c.status] || 'bg-gray-50 text-gray-600 border-gray-200'}
                  />
                }
                showChevron
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
