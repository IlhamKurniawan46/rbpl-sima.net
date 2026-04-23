'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import FormField from '@/components/ui/FormField';
import ActionButton from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';

export default function NewTicketPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    showToast('Laporan berhasil dikirim!', 'success');
    router.push('/customer/tickets');
  };

  return (
    <>
      <TopBar title="Laporan Baru" showBack backHref="/customer/tickets" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <FormField
          label="Judul Laporan"
          placeholder="Contoh: Internet putus-putus"
          value={form.subject}
          onChange={(e) => update('subject', (e.target as HTMLInputElement).value)}
          required
        />
        <FormField
          label="Deskripsi Masalah"
          as="textarea"
          placeholder="Jelaskan masalah yang Anda alami secara detail..."
          value={form.description}
          onChange={(e) => update('description', (e.target as HTMLTextAreaElement).value)}
          required
        />
        <FormField
          label="Prioritas"
          as="select"
          value={form.priority}
          onChange={(e) => update('priority', (e.target as HTMLSelectElement).value)}
          options={[
            { value: 'low', label: 'Rendah' },
            { value: 'medium', label: 'Sedang' },
            { value: 'high', label: 'Tinggi' },
            { value: 'critical', label: 'Kritis — Layanan mati total' },
          ]}
        />
        <div className="pt-2">
          <ActionButton type="submit" fullWidth loading={loading}>
            Kirim Laporan
          </ActionButton>
        </div>
      </form>
    </>
  );
}
