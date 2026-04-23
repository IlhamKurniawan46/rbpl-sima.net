'use client';

import TopBar from '@/components/layout/TopBar';
import { mockPackages } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wifi, Zap } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminPackagesPage() {
  return (
    <>
      <TopBar title="Paket Internet" showBack backHref="/admin/more" />
      <div className="p-4 space-y-3 stagger-children">
        {mockPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center"><Wifi size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-text-heading">{pkg.name}</p>
                  <p className="text-xs text-text-muted">{pkg.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-light">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Zap size={14} />
                <span className="text-sm font-semibold text-text-heading">{pkg.speed_mbps} Mbps</span>
              </div>
              <p className="text-lg font-bold text-maroon-600">{formatCurrency(pkg.price_monthly)}<span className="text-xs text-text-muted font-normal">/bln</span></p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
