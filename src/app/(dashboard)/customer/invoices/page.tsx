'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import InvoiceCard from '@/components/ui/InvoiceCard';
import FilterChips from '@/components/ui/FilterChips';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CreditCard } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types/database';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'paid', label: 'Lunas' },
];

export default function CustomerInvoicesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const supabase = createClient();

      // A. Get customer details linked to user
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (custErr) throw custErr;
      if (!custData) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      // B. Fetch bills for the customer
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
        .eq('customer_id', custData.id)
        .order('billing_period', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((bill: any): Invoice => {
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
      console.error('Error fetching customer invoices:', err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchInvoices();
    }
  }, [profile?.id, fetchInvoices]);

  const filteredInvoices = invoices.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return i.status === 'unpaid' || i.status === 'overdue';
    return i.status === filter;
  });

  return (
    <>
      <TopBar title="Tagihan" />
      <div className="p-4 space-y-4 animate-fade-in">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat tagihan Anda...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState icon={CreditCard} title="Tidak Ada Tagihan" message="Belum ada tagihan untuk ditampilkan." />
        ) : (
          <div className="space-y-2.5 stagger-children">
            {filteredInvoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} onClick={() => router.push(`/customer/invoices/${inv.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
