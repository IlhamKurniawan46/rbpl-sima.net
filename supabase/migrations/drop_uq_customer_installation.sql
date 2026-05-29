-- =============================================================================
-- Migration: Drop uq_customer_installation constraint
-- Reason: This constraint incorrectly prevented customers from submitting
--         more than one ticket (complaint). Customers must be able to file
--         multiple complaints over time.
-- Run this once in the Supabase SQL Editor.
-- =============================================================================

ALTER TABLE public.installations_and_tickets
  DROP CONSTRAINT IF EXISTS uq_customer_installation;
