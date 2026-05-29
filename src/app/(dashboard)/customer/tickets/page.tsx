'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ActionButton from '@/components/ui/ActionButton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatDateShort } from '@/lib/utils/formatters';
import { Ticket, Plus, X, Calendar, User, Phone, Clock, FileText } from 'lucide-react';

interface TicketRecord {
  id: string;
  type: string;
  status: string;
  description: string | null;
  image_url: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  technician: {
    full_name: string;
    phone: string | null;
  } | null;
}

export default function CustomerTicketsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const supabase = createClient();
      
      // A. Get the customer ID first
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (custErr) throw custErr;
      if (!custData) {
        setTickets([]);
        setLoading(false);
        return;
      }

      // B. Fetch complaint tickets
      const { data, error } = await supabase
        .from('installations_and_tickets')
        .select(`
          id,
          type,
          status,
          description,
          image_url,
          scheduled_date,
          completed_at,
          created_at,
          technician:profiles!technician_id(
            full_name,
            phone
          )
        `)
        .eq('customer_id', custData.id)
        .eq('type', 'complaint')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchTickets();
    }
  }, [profile?.id, fetchTickets]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: 'Diajukan', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'in_progress':
        return { label: 'Diproses', color: 'bg-gold-50 text-gold-700 border-gold-200' };
      case 'success':
      case 'done':
      case 'completed':
        return { label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'failed':
        return { label: 'Gagal', color: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  return (
    <>
      <TopBar title="Riwayat Laporan" />
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Floating Action / Header Button to report new issue */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-text-heading">Daftar Laporan Anda</h2>
          <ActionButton
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => router.push('/customer/tickets/new')}
          >
            Laporan Baru
          </ActionButton>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat riwayat laporan...</p>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Tidak Ada Laporan"
            message="Belum ada riwayat laporan gangguan yang Anda ajukan."
          />
        ) : (
          <div className="space-y-3 stagger-children">
            {tickets.map((ticket) => {
              const statusInfo = getStatusInfo(ticket.status);
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3 cursor-pointer hover:border-maroon-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                        <Ticket size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-text-heading">
                          Laporan Gangguan
                        </h3>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          ID: #{ticket.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={statusInfo.label} colorClass={statusInfo.color} />
                  </div>

                  <p className="text-xs text-text-primary line-clamp-2 leading-relaxed">
                    {ticket.description || 'Tidak ada deskripsi.'}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-border-light text-[10px] text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{formatDateShort(ticket.created_at)}</span>
                    </div>
                    {ticket.technician && (
                      <span className="bg-surface-alt px-2 py-0.5 rounded-full font-medium text-text-heading">
                        Teknisi ditugaskan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Status Laporan</span>
                <StatusBadge
                  label={getStatusInfo(selectedTicket.status).label}
                  colorClass={getStatusInfo(selectedTicket.status).color}
                />
              </div>

              <div className="border-t border-border-light my-2" />

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  Waktu Pelaporan
                </span>
                <p className="text-xs font-medium text-text-primary">
                  {new Date(selectedTicket.created_at).toLocaleString('id-ID', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              {selectedTicket.scheduled_date && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                    Jadwal Kunjungan Teknisi
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-maroon-700">
                    <Calendar size={13} />
                    <span>
                      {new Date(selectedTicket.scheduled_date).toLocaleString('id-ID', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              )}
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

            {/* Assigned Technician */}
            {selectedTicket.technician ? (
              <div className="bg-maroon-50 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-maroon-800">
                  Teknisi yang Bertugas
                </span>
                <div className="flex items-center justify-between text-xs text-text-primary">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-600 font-bold">
                      {selectedTicket.technician.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-heading text-xs">
                        {selectedTicket.technician.full_name}
                      </p>
                      <p className="text-[10px] text-text-muted">Teknisi SIMA-Net</p>
                    </div>
                  </div>
                  {selectedTicket.technician.phone && (
                    <a
                      href={`tel:${selectedTicket.technician.phone}`}
                      className="w-8 h-8 rounded-xl bg-white border border-border-light flex items-center justify-center text-maroon-600 hover:bg-maroon-50 transition-colors"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-3 bg-gray-50 border border-gray-150 rounded-2xl text-[11px] text-text-muted font-medium">
                Belum ada teknisi yang ditugaskan ke laporan Anda.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
