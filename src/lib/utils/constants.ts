// ============================================================
// SIMA-NET Constants & Status Maps
// ============================================================

import type {
  InstallationStatus,
  TicketPriority,
  TicketStatus,
  InvoiceStatus,
  PaymentStatus,
  TechAvailability,
  CustomerStatus,
  NotificationType,
} from '@/lib/types/database';

// ---- Status Label Maps (Indonesian) ----

export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, string> = {
  pending: 'Menunggu',
  in_progress: 'Dalam Proses',
  success: 'Berhasil',
  failed: 'Gagal',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: 'Diajukan',
  processing: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'Belum Lunas',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Menunggu',
  success: 'Berhasil',
  failed: 'Gagal',
};

export const TECH_AVAILABILITY_LABELS: Record<TechAvailability, string> = {
  available: 'Tersedia',
  busy: 'Sibuk',
  off: 'Libur',
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  pending: 'Menunggu',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Informasi',
  warning: 'Peringatan',
  payment: 'Pembayaran',
  ticket: 'Tiket',
  installation: 'Pemasangan',
};

// ---- Status Color Maps (Tailwind classes) ----

export const INSTALLATION_STATUS_COLORS: Record<InstallationStatus, string> = {
  pending: 'bg-gold-100 text-gold-700',
  in_progress: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  submitted: 'bg-gold-100 text-gold-700',
  processing: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-gold-100 text-gold-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  unpaid: 'bg-gold-100 text-gold-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gold-100 text-gold-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export const TECH_AVAILABILITY_COLORS: Record<TechAvailability, string> = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-red-100 text-red-700',
  off: 'bg-gray-100 text-gray-600',
};

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-gold-100 text-gold-700',
};
