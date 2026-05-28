-- =============================================================================
-- SIMA-Net Application — PostgreSQL Schema for Supabase
-- Version: 1.1.0
-- Run this in the Supabase SQL Editor (once, top-to-bottom)
-- NOTE: Resellers are NOT a separate entity. The Admin IS the Reseller.
--       Customers are managed directly by admin profiles (role = 'admin').
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE user_role        AS ENUM ('admin', 'technician', 'customer');
CREATE TYPE customer_status  AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE reg_status       AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE ticket_type      AS ENUM ('new_installation', 'complaint');
CREATE TYPE ticket_status    AS ENUM ('submitted', 'in_progress', 'success', 'failed', 'done');
CREATE TYPE bill_status      AS ENUM ('unpaid', 'paid');

-- =============================================================================
-- TABLE: profiles
-- Extends Supabase auth.users. Created automatically via trigger on sign-up.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  phone       TEXT,
  role        user_role   NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles          IS 'Extends auth.users with application-level user data.';
COMMENT ON COLUMN public.profiles.role     IS 'admin | technician | customer';

-- Trigger: auto-create a profile row whenever a new auth user is registered
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TABLE: isps
-- Internet Service Packages offered by the platform.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.isps (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT    NOT NULL,
  speed_limit  TEXT    NOT NULL,                -- e.g. "20 Mbps"
  price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.isps IS 'ISP packages / internet plans available on the platform.';

-- NOTE: The `resellers` table has been intentionally removed.
-- Resellers are not a separate entity; the Admin profile (role = 'admin')
-- fulfils the reseller role. Customers are linked to their managing admin
-- via the `managed_by` column in the `customers` table.

-- =============================================================================
-- TABLE: customers
-- Links a user profile to an ISP plan. The admin who approved/manages the
-- customer is referenced via `managed_by` (points to a profile with role='admin').
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id                   UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id           UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  managed_by           UUID            REFERENCES public.profiles(id) ON DELETE SET NULL,  -- admin who manages this customer
  isp_id               UUID            NOT NULL REFERENCES public.isps(id) ON DELETE RESTRICT,
  installation_address TEXT            NOT NULL,
  installation_area    TEXT,
  status               customer_status NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- FR: prevent duplicate customer profiles (one profile = one customer record)
  CONSTRAINT uq_customers_profile UNIQUE (profile_id)
);

COMMENT ON TABLE  public.customers              IS 'Registered customers linked to a profile and an ISP plan.';
COMMENT ON COLUMN public.customers.managed_by   IS 'Admin profile (role=admin) who approved and manages this customer.';
COMMENT ON COLUMN public.customers.status       IS 'active | inactive | pending';
COMMENT ON CONSTRAINT uq_customers_profile ON public.customers IS 'A single auth user may only have one customer record.';

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TABLE: registrations
-- New customer sign-up requests (FR-003.a). Processed by admin before
-- a formal `customers` record is created.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id          UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name   TEXT       NOT NULL,
  email       TEXT       NOT NULL,
  phone       TEXT,
  address     TEXT       NOT NULL,
  isp_id      UUID       REFERENCES public.isps(id) ON DELETE SET NULL,
  status      reg_status NOT NULL DEFAULT 'pending',
  notes       TEXT,                              -- admin rejection/approval notes
  reviewed_by UUID       REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.registrations             IS 'New customer sign-up requests pending admin approval.';
COMMENT ON COLUMN public.registrations.reviewed_by IS 'Admin who approved or rejected the registration.';

-- =============================================================================
-- TABLE: installations_and_tickets
-- Tracks technician assignments for new installations and complaint tickets
-- (FR-003 & FR-005).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.installations_and_tickets (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          ticket_type   NOT NULL,
  customer_id   UUID          NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  technician_id UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  description   TEXT,
  status        ticket_status NOT NULL DEFAULT 'submitted',
  scheduled_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- A ticket cannot be marked completed without a completion timestamp
  CONSTRAINT chk_completed_at CHECK (
    (status NOT IN ('success', 'done', 'failed')) OR (completed_at IS NOT NULL)
  )
);

