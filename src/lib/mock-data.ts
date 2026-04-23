// ============================================================
// SIMA-NET Mock Data — Realistic Indonesian ISP Data
// Used for UI development before Supabase is connected
// ============================================================

import type {
  User, Customer, Technician, ISPPackage,
  Installation, Ticket, Invoice, Payment, Notification,
} from '@/lib/types/database';

// ---- Users ----
export const mockUsers: User[] = [
  {
    id: 'u-admin-01',
    email: 'admin@simanet.id',
    full_name: 'Ahmad Fauzi',
    role: 'admin',
    phone: '081234567890',
    avatar_url: null,
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'u-tech-01',
    email: 'budi.tech@simanet.id',
    full_name: 'Budi Santoso',
    role: 'technician',
    phone: '081345678901',
    avatar_url: null,
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 'u-tech-02',
    email: 'dedi.tech@simanet.id',
    full_name: 'Dedi Kurniawan',
    role: 'technician',
    phone: '081456789012',
    avatar_url: null,
    created_at: '2025-02-15T08:00:00Z',
  },
  {
    id: 'u-cust-01',
    email: 'siti.rahayu@gmail.com',
    full_name: 'Siti Rahayu',
    role: 'customer',
    phone: '081567890123',
    avatar_url: null,
    created_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'u-cust-02',
    email: 'agus.wijaya@gmail.com',
    full_name: 'Agus Wijaya',
    role: 'customer',
    phone: '081678901234',
    avatar_url: null,
    created_at: '2025-03-10T08:00:00Z',
  },
  {
    id: 'u-cust-03',
    email: 'rina.marlina@gmail.com',
    full_name: 'Rina Marlina',
    role: 'customer',
    phone: '081789012345',
    avatar_url: null,
    created_at: '2025-04-01T08:00:00Z',
  },
  {
    id: 'u-cust-04',
    email: 'joko.susilo@gmail.com',
    full_name: 'Joko Susilo',
    role: 'customer',
    phone: '081890123456',
    avatar_url: null,
    created_at: '2025-04-15T08:00:00Z',
  },
  {
    id: 'u-cust-05',
    email: 'dewi.lestari@gmail.com',
    full_name: 'Dewi Lestari',
    role: 'customer',
    phone: '081901234567',
    avatar_url: null,
    created_at: '2025-05-01T08:00:00Z',
  },
];

// ---- Customers ----
export const mockCustomers: Customer[] = [
  {
    id: 'c-01',
    user_id: 'u-cust-01',
    address: 'Jl. Merdeka No. 45, Bandung',
    nik: '3204012345678901',
    area_code: 'BDG-01',
    status: 'active',
    registered_at: '2025-03-01T08:00:00Z',
    user: mockUsers[3],
  },
  {
    id: 'c-02',
    user_id: 'u-cust-02',
    address: 'Jl. Sudirman No. 12, Jakarta Selatan',
    nik: '3174012345678902',
    area_code: 'JKT-02',
    status: 'active',
    registered_at: '2025-03-10T08:00:00Z',
    user: mockUsers[4],
  },
  {
    id: 'c-03',
    user_id: 'u-cust-03',
    address: 'Jl. Diponegoro No. 78, Surabaya',
    nik: '3578012345678903',
    area_code: 'SBY-01',
    status: 'active',
    registered_at: '2025-04-01T08:00:00Z',
    user: mockUsers[5],
  },
  {
    id: 'c-04',
    user_id: 'u-cust-04',
    address: 'Jl. Gatot Subroto No. 33, Semarang',
    nik: '3374012345678904',
    area_code: 'SMG-01',
    status: 'pending',
    registered_at: '2025-04-15T08:00:00Z',
    user: mockUsers[6],
  },
  {
    id: 'c-05',
    user_id: 'u-cust-05',
    address: 'Jl. Ahmad Yani No. 56, Yogyakarta',
    nik: '3471012345678905',
    area_code: 'YOG-01',
    status: 'inactive',
    registered_at: '2025-05-01T08:00:00Z',
    user: mockUsers[7],
  },
];

