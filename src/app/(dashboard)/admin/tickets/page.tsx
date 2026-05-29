'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import { createClient } from '@/lib/supabase/client';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/lib/utils/constants';
import { formatRelativeTime, getInitials, formatDate } from '@/lib/utils/formatters';
import type { TicketStatus, TicketPriority } from '@/lib/types/database';
import { X, Calendar, Phone, Clock, FileText } from 'lucide-react';

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
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('installations_and_tickets')
          .select(`*, customer:customers(profile:profiles!profile_id(full_name, phone))`)
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
                <div key={t.id} onClick={() => setSelectedTicket(t)} className="cursor-pointer">
                  <ListCard
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal for Admin */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 space-y-5 animate-slide-up pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">Detail Gangguan</h3>
                <p className="text-xs text-text-muted mt-0.5">Tiket #{selectedTicket.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-surface-alt rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Pelanggan</span>
                <span className="font-semibold text-text-heading">{selectedTicket.customer?.profile?.full_name || 'Pelanggan Baru'}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Status</span>
                <StatusBadge
                  label={TICKET_STATUS_LABELS[selectedTicket.status as TicketStatus] || selectedTicket.status}
                  colorClass={TICKET_STATUS_COLORS[selectedTicket.status as TicketStatus] || ''}
                />
              </div>

              <div className="border-t border-border-light my-2" />

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  Waktu Pelaporan
                </span>
                <p className="text-xs font-medium text-text-primary">
                  {formatDate(selectedTicket.created_at)}
                </p>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-heading flex items-center gap-1.5">
                <FileText size={14} className="text-maroon-600" />
                Deskripsi Masalah
              </h4>
              <p className="text-xs text-text-primary bg-white border border-border-light rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedTicket.description || 'Tidak ada deskripsi masalah.'}
              </p>
            </div>

            {/* Attachment Image */}
            {selectedTicket.image_url && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  Bukti Gambar
                </span>
                <div className="relative rounded-2xl overflow-hidden border border-border-light bg-surface-alt aspect-video flex items-center justify-center">
                  <img
                    src={selectedTicket.image_url}
                    alt="Bukti Laporan"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(selectedTicket.image_url!, '_blank')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
