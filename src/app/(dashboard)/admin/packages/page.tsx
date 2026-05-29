'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wifi, Zap, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ActionButton from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';

interface ISPPackage {
  id: string;
  name: string;
  speed_limit: string;
  price: number;
  description: string | null;
}

export default function AdminPackagesPage() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<ISPPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', speedLimit: '', price: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function fetchPackages() {
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('isps')
        .select('id, name, speed_limit, price, description')
        .order('price', { ascending: true });

      if (fetchError) throw fetchError;
      setPackages((data as ISPPackage[]) || []);
    } catch (err: any) {
      console.error('Error fetching ISP packages:', err);
      setError(err.message || 'Gagal memuat paket internet');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Harga bulanan tidak valid');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from('isps')
        .insert({
          name: form.name,
          speed_limit: form.speedLimit,
          price: priceNum,
          description: form.description || null
        });

      if (insertError) throw insertError;

      showToast('Paket internet berhasil ditambahkan!', 'success');
      setForm({ name: '', speedLimit: '', price: '', description: '' });
      setIsModalOpen(false);
      
      // Re-fetch packages list to show changes instantly
      setLoading(true);
      await fetchPackages();
    } catch (err: any) {
      console.error('Error creating package:', err);
      setFormError(err.message || 'Gagal menambahkan paket internet');
      showToast('Gagal menambahkan paket internet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar 
        title="Paket Internet" 
        showBack 
        backHref="/admin/more" 
        rightAction={
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tambah Paket"
          >
            <Plus size={22} />
          </button>
        }
      />
      
      <div className="p-4 space-y-3 stagger-children">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
            <p className="text-xs">Memuat paket internet...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <p className="text-xs text-red-500 mt-1">Gagal terhubung ke database. Silakan coba lagi nanti.</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border-light text-center">
            <p className="text-sm font-semibold text-text-heading">Belum ada paket internet</p>
            <p className="text-xs text-text-muted mt-1">Paket layanan internet Anda belum diatur di database.</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center">
                    <Wifi size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-heading">{pkg.name}</p>
                    <p className="text-xs text-text-muted">{pkg.description || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border-light">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Zap size={14} />
                  <span className="text-sm font-semibold text-text-heading">{pkg.speed_limit}</span>
                </div>
                <p className="text-lg font-bold text-maroon-600">
                  {formatCurrency(pkg.price)}
                  <span className="text-xs text-text-muted font-normal">/bln</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-border-light space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border-light pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-maroon-50 text-maroon-600 flex items-center justify-center">
                  <Wifi size={18} />
                </div>
                <h2 className="text-sm font-bold text-text-heading">Tambah Paket Baru</h2>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">{formError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Nama Paket</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Sima Super Cepat"
                  required
                  className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Kecepatan Bandwidth</label>
                <input
                  type="text"
                  value={form.speedLimit}
                  onChange={(e) => setForm(p => ({ ...p, speedLimit: e.target.value }))}
                  placeholder="Contoh: 50 Mbps"
                  required
                  className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Harga Bulanan (Rupiah)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Contoh: 350000"
                  required
                  className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Deskripsi / Keunggulan</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Tuliskan keunggulan paket internet..."
                  rows={3}
                  className="w-full p-3 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <ActionButton type="submit" fullWidth loading={submitting}>
                  Tambah Paket
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
