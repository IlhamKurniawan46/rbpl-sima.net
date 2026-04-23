'use client';

import { use } from 'react';
import TopBar from '@/components/layout/TopBar';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionButton from '@/components/ui/ActionButton';
import { mockInvoices, mockPayments } from '@/lib/mock-data';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/utils/constants';
import { formatCurrency, formatDate, formatDateShort } from '@/lib/utils/formatters';
import { Calendar, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();
  const invoice = mockInvoices.find((i) => i.id === id);
  if (!invoice) return <div className="p-6 text-center text-text-muted">Tagihan tidak ditemukan</div>;

  const payments = mockPayments.filter((p) => p.invoice_id === invoice.id);

  const handlePay = () => {
    showToast('Pembayaran berhasil diproses! (Mock)', 'success');
  };

  return (
    <>
      <TopBar title="Detail Tagihan" showBack backHref="/customer/invoices" />
      <div className="p-4 space-y-4">
        {/* Invoice Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center">
          <StatusBadge label={INVOICE_STATUS_LABELS[invoice.status]} colorClass={INVOICE_STATUS_COLORS[invoice.status]} size="md" />
          <p className={`text-3xl font-bold mt-3 ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-text-heading'}`}>
            {formatCurrency(invoice.amount)}
          </p>
          <p className="text-sm text-text-muted mt-1">{invoice.description}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3">
          <h3 className="text-sm font-bold text-text-heading">Detail</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted flex items-center gap-1.5"><Calendar size={14} /> Jatuh Tempo</span><span className="font-medium">{formatDateShort(invoice.due_date)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted flex items-center gap-1.5"><FileText size={14} /> Periode</span><span className="font-medium">{formatDateShort(invoice.billing_period_start)} - {formatDateShort(invoice.billing_period_end)}</span></div>
          </div>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
            <h3 className="text-sm font-bold text-text-heading mb-3">Riwayat Pembayaran</h3>
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl">
                <CheckCircle size={18} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-heading">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-text-muted">{p.method === 'e_wallet' ? 'E-Wallet' : p.method === 'bank_transfer' ? 'Transfer Bank' : 'Tunai'} · {formatDateShort(p.paid_at)}</p>
                </div>
                <StatusBadge label={PAYMENT_STATUS_LABELS[p.status]} colorClass={PAYMENT_STATUS_COLORS[p.status]} />
              </div>
            ))}
          </div>
        )}

        {/* Pay Button */}
        {invoice.status !== 'paid' && (
          <ActionButton fullWidth variant="gold" icon={<CreditCard size={18} />} onClick={handlePay}>
            Bayar Sekarang
          </ActionButton>
        )}
      </div>
    </>
  );
}
