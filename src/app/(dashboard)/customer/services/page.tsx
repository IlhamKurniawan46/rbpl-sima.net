'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import EmptyState from '@/components/ui/EmptyState';
import ActionButton from '@/components/ui/ActionButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Wifi, Zap, MapPin, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/Toast';

interface ISPPackage {
  id: string;
  name: string;
  speed_limit: string;
  price: number;
  description: string | null;
}

interface CustomerRecord {
  id: string;
  status: 'active' | 'inactive' | 'pending';
  installation_address: string;
  installation_area: string | null;
  created_at: string;
  isp: ISPPackage;
}

export default function CustomerServicesPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [customerRecord, setCustomerRecord] = useState<CustomerRecord | null>(null);
  const [packages, setPackages] = useState<ISPPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Order Flow States
  const [step, setStep] = useState<'list' | 'select_package' | 'address_form' | 'payment_gate'>('list');
  const [selectedPkg, setSelectedPkg] = useState<ISPPackage | null>(null);
  const [address, setAddress] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const fetchCustomerAndPackages = async () => {
    if (!profile) return;
    try {
      // 1. Fetch existing customer record
      const { data: customerData, error: customerErr } = await supabase
        .from('customers')
        .select(`
          id,
          status,
          installation_address,
          installation_area,
          created_at,
          isp:isps(id, name, speed_limit, price, description)
        `)
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (customerErr) throw customerErr;
      setCustomerRecord(customerData as any);

      // 2. Fetch active packages if customer doesn't have an order
      if (!customerData) {
        const { data: pkgsData, error: pkgsErr } = await supabase
          .from('isps')
          .select('id, name, speed_limit, price, description')
          .order('price', { ascending: true });

        if (pkgsErr) throw pkgsErr;
        setPackages(pkgsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAndPackages();
  }, [profile]);

  const handleOrderSubmit = async () => {
    if (!selectedPkg || !profile) return;
    setSubmitting(true);

    try {
      const { error: insertErr } = await supabase
        .from('customers')
        .insert({
          profile_id: profile.id,
          isp_id: selectedPkg.id,
          installation_address: address,
          installation_area: kelurahan,
          status: 'pending' // maps to 'menunggu' in business logic ('pending' is schema's customer_status enum value)
        });

      if (insertErr) throw insertErr;

      showToast('Pemesanan & pembayaran berhasil diterima!', 'success');
      setStep('list');
      setLoading(true);
      await fetchCustomerAndPackages();
    } catch (err: any) {
      console.error('Insert error:', err.message);
      showToast(err.message || 'Gagal menyimpan pemesanan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Layanan Saya" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-muted gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-600 animate-spin" />
          <p className="text-xs">Memuat data layanan...</p>
        </div>
      </>
    );
  }

  // --- Step 1: Services List / Empty Order State ---
  if (step === 'list') {
    return (
      <>
        <TopBar title="Layanan Saya" />
        <div className="p-4 space-y-4">
          {customerRecord ? (
            <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center">
                    <Wifi size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-heading">{customerRecord.isp?.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Zap size={12} className="text-gold-500" />
                      <span className="text-xs text-text-muted">{customerRecord.isp?.speed_limit}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge 
                  label={
                    customerRecord.status === 'active' 
                      ? 'Aktif' 
                      : customerRecord.status === 'pending' 
                      ? 'Menunggu Pemasangan' 
                      : 'Nonaktif'
                  } 
                  colorClass={
                    customerRecord.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : customerRecord.status === 'pending'
                      ? 'bg-gold-50 text-gold-700 border-gold-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                />
              </div>

              <div className="pt-3 border-t border-border-light space-y-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <MapPin size={13} />
                  <span>{customerRecord.installation_area ? `${customerRecord.installation_area} · ` : ''}{customerRecord.installation_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} />
                  <span>Daftar sejak: {formatDate(customerRecord.created_at)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/20 flex justify-between items-center text-sm font-semibold">
                <span className="text-text-muted">Tagihan Bulanan</span>
                <span className="text-maroon-600 font-bold">{formatCurrency(customerRecord.isp?.price || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <EmptyState 
                icon={Wifi} 
                title="Belum Berlangganan" 
                message="Dapatkan koneksi internet terbaik untuk rumah Anda sekarang." 
              />
              <div className="max-w-[240px] mx-auto pt-2">
                <ActionButton fullWidth onClick={() => setStep('select_package')}>
                  Daftar Layanan Baru
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // --- Step 2: Package Selection ---
  if (step === 'select_package') {
    return (
      <>
        <TopBar title="Pilih Paket" showBack rightAction={<button onClick={() => setStep('list')} className="text-xs text-white">Batal</button>} />
        <div className="p-4 space-y-3">
          <p className="text-xs text-text-muted font-medium px-1">Silakan pilih paket internet yang Anda inginkan:</p>
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              onClick={() => { setSelectedPkg(pkg); setStep('address_form'); }}
              className="bg-white rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border-light hover:border-maroon-200 cursor-pointer transition-colors space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center">
                    <Wifi size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-heading">{pkg.name}</h4>
                    <p className="text-[10px] text-text-muted">{pkg.description || 'Tidak ada deskripsi keunggulan'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-maroon-600">{formatCurrency(pkg.price)}</p>
                  <p className="text-[9px] text-text-muted">/bulan</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-border-light">
                <span className="text-text-muted">Bandwidth Kecepatan</span>
                <span className="font-bold text-text-heading flex items-center gap-1"><Zap size={12} className="text-gold-500" /> {pkg.speed_limit}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // --- Step 3: Address & Deployment Form ---
  if (step === 'address_form') {
    return (
      <>
        <TopBar title="Alamat Pengiriman" showBack rightAction={<button onClick={() => setStep('select_package')} className="text-xs text-white">Kembali</button>} />
        <div className="p-4 max-w-md mx-auto space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light space-y-4">
            <h3 className="text-sm font-bold text-text-heading border-b border-border-light pb-2">Informasi Lokasi Pemasangan</h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Alamat Lengkap</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan nomor rumah, jalan, RT/RW lengkap"
                  required
                  rows={3}
                  className="w-full p-3 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">Kelurahan / Area</label>
                <input
                  type="text"
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  placeholder="Contoh: Lowokwaru"
                  required
                  className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
                />
              </div>

              <div className="pt-2">
                <ActionButton 
                  fullWidth 
                  disabled={!address || !kelurahan} 
                  onClick={() => setStep('payment_gate')}
                >
                  Lanjut ke Pembayaran
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Step 4: QR Mock Payment screen ---
  if (step === 'payment_gate') {
    return (
      <>
        <TopBar title="Pembayaran Layanan" showBack rightAction={<button onClick={() => setStep('address_form')} className="text-xs text-white">Kembali</button>} />
        <div className="p-4 max-w-md mx-auto space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light text-center space-y-4">
            <h3 className="text-sm font-bold text-text-heading">Selesaikan Pembayaran Pemasangan</h3>
            
            <div className="p-3 bg-maroon-50 text-maroon-700 rounded-xl text-left text-xs space-y-1">
              <p className="font-semibold text-[13px]">Rincian Pemesanan:</p>
              <div className="flex justify-between"><span>Paket:</span> <span className="font-bold">{selectedPkg?.name} ({selectedPkg?.speed_limit})</span></div>
              <div className="flex justify-between"><span>Biaya Pasang + Bulan Pertama:</span> <span className="font-bold">{formatCurrency(selectedPkg?.price || 0)}</span></div>
            </div>

            {/* QR Mock code */}
            <div className="border border-border-light p-4 rounded-2xl max-w-[200px] mx-auto bg-surface-alt flex flex-col items-center justify-center gap-2">
              <div className="w-36 h-36 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-xs text-text-muted">
                {/* QR Code Nyata Menggunakan API Generator */}
                <div className="border border-border-light p-4 rounded-2xl max-w-[200px] mx-auto bg-white flex flex-col items-center justify-center gap-2">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SIMANET_${selectedPkg?.name || 'PACKAGE'}_${profile?.id || 'USER'}`}
                    alt="QRIS Simanet"
                    className="w-36 h-36 mx-auto object-contain bg-white p-1 rounded-lg border border-border-light shadow-sm"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-[10px] text-text-muted font-semibold tracking-wider">QRIS SIMA.NET INTERNET</p>
            </div>

            <p className="text-xs text-text-muted">Silakan pindai kode QR di atas untuk menyelesaikan transfer biaya aktivasi internet.</p>

            <div className="pt-2">
              <ActionButton 
                fullWidth 
                loading={submitting} 
                onClick={handleOrderSubmit}
                icon={<CheckCircle size={16} />}
              >
                Pembayaran Selesai
              </ActionButton>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
