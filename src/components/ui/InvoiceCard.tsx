'use client';

import type { Invoice } from '@/lib/types/database';
import { formatCurrency, formatDateShort } from '@/lib/utils/formatters';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/utils/constants';
import StatusBadge from './StatusBadge';
import { Calendar } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
  onClick?: () => void;
}

export default function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light hover:shadow-[var(--shadow-elevated)] transition-all duration-200 text-left active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-heading truncate">{invoice.description}</p>
          <p className="text-xs text-text-muted mt-0.5">{invoice.customer?.user?.full_name}</p>
        </div>
        <StatusBadge label={INVOICE_STATUS_LABELS[invoice.status]} colorClass={INVOICE_STATUS_COLORS[invoice.status]} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Calendar size={14} />
          <span className="text-xs">{formatDateShort(invoice.due_date)}</span>
        </div>
        <p className={`text-lg font-bold ${invoice.status === 'overdue' ? 'text-red-600' : invoice.status === 'paid' ? 'text-green-600' : 'text-text-heading'}`}>
          {formatCurrency(invoice.amount)}
        </p>
      </div>
    </button>
  );
}
