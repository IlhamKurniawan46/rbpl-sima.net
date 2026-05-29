'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChips from '@/components/ui/FilterChips';
import ActionButton from '@/components/ui/ActionButton';
import { createClient } from '@/lib/supabase/client';
import { formatDateShort, getInitials } from '@/lib/utils/formatters';
import { Wifi, Wrench, X, Calendar, User2, Zap, MapPin, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CustomerRow {
  id: string;
  status: string;
  installation_address: string;
  installation_area: string | null;
  managed_by: string | null;
  created_at: string;
  profile: { full_name: string; phone: string | null } | null;
  isp: { name: string; speed_limit: string } | null;
  ticket: { technician_id: string | null; scheduled_date: string | null; status: string | null } | null;
}

interface Technician {
  id: string;
  full_name: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'active', label: 'Aktif' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  active: 'Aktif',
  inactive: 'Nonaktif',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-600 border-gray-200',
};

// ─── Assignment Modal ─────────────────────────────────────────────────────────

interface AssignModalProps {
  customer: CustomerRow;
  technicians: Technician[];
  onClose: () => void;
  onSaved: (customerId: string, techId: string, date: string) => void;
}

function AssignModal({ customer, technicians, onClose, onSaved }: AssignModalProps) {
  const { showToast } = useToast();
  const [techId, setTechId] = useState(customer.ticket?.technician_id || '');
  const [date, setDate] = useState(
    customer.ticket?.scheduled_date ? customer.ticket.scheduled_date.slice(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techId || !date) return;
    setSaving(true);
    try {
      const supabase = createClient();

      // 1. Update managed_by on customers row
      const { error: custErr } = await supabase
        .from('customers')
        .update({ managed_by: techId })
        .eq('id', customer.id);
      if (custErr) throw custErr;

      // 2. Upsert into installations_and_tickets table using standard Supabase client
      const { error: tickErr } = await supabase
        .from('installations_and_tickets')
        .upsert(
          {
            customer_id: customer.id,
            type: 'new_installation',
            technician_id: techId,
            scheduled_date: date,
            status: 'in_progress',
          },
          { onConflict: 'customer_id,type' }
        );
      if (tickErr) throw tickErr;

      showToast('Teknisi berhasil ditugaskan!', 'success');
      onSaved(customer.id, techId, date);
      onClose();
    } catch (err: any) {
      console.error('Assign error:', err.message);
      showToast('Gagal menyimpan penugasan: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedTech = technicians.find((t) => t.id === techId);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 space-y-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-heading">Tugaskan Teknisi</h3>
            <p className="text-xs text-text-muted mt-0.5">{customer.profile?.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Customer info */}
        <div className="bg-maroon-50 rounded-2xl p-3.5 space-y-1.5 text-xs text-maroon-700">
          <div className="flex items-center gap-2">
            <Wifi size={13} />
            <span className="font-semibold">{customer.isp?.name}</span>
            <span className="opacity-60">·</span>
            <Zap size={11} />
            <span>{customer.isp?.speed_limit}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={13} className="mt-0.5 flex-shrink-0" />
            <span>{customer.installation_area ? `${customer.installation_area} · ` : ''}{customer.installation_address}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pb-28">
          {/* Technician select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-heading flex items-center gap-1.5">
              <User2 size={13} /> Pilih Teknisi
            </label>
            <select
              required
              value={techId}
              onChange={(e) => setTechId(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-surface-alt px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-maroon-300 focus:border-maroon-400"
            >
              <option value="">-- Pilih teknisi --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-heading flex items-center gap-1.5">
              <Calendar size={13} /> Jadwal Pemasangan
            </label>
            <input
              required
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-surface-alt px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-maroon-300 focus:border-maroon-400"
            />
          </div>

          <ActionButton type="submit" fullWidth loading={saving}>
            Simpan Penugasan
          </ActionButton>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminInstallationsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const [custRes, techRes] = await Promise.all([
        supabase
          .from('customers')
          .select(`
            id,
            status,
            installation_address,
            installation_area,
            managed_by,
            created_at,
            profile:profiles!customers_profile_id_fkey(full_name, phone),
            isp:isps(name, speed_limit),
            ticket:installations_and_tickets(technician_id, scheduled_date, status)
          `)
          .in('status', ['pending', 'active'])
          .order('created_at', { ascending: true }),
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'technician')
          .order('full_name'),
      ]);

      if (custRes.error) throw custRes.error;
      if (techRes.error) throw techRes.error;

      // ticket is a one-to-many; grab the first row if any
      const rows = (custRes.data as any[]).map((c) => ({
        ...c,
        ticket: Array.isArray(c.ticket) ? (c.ticket[0] ?? null) : c.ticket,
      }));

      setCustomers(rows);
      setTechnicians((techRes.data as Technician[]) || []);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      showToast('Gagal memuat data pemasangan', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered =
    filter === 'all' ? customers : customers.filter((c) => c.status === filter);

  // Optimistic update after assignment saved
  const handleSaved = (customerId: string, techId: string, date: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
            ...c,
            managed_by: techId,
            ticket: { technician_id: techId, scheduled_date: date, status: 'in_progress' },
          }
          : c
      )
    );
  };

  const getTechName = (techId: string | null) => {
    if (!techId) return null;
    return technicians.find((t) => t.id === techId)?.full_name || null;
  };

  return (
    <>
      <TopBar title="Pemasangan" showBack backHref="/admin/more" />
      <div className="p-4 space-y-4 pb-28">
        <FilterChips options={FILTERS} selected={filter} onChange={setFilter} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat data pemasangan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border-light text-center">
            <Wrench size={28} className="text-text-muted mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-heading">Tidak ada data pemasangan</p>
            <p className="text-xs text-text-muted mt-1">
              {filter === 'pending' ? 'Belum ada pelanggan baru yang menunggu.' : 'Ubah filter untuk melihat data lain.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filtered.map((c) => {
              const assignedTech = getTechName(c.ticket?.technician_id || null);
              const scheduledDate = c.ticket?.scheduled_date;
              const isAssigned = !!assignedTech;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light space-y-3"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-maroon-100 text-maroon-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(c.profile?.full_name || '')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-heading">{c.profile?.full_name || '—'}</p>
                        <p className="text-xs text-text-muted">{c.profile?.phone || '—'}</p>
                      </div>
                    </div>
                    <StatusBadge
                      label={c.status === 'active' || c.ticket?.status === 'completed' || c.ticket?.status === 'success' || c.ticket?.status === 'done' ? 'Selesai' : 'Menunggu Pemasangan'}
                      colorClass={c.status === 'active' || c.ticket?.status === 'completed' || c.ticket?.status === 'success' || c.ticket?.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gold-50 text-gold-700 border-gold-200'}
                    />
                  </div>

                  {/* Package & address */}
                  <div className="space-y-1 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Wifi size={12} className="text-maroon-400" />
                      <span className="font-semibold text-text-primary">{c.isp?.name}</span>
                      <span>·</span>
                      <Zap size={11} className="text-gold-500" />
                      <span>{c.isp?.speed_limit}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                      <span>{c.installation_area ? `${c.installation_area} · ` : ''}{c.installation_address}</span>
                    </div>
                    <p className="text-[10px]">Masuk: {formatDateShort(c.created_at)}</p>
                  </div>

                  {/* Assignment info */}
                  {isAssigned ? (
                    <div className="pt-2 border-t border-border-light">
                      <div className="flex items-center justify-between">
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <User2 size={11} />
                            <span className="font-semibold text-text-primary">{assignedTech}</span>
                          </div>
                          {scheduledDate && (
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <Calendar size={11} />
                              <span>{formatDateShort(scheduledDate)}</span>
                            </div>
                          )}
                        </div>
                        {c.status === 'pending' && (
                          <button
                            onClick={() => setSelected(c)}
                            className="text-xs text-maroon-600 font-semibold flex items-center gap-0.5 hover:underline"
                          >
                            Ubah <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : c.status === 'pending' ? (
                    <div className="pt-2 border-t border-border-light">
                      <button
                        onClick={() => setSelected(c)}
                        className="w-full py-2 rounded-xl border-2 border-dashed border-maroon-200 text-maroon-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-maroon-50 transition-colors active:scale-[0.98]"
                      >
                        <User2 size={14} />
                        Tugaskan Teknisi
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        {/* Spacer: pushes last card above fixed bottom nav */}
        <div className="h-32 w-full block" aria-hidden="true" />
      </div>

      {/* Assignment Modal */}
      {selected && (
        <AssignModal
          customer={selected}
          technicians={technicians}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
