'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, Eye, EyeOff } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ nama: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    showToast('Registrasi berhasil! Silakan masuk.', 'success');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-16 h-16 bg-maroon-600 rounded-2xl flex items-center justify-center shadow-md mb-4">
          <Wifi size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-heading">Daftar Akun</h1>
        <p className="text-sm text-text-muted mt-1">Buat akun pelanggan baru</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-3.5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Nama Lengkap</label>
          <input type="text" value={form.nama} onChange={(e) => update('nama', e.target.value)} placeholder="Masukkan nama lengkap" required
            className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nama@email.com" required
            className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">No. Telepon</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="081234567890" required
            className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimal 6 karakter" required
              className="w-full h-11 px-3.5 pr-11 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Konfirmasi Password</label>
          <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Ulangi password" required
            className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors" />
        </div>

        <div className="pt-2">
          <ActionButton type="submit" fullWidth loading={loading}>Daftar</ActionButton>
        </div>
      </form>

      <div className="px-6 pb-8 pt-4 text-center">
        <p className="text-sm text-text-muted">
          Sudah punya akun?{' '}
          <button onClick={() => router.push('/login')} className="text-maroon-600 font-semibold hover:underline">Masuk</button>
        </p>
      </div>
    </div>
  );
}