COMMENT ON TABLE  public.installations_and_tickets            IS 'Installation jobs and complaint tickets assigned to technicians.';
COMMENT ON COLUMN public.installations_and_tickets.type       IS 'new_installation | complaint';
COMMENT ON COLUMN public.installations_and_tickets.status     IS 'submitted | in_progress | success | failed | done';

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.installations_and_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index: speed up technician workload queries
CREATE INDEX IF NOT EXISTS idx_tickets_technician ON public.installations_and_tickets(technician_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer    ON public.installations_and_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status      ON public.installations_and_tickets(status);

-- =============================================================================
-- TABLE: bills_and_payments
-- Automatic billing records and payment tracking (FR-004).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bills_and_payments (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount         NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  billing_period TEXT        NOT NULL,           -- e.g. "2025-06" (YYYY-MM)
  status         bill_status NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,                           -- e.g. "transfer", "qris", "midtrans"
  paid_at        TIMESTAMPTZ,
  invoice_url    TEXT,                           -- URL to generated PDF invoice
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate invoices for the same customer in the same billing period
  CONSTRAINT uq_bill_customer_period UNIQUE (customer_id, billing_period),

  -- A paid bill must carry payment details
  CONSTRAINT chk_paid_fields CHECK (
    status = 'unpaid'
    OR (status = 'paid' AND paid_at IS NOT NULL AND payment_method IS NOT NULL)
  )
);

COMMENT ON TABLE  public.bills_and_payments                IS 'Monthly billing records and payment status per customer.';
COMMENT ON COLUMN public.bills_and_payments.billing_period IS 'Format: YYYY-MM (e.g. 2025-06).';
COMMENT ON COLUMN public.bills_and_payments.invoice_url    IS 'Link to the generated PDF invoice stored in Supabase Storage.';

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON public.bills_and_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index: payment dashboard queries
CREATE INDEX IF NOT EXISTS idx_bills_customer ON public.bills_and_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status   ON public.bills_and_payments(status);
CREATE INDEX IF NOT EXISTS idx_bills_period   ON public.bills_and_payments(billing_period);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Helper: get the calling user's role from profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read all
CREATE POLICY "profiles: read own or admin"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- Users can update their own profile
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Only admins can update any profile (e.g., promote to technician)
CREATE POLICY "profiles: admin full update"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- isps
-- ---------------------------------------------------------------------------
ALTER TABLE public.isps ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view ISP plans
CREATE POLICY "isps: authenticated read"
  ON public.isps FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert / update / delete ISP plans
CREATE POLICY "isps: admin write"
  ON public.isps FOR ALL
  USING (public.get_my_role() = 'admin');

-- NOTE: RLS for `resellers` table removed — table was dropped.
-- Admin/reseller identity is now unified in the `profiles` table (role='admin').

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own record; admins and technicians can view all
CREATE POLICY "customers: read own or staff"
  ON public.customers FOR SELECT
  USING (
    profile_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'technician')
  );

-- Only admins can insert / update / delete customer records
CREATE POLICY "customers: admin write"
  ON public.customers FOR ALL
  USING (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- registrations
-- ---------------------------------------------------------------------------
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public INSERT: anyone (even unauthenticated) can submit a registration form
CREATE POLICY "registrations: public insert"
  ON public.registrations FOR INSERT
  WITH CHECK (true);

-- Only admins can view and manage registrations
CREATE POLICY "registrations: admin all"
  ON public.registrations FOR ALL
  USING (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- installations_and_tickets
-- ---------------------------------------------------------------------------
ALTER TABLE public.installations_and_tickets ENABLE ROW LEVEL SECURITY;

-- Customers can view tickets that belong to them
CREATE POLICY "tickets: customer read own"
  ON public.installations_and_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.profile_id = auth.uid()
    )
    OR public.get_my_role() IN ('admin', 'technician')
  );

-- Customers can insert complaint tickets for themselves
CREATE POLICY "tickets: customer insert complaint"
  ON public.installations_and_tickets FOR INSERT
  WITH CHECK (
    type = 'complaint'
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.profile_id = auth.uid()
    )
  );

-- Technicians can update tickets assigned to them
CREATE POLICY "tickets: technician update assigned"
  ON public.installations_and_tickets FOR UPDATE
  USING (
    technician_id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- Only admins can delete tickets
CREATE POLICY "tickets: admin delete"
  ON public.installations_and_tickets FOR DELETE
  USING (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------------------
-- bills_and_payments
-- ---------------------------------------------------------------------------
ALTER TABLE public.bills_and_payments ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bills
CREATE POLICY "bills: customer read own"
  ON public.bills_and_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.profile_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

-- Only admins can create billing records
CREATE POLICY "bills: admin insert"
  ON public.bills_and_payments FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Customers can "pay" their own bill (update payment fields only)
-- Full update rights reserved for admins
CREATE POLICY "bills: customer pay"
  ON public.bills_and_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.profile_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

-- Only admins can delete billing records
CREATE POLICY "bills: admin delete"
  ON public.bills_and_payments FOR DELETE
  USING (public.get_my_role() = 'admin');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
