'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import InvoiceCard from '@/components/ui/InvoiceCard';
import FilterChips from '@/components/ui/FilterChips';
import StatCard from '@/components/ui/StatCard';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/formatters';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types/database';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'paid', label: 'Lunas' },
];

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('bills_and_payments')
          .select(`
            id,
            customer_id,
            amount,
            billing_period,
            status,
            payment_method,
            paid_at,
            invoice_url,
            created_at,
            customer:customers!customer_id(
              id,
              profile:profiles!profile_id(
                full_name
              )
            )
          `)
          .order('billing_period', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((bill: any): Invoice => {
          // If unpaid and past the 10th of the billing period month, we can treat it as overdue visually.
          const dueDateStr = `${bill.billing_period}-10`;
          const isOverdue = bill.status === 'unpaid' && new Date() > new Date(dueDateStr);
          const status: InvoiceStatus = bill.status === 'paid' ? 'paid' : (isOverdue ? 'overdue' : 'unpaid');

          return {
            id: bill.id,
            customer_id: bill.customer_id,
            amount: Number(bill.amount),
            description: `Tagihan Bulanan - Periode ${bill.billing_period}`,
            status,
            due_date: dueDateStr,
            billing_period_start: `${bill.billing_period}-01`,
            billing_period_end: `${bill.billing_period}-28`,
            created_at: bill.created_at,
            customer: bill.customer
          };
        });

        setInvoices(mapped);
      } catch (err: any) {
        console.error('Error fetching payments:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  const filteredInvoices = invoices.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return i.status === 'unpaid' || i.status === 'overdue';
    return i.status === filter;
  });

  return (
    <>
      <TopBar title="Pembayaran" showBack backHref="/admin/dashboard" />
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckCircle} label="Terbayar" value={formatCurrency(totalPaid)} color="green" />
          <StatCard icon={AlertTriangle} label="Tertunggak" value={formatCurrency(totalUnpaid)} color="gold" />
        </div>
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat data pembayaran...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-xs">
            Tidak ada riwayat pembayaran.
          </div>
        ) : (
          <div className="space-y-2.5 stagger-children">
            {filteredInvoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
