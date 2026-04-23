'use client';

import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianByUserId, getInstallationsForTechnician, getTicketsForTechnician } from '@/lib/mock-data';
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS, TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/lib/utils/constants';
import { formatDateShort, getInitials } from '@/lib/utils/formatters';
import { Wrench, Ticket, CheckCircle, Clock } from 'lucide-react';

export default function TechDashboard() {
  const { user } = useAuth();
  const tech = user ? getTechnicianByUserId(user.id) : null;
  const installations = tech ? getInstallationsForTechnician(tech.id) : [];
  const tickets = tech ? getTicketsForTechnician(tech.id) : [];

  const pendingTasks = installations.filter((i) => i.status === 'pending' || i.status === 'in_progress').length;
  const completedTasks = installations.filter((i) => i.status === 'success').length;
  const activeTickets = tickets.filter((t) => t.status === 'submitted' || t.status === 'processing').length;

  return (
    <>
      <TopBar title="Dashboard Teknisi" />
      <div className="p-4 space-y-5">
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-text-heading">Halo, {user?.full_name?.split(' ')[0]} 🔧</h2>
          <p className="text-xs text-text-muted mt-0.5">Area: {tech?.assigned_area || '-'}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 stagger-children">
          <StatCard icon={Clock} label="Pending" value={pendingTasks} color="gold" />
          <StatCard icon={CheckCircle} label="Selesai" value={completedTasks} color="green" />
          <StatCard icon={Ticket} label="Tiket" value={activeTickets} color="blue" />
        </div>

        {/* Active Tasks */}
        <div>
          <h3 className="text-sm font-bold text-text-heading mb-2">Tugas Aktif</h3>
          <div className="space-y-2.5">
            {installations.filter((i) => i.status !== 'success').map((ins) => (
              <ListCard
                key={ins.id}
                href={`/technician/tasks/${ins.id}`}
                avatar={<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wrench size={18} /></div>}
                title={ins.customer?.user?.full_name || 'Pelanggan'}
                subtitle={`${ins.package?.name} · ${ins.address}`}
                trailing={<StatusBadge label={INSTALLATION_STATUS_LABELS[ins.status]} colorClass={INSTALLATION_STATUS_COLORS[ins.status]} />}
              />
            ))}
          </div>
        </div>

        {/* Active Tickets */}
        <div>
          <h3 className="text-sm font-bold text-text-heading mb-2">Tiket Ditugaskan</h3>
          <div className="space-y-2.5">
            {tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').map((t) => (
              <ListCard
                key={t.id}
                href={`/technician/tickets/${t.id}`}
                avatar={
                  <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold">
                    {getInitials(t.customer?.user?.full_name || '')}
                  </div>
                }
                title={t.subject}
                subtitle={t.customer?.user?.full_name || ''}
                trailing={<StatusBadge label={TICKET_STATUS_LABELS[t.status]} colorClass={TICKET_STATUS_COLORS[t.status]} />}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
