// ============================================================
// SIMA-NET Database Types
// Mirrors the Supabase/PostgreSQL schema
// ============================================================

export type UserRole = 'admin' | 'technician' | 'customer';

export type CustomerStatus = 'active' | 'inactive' | 'pending';

export type TechAvailability = 'available' | 'busy' | 'off';

export type InstallationStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'done';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'submitted' | 'in_progress' | 'success' | 'failed' | 'done';

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue';

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cash';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type NotificationType = 'info' | 'warning' | 'payment' | 'ticket' | 'installation';

export type PackageStatus = 'active' | 'discontinued';

// ---- Table Interfaces ----

/**
 * Mirrors public.profiles (extends auth.users).
 * This is what AuthContext fetches after sign-in.
 */
export interface Profile {
  id: string;          // same UUID as auth.users.id
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

/**
 * Convenience alias: components that need the auth user
 * shape can use this to reference full_name + role together.
 */
export type User = Profile & { email?: string };

export interface Customer {
  id: string;
  profile_id: string;          // FK → profiles.id
  managed_by: string | null;   // FK → profiles.id (admin who manages this customer)
  isp_id: string;              // FK → isps.id
  installation_address: string;
  installation_area: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
  managed_by_profile?: Profile;
}

export interface Technician {
  id: string;
  user_id: string;
  specialization: string;
  assigned_area: string;
  availability: TechAvailability;
  joined_at: string;
  // Joined fields
  user?: User;
}

export interface ISPPackage {
  id: string;
  name: string;
  description: string;
  speed_mbps: number;
  price_monthly: number;
  status: PackageStatus;
  created_at: string;
}

export interface Installation {
  id: string;
  customer_id: string;
  technician_id: string | null;
  package_id: string;
  address: string;
  area_code: string;
  status: InstallationStatus;
  notes: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;
  // Joined fields
  customer?: Customer;
  technician?: Technician;
  package?: ISPPackage;
}

export interface Ticket {
  id: string;
  customer_id: string;
  technician_id: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  technician?: Technician;
}

export interface Invoice {
  id: string;
  customer_id: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  // Joined fields
  customer?: Customer;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference_no: string | null;
  paid_at: string;
  // Joined fields
  invoice?: Invoice;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
