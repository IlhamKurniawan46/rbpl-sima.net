'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { getInitials } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, role, created_at')
          .eq('role', 'technician')
          .order('full_name', { ascending: true });

        if (error) throw error;
        setTechnicians(data || []);
      } catch (err) {
        console.error('Error fetching technicians:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTechnicians();
  }, []);

  return (
    <>
      <TopBar title="Teknisi" showBack backHref="/admin/more" />
      <div className="p-4 space-y-2.5 stagger-children">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat data teknisi...</p>
          </div>
        ) : technicians.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border-light text-center">
            <p className="text-sm font-semibold text-text-heading">Belum ada data teknisi</p>
            <p className="text-xs text-text-muted mt-1">Gunakan menu 'Tambah Staff' untuk mendaftarkan teknisi baru.</p>
          </div>
        ) : (
          technicians.map((t) => (
            <ListCard
              key={t.id}
              avatar={
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {getInitials(t.full_name || '')}
                </div>
              }
              title={t.full_name || ''}
              subtitle={t.phone || 'Nomor telepon tidak tersedia'}
              trailing={
                <StatusBadge 
                  label="Aktif" 
                  colorClass="bg-green-50 text-green-700 border-green-200" 
                />
              }
              showChevron={false}
            />
          ))
        )}
      </div>
    </>
  );
}
