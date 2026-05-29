'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import FormField from '@/components/ui/FormField';
import ActionButton from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function NewTicketPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      showToast('Anda harus masuk terlebih dahulu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // A. Get the proper customer UUID
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (custErr || !custData) {
        throw new Error(custErr?.message || 'Data pelanggan tidak ditemukan.');
      }

      // B. Insert the new row into installations_and_tickets
      const insertPayload: any = {
        customer_id: custData.id,
        type: 'complaint', // CRITICAL: Must match database enum ('complaint')
        status: 'submitted', // CRITICAL: Must match database default/enum for ticket_status
        description: form.description,
      };

      // If the database happens to have a title/subject column, we include it, 
      // but we safely add it to prevent schema errors if not supported.
      if (form.subject) {
        insertPayload.title = form.subject;
      }

      const { error } = await supabase
        .from('installations_and_tickets')
        .insert(insertPayload);

      if (error) {
        console.error("Supabase Insert Error:", error.message);
        showToast("Gagal mengirim laporan ke database: " + error.message, "error");
        return;
      }

      // ONLY trigger toast and redirect on success
      showToast('Laporan berhasil dikirim!', 'success');
      router.push('/customer/tickets');
    } catch (err: any) {
      console.error('Error submitting ticket:', err.message);
      showToast('Gagal mengirim laporan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Laporan Baru" showBack backHref="/customer/tickets" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4 animate-fade-in">
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
