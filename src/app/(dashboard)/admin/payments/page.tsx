'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import InvoiceCard from '@/components/ui/InvoiceCard';
import FilterChips from '@/components/ui/FilterChips';
import StatCard from '@/components/ui/StatCard';
import { mockInvoices } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/formatters';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'paid', label: 'Lunas' },
  { value: 'overdue', label: 'Jatuh Tempo' },
];

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState('all');
  const invoices = filter === 'all' ? mockInvoices : mockInvoices.filter((i) => i.status === filter);

  const totalPaid = mockInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = mockInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <TopBar title="Pembayaran" showBack backHref="/admin/dashboard" />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckCircle} label="Terbayar" value={formatCurrency(totalPaid)} color="green" />
          <StatCard icon={AlertTriangle} label="Tertunggak" value={formatCurrency(totalUnpaid)} color="gold" />
        </div>
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        <div className="space-y-2.5 stagger-children">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      </div>
    </>
  );
}
