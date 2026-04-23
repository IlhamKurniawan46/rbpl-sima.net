'use client';

import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianByUserId, getTicketsForTechnician } from '@/lib/mock-data';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/lib/utils/constants';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { Ticket } from 'lucide-react';

export default function TechTicketsPage() {
  const { user } = useAuth();
  const tech = user ? getTechnicianByUserId(user.id) : null;
  const tickets = tech ? getTicketsForTechnician(tech.id) : [];

  return (
    <>
      <TopBar title="Tiket Saya" />
      <div className="p-4">
        {tickets.length === 0 ? (
          <EmptyState icon={Ticket} title="Tidak Ada Tiket" message="Belum ada tiket yang ditugaskan kepada Anda." />
        ) : (
          <div className="space-y-2.5 stagger-children">
            {tickets.map((t) => (
              <ListCard
                key={t.id}
                href={`/technician/tickets/${t.id}`}
                avatar={
                  <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                    {getInitials(t.customer?.user?.full_name || '')}
                  </div>
                }
                title={t.subject}
                subtitle={`${t.customer?.user?.full_name} · ${formatRelativeTime(t.created_at)}`}
                trailing={
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge label={TICKET_STATUS_LABELS[t.status]} colorClass={TICKET_STATUS_COLORS[t.status]} />
                    <StatusBadge label={TICKET_PRIORITY_LABELS[t.priority]} colorClass={TICKET_PRIORITY_COLORS[t.priority]} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
