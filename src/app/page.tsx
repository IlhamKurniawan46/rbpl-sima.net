'use client';

import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { Wifi, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function SplashPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <div className="w-20 h-20 bg-maroon-600 rounded-3xl flex items-center justify-center shadow-lg mb-6 animate-fade-in">
          <Wifi size={36} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-text-heading tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          SIMA<span className="text-maroon-600">.NET</span>
        </h1>
        <p className="text-sm text-text-muted mt-2 text-center max-w-[280px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Sistem Manajemen Layanan Internet — Kelola layanan ISP Anda dengan mudah
        </p>

        {/* Features */}
        <div className="mt-10 w-full max-w-[320px] space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { emoji: '📡', text: 'Pendaftaran & pemasangan cepat' },
            { emoji: '💳', text: 'Pembayaran online yang mudah' },
            { emoji: '🎫', text: 'Laporan gangguan real-time' },
            { emoji: '🔔', text: 'Notifikasi instan' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-surface-alt rounded-xl">
              <span className="text-lg">{f.emoji}</span>
              <span className="text-sm text-text-primary">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-6 pb-10 space-y-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={() => router.push('/login')}
          className="w-full h-12 bg-maroon-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-maroon-700 transition-colors active:scale-[0.97] shadow-sm"
        >
          Masuk
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => router.push('/register')}
          className="w-full h-12 bg-white text-maroon-600 font-semibold rounded-xl flex items-center justify-center border-2 border-maroon-600 hover:bg-maroon-50 transition-colors active:scale-[0.97]"
        >
          Daftar Akun Baru
        </button>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-xl">
          <p className="text-[11px] text-gold-700 font-semibold text-center mb-1">🔑 Demo Login</p>
          <div className="text-[10px] text-gold-600 space-y-0.5 text-center">
            <p>Admin: admin@simanet.id / admin123</p>
            <p>Teknisi: budi.tech@simanet.id / tech123</p>
            <p>Pelanggan: siti.rahayu@gmail.com / cust123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
