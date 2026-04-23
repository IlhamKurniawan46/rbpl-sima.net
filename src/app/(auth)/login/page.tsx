'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { Wifi, Eye, EyeOff } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('sima-user') || '{}');
      router.replace(getDashboardPath(user.role));
    } else {
      setError(result.error || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <div className="w-16 h-16 bg-maroon-600 rounded-2xl flex items-center justify-center shadow-md mb-4">
          <Wifi size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-heading">Masuk</h1>
        <p className="text-sm text-text-muted mt-1">Masuk ke akun SIMA.NET Anda</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full h-11 px-3.5 pr-11 text-sm bg-white border border-border rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <ActionButton type="submit" fullWidth loading={isLoading}>
            Masuk
          </ActionButton>
        </div>
      </form>

      {/* Footer */}
      <div className="px-6 pb-8 pt-6 text-center">
        <p className="text-sm text-text-muted">
          Belum punya akun?{' '}
          <button onClick={() => router.push('/register')} className="text-maroon-600 font-semibold hover:underline">
            Daftar
          </button>
        </p>
        <button onClick={() => router.push('/')} className="text-xs text-text-muted mt-3 hover:text-maroon-600">
          ← Kembali ke beranda
        </button>
      </div>
    </div>
  );
}
