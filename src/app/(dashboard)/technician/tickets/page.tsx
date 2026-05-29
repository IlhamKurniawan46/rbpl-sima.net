'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { Ticket } from 'lucide-react';
import type { TicketStatus } from '@/lib/types/database';

interface TechTicket {
  id: string;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
  customer: {
    profile: { full_name: string; phone: string | null } | null;
  } | null;
}

export default function TechTicketsPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<TechTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!profile?.id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('installations_and_tickets')
          .select(`
            id,
            type,
            status,
            description,
            created_at,
            customer:customers(
              profile:profiles!profile_id(full_name, phone)
            )
          `)
          .eq('type', 'complaint')
          .or(`technician_id.eq.${profile.id},technician_id.is.null`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets((data as any[]) || []);
      } catch (err: any) {
        console.error('Error fetching technician tickets:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, [profile?.id]);

  return (
    <>
      <TopBar title="Tiket Saya" />
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={Ticket} title="Tidak Ada Tiket" message="Belum ada tiket keluhan yang ditugaskan kepada Anda." />
        ) : (
          <div className="space-y-2.5 stagger-children">
            {tickets.map((t) => {
              const statusKey = t.status as TicketStatus;
              return (
                <ListCard
                  key={t.id}
                  href={`/technician/tickets/${t.id}`}
                  avatar={
                    <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                      {getInitials(t.customer?.profile?.full_name || '')}
                    </div>
                  }
                  title={t.description || 'Komplain'}
                  subtitle={`${t.customer?.profile?.full_name || 'Pelanggan'} · ${formatRelativeTime(t.created_at)}`}
                  trailing={
                    <StatusBadge
                      label={TICKET_STATUS_LABELS[statusKey] || t.status}
                      colorClass={TICKET_STATUS_COLORS[statusKey] || ''}
                    />
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