// ---- Technicians ----
export const mockTechnicians: Technician[] = [
  {
    id: 't-01',
    user_id: 'u-tech-01',
    specialization: 'Fiber Optic Installation',
    assigned_area: 'BDG-01, JKT-02',
    availability: 'available',
    joined_at: '2025-02-01T08:00:00Z',
    user: mockUsers[1],
  },
  {
    id: 't-02',
    user_id: 'u-tech-02',
    specialization: 'Network Troubleshooting',
    assigned_area: 'SBY-01, SMG-01',
    availability: 'busy',
    joined_at: '2025-02-15T08:00:00Z',
    user: mockUsers[2],
  },
];

// ---- ISP Packages ----
export const mockPackages: ISPPackage[] = [
  {
    id: 'pkg-01',
    name: 'Sima Basic',
    description: 'Paket internet dasar untuk kebutuhan browsing dan media sosial',
    speed_mbps: 10,
    price_monthly: 150000,
    status: 'active',
    created_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 'pkg-02',
    name: 'Sima Plus',
    description: 'Paket internet menengah untuk streaming dan gaming ringan',
    speed_mbps: 30,
    price_monthly: 275000,
    status: 'active',
    created_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 'pkg-03',
    name: 'Sima Pro',
    description: 'Paket internet premium untuk kebutuhan profesional dan gaming',
    speed_mbps: 50,
    price_monthly: 450000,
    status: 'active',
    created_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 'pkg-04',
    name: 'Sima Ultra',
    description: 'Paket internet terbaik dengan kecepatan maksimal',
    speed_mbps: 100,
    price_monthly: 750000,
    status: 'active',
    created_at: '2025-01-01T08:00:00Z',
  },
];

// ---- Installations ----
export const mockInstallations: Installation[] = [
  {
    id: 'ins-01',
    customer_id: 'c-01',
    technician_id: 't-01',
    package_id: 'pkg-02',
    address: 'Jl. Merdeka No. 45, Bandung',
    area_code: 'BDG-01',
    status: 'success',
    notes: 'Pemasangan selesai, koneksi stabil',
    scheduled_date: '2025-03-05T09:00:00Z',
    completed_date: '2025-03-05T14:00:00Z',
    created_at: '2025-03-02T08:00:00Z',
    customer: mockCustomers[0],
    technician: mockTechnicians[0],
    package: mockPackages[1],
  },
  {
    id: 'ins-02',
    customer_id: 'c-02',
    technician_id: 't-01',
    package_id: 'pkg-03',
    address: 'Jl. Sudirman No. 12, Jakarta Selatan',
    area_code: 'JKT-02',
    status: 'success',
    notes: null,
    scheduled_date: '2025-03-12T09:00:00Z',
    completed_date: '2025-03-12T16:00:00Z',
    created_at: '2025-03-10T08:00:00Z',
    customer: mockCustomers[1],
    technician: mockTechnicians[0],
    package: mockPackages[2],
  },
  {
    id: 'ins-03',
    customer_id: 'c-03',
    technician_id: 't-02',
    package_id: 'pkg-01',
    address: 'Jl. Diponegoro No. 78, Surabaya',
    area_code: 'SBY-01',
    status: 'in_progress',
    notes: 'Menunggu pemasangan kabel di tiang',
    scheduled_date: '2026-04-25T09:00:00Z',
    completed_date: null,
    created_at: '2026-04-20T08:00:00Z',
    customer: mockCustomers[2],
    technician: mockTechnicians[1],
    package: mockPackages[0],
  },
  {
    id: 'ins-04',
    customer_id: 'c-04',
    technician_id: null,
    package_id: 'pkg-02',
    address: 'Jl. Gatot Subroto No. 33, Semarang',
    area_code: 'SMG-01',
    status: 'pending',
    notes: null,
    scheduled_date: null,
    completed_date: null,
    created_at: '2026-04-22T08:00:00Z',
    customer: mockCustomers[3],
    package: mockPackages[1],
  },
];

