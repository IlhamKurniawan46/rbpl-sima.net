'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import ActionButton from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateStaffPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', role: 'technician' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password minimal harus 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.fullName,
          phone: form.phone,
          role: form.role
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat akun staff');
      }

      showToast('Akun staff berhasil dibuat!', 'success');
      setForm({ fullName: '', phone: '', email: '', password: '', role: 'technician' });
      router.push('/admin/technicians');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      showToast(err.message || 'Gagal membuat akun staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Buat Akun Staff" showBack backHref="/admin/more" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border-light">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-maroon-50 text-maroon-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-heading">Tambah Akun Staff Baru</h2>
              <p className="text-[10px] text-text-muted">Buat akun untuk Admin atau Teknisi baru</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">Nama Lengkap</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Masukkan nama lengkap staff"
                required
                className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">Nomor Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="Nomor telepon"
                required
                className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">Email Staff</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="staff@simanet.id"
                required
                className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">Password Akun</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">Peran (Role)</label>
              <select
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                className="w-full h-11 px-3 bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors text-sm"
              >
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-2">
              <ActionButton type="submit" fullWidth loading={loading}>
                Simpan Akun Staff
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
