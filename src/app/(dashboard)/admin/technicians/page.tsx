'use client';

import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockTechnicians } from '@/lib/mock-data';
import { TECH_AVAILABILITY_LABELS, TECH_AVAILABILITY_COLORS } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/formatters';

export default function AdminTechniciansPage() {
  return (
    <>
      <TopBar title="Teknisi" showBack backHref="/admin/more" />
      <div className="p-4 space-y-2.5 stagger-children">
        {mockTechnicians.map((t) => (
          <ListCard
            key={t.id}
            avatar={
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                {getInitials(t.user?.full_name || '')}
              </div>
            }
            title={t.user?.full_name || ''}
            subtitle={`${t.specialization} · Area: ${t.assigned_area}`}
            trailing={<StatusBadge label={TECH_AVAILABILITY_LABELS[t.availability]} colorClass={TECH_AVAILABILITY_COLORS[t.availability]} />}
            showChevron={false}
          />
        ))}
      </div>
    </>
  );
}
