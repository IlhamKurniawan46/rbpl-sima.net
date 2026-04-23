'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import InvoiceCard from '@/components/ui/InvoiceCard';
import FilterChips from '@/components/ui/FilterChips';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getCustomerByUserId, getInvoicesForCustomer } from '@/lib/mock-data';
import { CreditCard } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'paid', label: 'Lunas' },
  { value: 'overdue', label: 'Jatuh Tempo' },
];

export default function CustomerInvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const customer = user ? getCustomerByUserId(user.id) : null;
  const all = customer ? getInvoicesForCustomer(customer.id) : [];
  const invoices = filter === 'all' ? all : all.filter((i) => i.status === filter);

  return (
    <>
      <TopBar title="Tagihan" />
      <div className="p-4 space-y-4">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />
        {invoices.length === 0 ? (
          <EmptyState icon={CreditCard} title="Tidak Ada Tagihan" message="Belum ada tagihan untuk ditampilkan." />
        ) : (
          <div className="space-y-2.5 stagger-children">
            {invoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} onClick={() => router.push(`/customer/invoices/${inv.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
