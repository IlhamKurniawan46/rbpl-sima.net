'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import { createClient } from '@/lib/supabase/client';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/lib/utils/constants';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import type { TicketStatus, TicketPriority } from '@/lib/types/database';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'in_progress', label: 'Diproses' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
  { value: 'done', label: 'Selesai' },
];

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('installations_and_tickets')
          .select(`*, customer:customers(profile:profiles!profile_id(full_name))`)
          .eq('type', 'complaint')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err: any) {
        console.error('Error fetching admin tickets:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const filteredTickets = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <>
      <TopBar title="Semua Tiket" showBack backHref="/admin/dashboard" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border-light text-center">
            <p className="text-sm font-semibold text-text-heading">Tidak ada tiket</p>
            <p className="text-xs text-text-muted mt-1">Belum ada laporan keluhan masuk.</p>
          </div>
        ) : (
          <div className="space-y-2.5 stagger-children">
            {filteredTickets.map((t) => {
              const statusKey = t.status as TicketStatus;
              const priorityKey = t.priority as TicketPriority;
              return (
                <ListCard
                  key={t.id}
                  avatar={
                    <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                      {getInitials(t.customer?.profile?.full_name || '')}
                    </div>
                  }
                  title={t.title || t.subject || t.description || 'Komplain'}
                  subtitle={`${t.customer?.profile?.full_name || 'Pelanggan Baru'} · ${formatRelativeTime(t.created_at)}`}
                  trailing={
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={t.status === 'pending' ? 'Menunggu' : (t.status === 'completed' || t.status === 'success') ? 'Selesai' : (TICKET_STATUS_LABELS[statusKey] || t.status)}
                        colorClass={t.status === 'pending' ? 'bg-gold-50 text-gold-700 border-gold-200' : (t.status === 'completed' || t.status === 'success') ? 'bg-green-50 text-green-700 border-green-200' : (TICKET_STATUS_COLORS[statusKey] || '')}
                      />
                      <StatusBadge label={TICKET_PRIORITY_LABELS[priorityKey] || 'Sedang'} colorClass={TICKET_PRIORITY_COLORS[priorityKey] || 'bg-gold-100 text-gold-700'} />
                    </div>
                  }
                  showChevron={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
