'use client';

import { use, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionButton from '@/components/ui/ActionButton';
import { createClient } from '@/lib/supabase/client';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/utils/constants';
import { formatCurrency, formatDateShort } from '@/lib/utils/formatters';
import { Calendar, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { InvoiceStatus } from '@/lib/types/database';

interface BillRecord {
  id: string;
  customer_id: string;
  amount: number;
  billing_period: string;
  status: 'unpaid' | 'paid';
  payment_method: string | null;
  paid_at: string | null;
  invoice_url: string | null;
  created_at: string;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();
  const [bill, setBill] = useState<BillRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchBill = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bills_and_payments')
        .select('id, customer_id, amount, billing_period, status, payment_method, paid_at, invoice_url, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBill(data as any);
    } catch (err: any) {
      console.error('Error fetching invoice details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  const handlePay = async () => {
    if (!bill) return;
    setPaying(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bills_and_payments')
        .update({
          status: 'paid',
          payment_method: 'bank_transfer',
          paid_at: new Date().toISOString()
        })
        .eq('id', bill.id);

      if (error) throw error;
      showToast('Pembayaran berhasil diproses!', 'success');
      await fetchBill();
    } catch (err: any) {
      console.error('Error processing payment:', err.message);
      showToast('Gagal memproses pembayaran', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Detail Tagihan" showBack backHref="/customer/invoices" />
        <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          <p className="text-xs">Memuat detail tagihan...</p>
        </div>
      </>
    );
  }

  if (!bill) {
    return (
      <>
        <TopBar title="Detail Tagihan" showBack backHref="/customer/invoices" />
        <div className="p-6 text-center text-text-muted">Tagihan tidak ditemukan</div>
      </>
    );
  }

  const dueDateStr = `${bill.billing_period}-10`;
  const isOverdue = bill.status === 'unpaid' && new Date() > new Date(dueDateStr);
  const mappedStatus: InvoiceStatus = bill.status === 'paid' ? 'paid' : (isOverdue ? 'overdue' : 'unpaid');

  const statusLabel = INVOICE_STATUS_LABELS[mappedStatus] || bill.status;
  const statusColor = INVOICE_STATUS_COLORS[mappedStatus] || 'bg-gray-100 text-gray-800';

  const billingPeriodStart = `${bill.billing_period}-01`;
  const billingPeriodEnd = `${bill.billing_period}-28`;

  return (
    <>
      <TopBar title="Detail Tagihan" showBack backHref="/customer/invoices" />
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Invoice Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <StatusBadge label={statusLabel} colorClass={statusColor} size="md" />
          <p className={`text-3xl font-bold mt-3 ${bill.status === 'paid' ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-text-heading'}`}>
            {formatCurrency(Number(bill.amount))}
          </p>
          <p className="text-sm text-text-muted mt-1">Tagihan Bulanan - Periode {bill.billing_period}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3">
          <h3 className="text-sm font-bold text-text-heading">Detail</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-1.5"><Calendar size={14} /> Jatuh Tempo</span>
              <span className="font-medium">{formatDateShort(dueDateStr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-1.5"><FileText size={14} /> Periode</span>
              <span className="font-medium">{formatDateShort(billingPeriodStart)} - {formatDateShort(billingPeriodEnd)}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {bill.status === 'paid' && bill.paid_at && (
          <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
            <h3 className="text-sm font-bold text-text-heading mb-3">Riwayat Pembayaran</h3>
            <div className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl">
              <CheckCircle size={18} className="text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-heading">{formatCurrency(Number(bill.amount))}</p>
                <p className="text-xs text-text-muted">
                  {bill.payment_method === 'e_wallet' ? 'E-Wallet' : bill.payment_method === 'bank_transfer' ? 'Transfer Bank' : bill.payment_method || 'Metode Lain'} · {formatDateShort(bill.paid_at)}
                </p>
              </div>
              <StatusBadge label="Berhasil" colorClass="bg-green-100 text-green-800" />
            </div>
          </div>
        )}

        {/* Pay Button */}
        {bill.status !== 'paid' && (
          <ActionButton 
            fullWidth 
            variant="gold" 
            icon={<CreditCard size={18} />} 
            onClick={handlePay}
            loading={paying}
          >
            Bayar Sekarang
          </ActionButton>
        )}
      </div>
    </>
  );
}
