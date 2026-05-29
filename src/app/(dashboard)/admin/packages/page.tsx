'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wifi, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ISPPackage {
  id: string;
  name: string;
  speed_limit: string;
  price: number;
  description: string | null;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<ISPPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchPackages();
  }, []);

  return (
    <>
      <TopBar title="Paket Internet" showBack backHref="/admin/more" />
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
    </>
  );
}