// ---- Tickets ----
export const mockTickets: Ticket[] = [
  {
    id: 'tkt-01',
    customer_id: 'c-01',
    technician_id: 't-01',
    subject: 'Internet putus-putus sejak kemarin',
    description: 'Koneksi internet sering terputus setiap 30 menit sejak kemarin sore. Sudah coba restart router tetapi tidak membantu.',
    priority: 'high',
    status: 'processing',
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T14:00:00Z',
    customer: mockCustomers[0],
    technician: mockTechnicians[0],
  },
  {
    id: 'tkt-02',
    customer_id: 'c-02',
    technician_id: null,
    subject: 'Kecepatan internet lambat',
    description: 'Kecepatan internet hanya 5 Mbps, padahal paket saya 50 Mbps. Sudah berlangsung 3 hari.',
    priority: 'medium',
    status: 'submitted',
    created_at: '2026-04-23T08:00:00Z',
    updated_at: '2026-04-23T08:00:00Z',
    customer: mockCustomers[1],
  },
  {
    id: 'tkt-03',
    customer_id: 'c-03',
    technician_id: 't-02',
    subject: 'Router mati total',
    description: 'Lampu router tidak menyala sama sekali sejak tadi pagi. Sudah cek kabel listrik dan semua terhubung dengan baik.',
    priority: 'critical',
    status: 'processing',
    created_at: '2026-04-23T06:00:00Z',
    updated_at: '2026-04-23T09:00:00Z',
    customer: mockCustomers[2],
    technician: mockTechnicians[1],
  },
  {
    id: 'tkt-04',
    customer_id: 'c-01',
    technician_id: 't-01',
    subject: 'Tidak bisa akses beberapa website',
    description: 'Beberapa website tidak bisa diakses, menampilkan error DNS.',
    priority: 'low',
    status: 'resolved',
    created_at: '2026-04-10T08:00:00Z',
    updated_at: '2026-04-11T16:00:00Z',
    customer: mockCustomers[0],
    technician: mockTechnicians[0],
  },
];

// ---- Invoices ----
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-01',
    customer_id: 'c-01',
    amount: 275000,
    description: 'Tagihan Sima Plus - April 2026',
    status: 'paid',
    due_date: '2026-04-15',
    billing_period_start: '2026-04-01',
    billing_period_end: '2026-04-30',
    created_at: '2026-04-01T00:00:00Z',
    customer: mockCustomers[0],
  },
  {
    id: 'inv-02',
    customer_id: 'c-02',
    amount: 450000,
    description: 'Tagihan Sima Pro - April 2026',
    status: 'unpaid',
    due_date: '2026-04-25',
    billing_period_start: '2026-04-01',
    billing_period_end: '2026-04-30',
    created_at: '2026-04-01T00:00:00Z',
    customer: mockCustomers[1],
  },
  {
    id: 'inv-03',
    customer_id: 'c-03',
    amount: 150000,
    description: 'Tagihan Sima Basic - April 2026',
    status: 'overdue',
    due_date: '2026-04-10',
    billing_period_start: '2026-04-01',
    billing_period_end: '2026-04-30',
    created_at: '2026-04-01T00:00:00Z',
    customer: mockCustomers[2],
  },
  {
    id: 'inv-04',
    customer_id: 'c-01',
    amount: 275000,
    description: 'Tagihan Sima Plus - Maret 2026',
    status: 'paid',
    due_date: '2026-03-15',
    billing_period_start: '2026-03-01',
    billing_period_end: '2026-03-31',
    created_at: '2026-03-01T00:00:00Z',
    customer: mockCustomers[0],
  },
  {
    id: 'inv-05',
    customer_id: 'c-02',
    amount: 450000,
    description: 'Tagihan Sima Pro - Maret 2026',
    status: 'paid',
    due_date: '2026-03-25',
    billing_period_start: '2026-03-01',
    billing_period_end: '2026-03-31',
    created_at: '2026-03-01T00:00:00Z',
    customer: mockCustomers[1],
  },
];

