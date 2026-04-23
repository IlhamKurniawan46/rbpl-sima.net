'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'maroon' | 'gold' | 'blue' | 'green' | 'gray';
}

const COLOR_MAP = {
  maroon: 'bg-maroon-50 text-maroon-600',
  gold: 'bg-gold-50 text-gold-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'maroon' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_MAP[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
