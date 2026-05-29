'use client';

import { use, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import TimelineTracker from '@/components/ui/TimelineTracker';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';
import { User, AlertTriangle, MessageSquare, AlertOctagon } from 'lucide-react';
import type { TicketStatus } from '@/lib/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface TicketRecord {
  id: string;
  type: string;
  status: TicketStatus;
  description: string | null;
  image_url: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  customer: {
    id: string;
    profile: {
      full_name: string;
    } | null;
  } | null;
}

function getTicketTimeline(status: TicketStatus) {
  const steps: { label: string; status: 'completed' | 'active' | 'pending' | 'failed' }[] = [
    { label: 'Diajukan', status: 'pending' },
    { label: 'Diproses', status: 'pending' },
    { label: 'Selesai', status: 'pending' },
  ];
  if (status === 'submitted') { steps[0].status = 'active'; }
  else if (status === 'in_progress') { steps[0].status = 'completed'; steps[1].status = 'active'; }
  else if (status === 'success' || status === 'done') { steps[0].status = 'completed'; steps[1].status = 'completed'; steps[2].status = 'completed'; }
  else if (status === 'failed') { steps[0].status = 'completed'; steps[1].status = 'failed'; }
  return steps;
}

export default function TechTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = useAuth();
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTicket = async () => {
    try {
      const supabase = createClient();
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
          customer:customers!customer_id(
            id,
            profile:profiles!profile_id(
              full_name
            )
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
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStartProcessing = async () => {
    if (!ticket || !profile?.id) return;
    setUpdating('in_progress');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('installations_and_tickets')
        .update({
          status: 'in_progress',
          technician_id: profile.id
        })
        .eq('id', ticket.id);

      if (error) throw error;
      await fetchTicket();
    } catch (err: any) {
      console.error('Error starting processing ticket:', err.message);
    } finally {
      setUpdating(null);
    }
  };

  const updateStatus = async (newStatus: 'success' | 'failed') => {
    if (!ticket) return;
    setUpdating(newStatus);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('installations_and_tickets')
        .update({
          status: newStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;
      await fetchTicket();
    } catch (err: any) {
      console.error('Error updating ticket status:', err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Detail Tiket" showBack backHref="/technician/tickets" />
        <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          <p className="text-xs">Memuat detail tiket...</p>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <TopBar title="Detail Tiket" showBack backHref="/technician/tickets" />
        <div className="p-6 text-center text-text-muted">Tiket tidak ditemukan</div>
      </>
    );
  }

  const statusLabel = TICKET_STATUS_LABELS[ticket.status] || ticket.status;
  const statusColor = TICKET_STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-800';

  return (
    <>
      <TopBar title="Detail Tiket" showBack backHref="/technician/tickets" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-base font-bold text-text-heading flex-1">Laporan Gangguan</h2>
            <StatusBadge label={statusLabel} colorClass={statusColor} size="md" />
          </div>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <User size={15} /> 
              <span>{ticket.customer?.profile?.full_name || 'Pelanggan'}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} /> 
              <span>Dibuat: {formatDate(ticket.created_at)}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-surface-alt rounded-xl">
            <p className="text-xs text-text-muted font-medium mb-1">Deskripsi:</p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{ticket.description || 'Tidak ada deskripsi.'}</p>
          </div>
          {ticket.image_url && (
            <div className="mt-3 p-3 bg-surface-alt rounded-xl space-y-2">
              <p className="text-xs text-text-muted font-medium">Bukti Gambar:</p>
              <div className="relative rounded-lg overflow-hidden border border-border-light bg-white aspect-video max-w-sm flex items-center justify-center">
                <img
                  src={ticket.image_url}
                  alt="Bukti Laporan"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(ticket.image_url!, '_blank')}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <h3 className="text-sm font-bold text-text-heading mb-3">Status Penanganan</h3>
          <TimelineTracker steps={getTicketTimeline(ticket.status)} />
        </div>

        {ticket.status === 'submitted' && (
          <ActionButton 
            fullWidth 
            variant="primary" 
            onClick={handleStartProcessing}
            loading={updating === 'in_progress'}
          >
            Mulai Proses (Diproses)
          </ActionButton>
        )}

        {ticket.status === 'in_progress' && (
          <div className="space-y-2.5">
            <ActionButton 
              fullWidth 
              variant="primary" 
              icon={<MessageSquare size={16} />}
              onClick={() => updateStatus('success')}
              loading={updating === 'success'}
            >
              Tandai Selesai
            </ActionButton>
            <ActionButton 
              fullWidth 
              variant="danger" 
              icon={<AlertOctagon size={16} />}
              onClick={() => updateStatus('failed')}
              loading={updating === 'failed'}
            >
              Tandai Gagal
            </ActionButton>
          </div>
        )}
      </div>
    </>
  );
}