// ---- Payments ----
export const mockPayments: Payment[] = [
  {
    id: 'pay-01',
    invoice_id: 'inv-01',
    amount: 275000,
    method: 'e_wallet',
    status: 'success',
    reference_no: 'EW-2026041501234',
    paid_at: '2026-04-14T10:30:00Z',
    invoice: mockInvoices[0],
  },
  {
    id: 'pay-02',
    invoice_id: 'inv-04',
    amount: 275000,
    method: 'bank_transfer',
    status: 'success',
    reference_no: 'BT-2026031401234',
    paid_at: '2026-03-14T09:00:00Z',
    invoice: mockInvoices[3],
  },
  {
    id: 'pay-03',
    invoice_id: 'inv-05',
    amount: 450000,
    method: 'bank_transfer',
    status: 'success',
    reference_no: 'BT-2026032401234',
    paid_at: '2026-03-24T11:00:00Z',
    invoice: mockInvoices[4],
  },
];

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  {
    id: 'notif-01',
    user_id: 'u-cust-01',
    title: 'Pembayaran Berhasil',
    message: 'Pembayaran tagihan April 2026 sebesar Rp275.000 telah berhasil diproses.',
    type: 'payment',
    is_read: false,
    created_at: '2026-04-14T10:30:00Z',
  },
  {
    id: 'notif-02',
    user_id: 'u-cust-01',
    title: 'Tiket Sedang Diproses',
    message: 'Tiket #tkt-01 "Internet putus-putus" sedang ditangani oleh teknisi Budi Santoso.',
    type: 'ticket',
    is_read: false,
    created_at: '2026-04-22T14:00:00Z',
  },
  {
    id: 'notif-03',
    user_id: 'u-tech-01',
    title: 'Tugas Baru Diterima',
    message: 'Anda mendapat tugas baru: Perbaikan koneksi di Jl. Merdeka No. 45, Bandung.',
    type: 'ticket',
    is_read: false,
    created_at: '2026-04-22T14:00:00Z',
  },
  {
    id: 'notif-04',
    user_id: 'u-cust-02',
    title: 'Tagihan Jatuh Tempo',
    message: 'Tagihan April 2026 sebesar Rp450.000 akan jatuh tempo pada 25 April 2026.',
    type: 'payment',
    is_read: true,
    created_at: '2026-04-20T08:00:00Z',
  },
  {
    id: 'notif-05',
    user_id: 'u-admin-01',
    title: 'Pelanggan Baru Terdaftar',
    message: 'Pelanggan baru Joko Susilo telah mendaftar dan menunggu verifikasi.',
    type: 'info',
    is_read: false,
    created_at: '2026-04-22T08:00:00Z',
  },
  {
    id: 'notif-06',
    user_id: 'u-cust-03',
    title: 'Pemasangan Dalam Proses',
    message: 'Pemasangan di alamat Anda sedang dalam proses. Teknisi Dedi Kurniawan akan menyelesaikan hari ini.',
    type: 'installation',
    is_read: false,
    created_at: '2026-04-23T09:00:00Z',
  },
  {
    id: 'notif-07',
    user_id: 'u-admin-01',
    title: 'Tiket Kritis Baru',
    message: 'Tiket kritis baru: Router mati total dari pelanggan Rina Marlina di Surabaya.',
    type: 'warning',
    is_read: false,
    created_at: '2026-04-23T06:00:00Z',
  },
];

// ---- Helper: Get data for specific user ----

export function getCustomerByUserId(userId: string): Customer | undefined {
  return mockCustomers.find(c => c.user_id === userId);
}

export function getTechnicianByUserId(userId: string): Technician | undefined {
  return mockTechnicians.find(t => t.user_id === userId);
}

export function getNotificationsForUser(userId: string): Notification[] {
  return mockNotifications.filter(n => n.user_id === userId);
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter(n => n.user_id === userId && !n.is_read).length;
}

export function getInvoicesForCustomer(customerId: string): Invoice[] {
  return mockInvoices.filter(i => i.customer_id === customerId);
}

export function getTicketsForCustomer(customerId: string): Ticket[] {
  return mockTickets.filter(t => t.customer_id === customerId);
}

export function getInstallationsForCustomer(customerId: string): Installation[] {
  return mockInstallations.filter(i => i.customer_id === customerId);
}

export function getInstallationsForTechnician(technicianId: string): Installation[] {
  return mockInstallations.filter(i => i.technician_id === technicianId);
}

export function getTicketsForTechnician(technicianId: string): Ticket[] {
  return mockTickets.filter(t => t.technician_id === technicianId);
}

// ---- Demo credentials ----
export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@simanet.id', password: 'admin123' },
  technician: { email: 'budi.tech@simanet.id', password: 'tech123' },
  customer: { email: 'siti.rahayu@gmail.com', password: 'cust123' },
};
