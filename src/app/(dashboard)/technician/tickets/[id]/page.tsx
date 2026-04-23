'use client';

import { use } from 'react';
import TopBar from '@/components/layout/TopBar';
import TimelineTracker from '@/components/ui/TimelineTracker';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockTickets } from '@/lib/mock-data';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';
import { User, AlertTriangle, MessageSquare } from 'lucide-react';
import type { TicketStatus } from '@/lib/types/database';

function getTicketTimeline(status: TicketStatus) {
  const steps: { label: string; status: 'completed' | 'active' | 'pending' | 'failed' }[] = [
    { label: 'Diajukan', status: 'pending' },
    { label: 'Diproses', status: 'pending' },
    { label: 'Selesai', status: 'pending' },
  ];
  if (status === 'submitted') { steps[0].status = 'active'; }
  else if (status === 'processing') { steps[0].status = 'completed'; steps[1].status = 'active'; }
  else if (status === 'resolved' || status === 'closed') { steps[0].status = 'completed'; steps[1].status = 'completed'; steps[2].status = 'completed'; }
  return steps;
}

export default function TechTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = mockTickets.find((t) => t.id === id);
  if (!ticket) return <div className="p-6 text-center text-text-muted">Tiket tidak ditemukan</div>;

  return (
    <>
      <TopBar title="Detail Tiket" showBack backHref="/technician/tickets" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-base font-bold text-text-heading flex-1">{ticket.subject}</h2>
            <StatusBadge label={TICKET_PRIORITY_LABELS[ticket.priority]} colorClass={TICKET_PRIORITY_COLORS[ticket.priority]} size="md" />
          </div>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2"><User size={15} /> {ticket.customer?.user?.full_name}</div>
            <div className="flex items-center gap-2"><AlertTriangle size={15} /> Dibuat: {formatDate(ticket.created_at)}</div>
          </div>
          <div className="mt-3 p-3 bg-surface-alt rounded-xl">
            <p className="text-xs text-text-muted font-medium mb-1">Deskripsi:</p>
            <p className="text-sm text-text-primary">{ticket.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
          <h3 className="text-sm font-bold text-text-heading mb-3">Status Penanganan</h3>
          <TimelineTracker steps={getTicketTimeline(ticket.status)} />
        </div>

        {ticket.status === 'processing' && (
          <ActionButton fullWidth variant="primary" icon={<MessageSquare size={16} />}>
            Tandai Selesai
          </ActionButton>
        )}
      </div>
    </>
  );
}
