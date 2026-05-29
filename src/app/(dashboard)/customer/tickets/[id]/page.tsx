'use client';

import { use, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import TimelineTracker from '@/components/ui/TimelineTracker';
import StatusBadge from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';
import { AlertTriangle, Wrench } from 'lucide-react';
import type { TicketStatus } from '@/lib/types/database';

interface TicketRecord {
  id: string;
  type: string;
  status: TicketStatus;
  description: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  technician: {
    id: string;
    full_name: string;
    phone: string | null;
  } | null;
}

function getTicketTimeline(status: TicketStatus) {
  const steps: { label: string; status: 'completed' | 'active' | 'pending' | 'failed' }[] = [
    { label: 'Diajukan', status: 'pending' },
    { label: 'Diproses Teknisi', status: 'pending' },
    { label: 'Selesai', status: 'pending' },
  ];
  if (status === 'submitted') { steps[0].status = 'active'; }
  else if (status === 'in_progress') { steps[0].status = 'completed'; steps[1].status = 'active'; }
  else if (status === 'success' || status === 'done') { steps[0].status = 'completed'; steps[1].status = 'completed'; steps[2].status = 'completed'; }
  else if (status === 'failed') { steps[0].status = 'completed'; steps[1].status = 'failed'; }
  return steps;
}

export default function CustomerTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('installations_and_tickets')
          .select(`
            id,
            type,
            status,
            description,
            scheduled_date,
            completed_at,
            created_at,
            technician:profiles!technician_id(
              id,
              full_name,
              phone
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setTicket(data as any);
      } catch (err: any) {
        console.error('Error fetching ticket details:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar title="Detail Laporan" showBack backHref="/customer/tickets" />
        <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          <p className="text-xs">Memuat detail laporan...</p>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <TopBar title="Detail Laporan" showBack backHref="/customer/tickets" />
        <div className="p-6 text-center text-text-muted">Tiket tidak ditemukan</div>
      </>
    );
  }

  const statusLabel = TICKET_STATUS_LABELS[ticket.status] || ticket.status;
  const statusColor = TICKET_STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-800';

  return (
    <>
      <TopBar title="Detail Laporan" showBack backHref="/customer/tickets" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-base font-bold text-text-heading flex-1 pr-4">Laporan Gangguan</h2>
            <StatusBadge label={statusLabel} colorClass={statusColor} size="md" />
          </div>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2"><AlertTriangle size={15} /> Dilaporkan: {formatDate(ticket.created_at)}</div>
            {ticket.technician && (
              <div className="flex items-center gap-2"><Wrench size={15} /> Teknisi: {ticket.technician.full_name}</div>
            )}
          </div>
          <div className="mt-3 p-3 bg-surface-alt rounded-xl">
            <p className="text-xs text-text-muted font-medium mb-1">Deskripsi Masalah:</p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{ticket.description || 'Tidak ada deskripsi.'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <h3 className="text-sm font-bold text-text-heading mb-3">Status Penanganan</h3>
          <TimelineTracker steps={getTicketTimeline(ticket.status)} />
        </div>
      </div>
    </>
  );
}
