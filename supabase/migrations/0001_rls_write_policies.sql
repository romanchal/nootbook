-- ============================================================
-- Nootbook — row-level security: write policies (Step 2)
-- ============================================================
-- Apply after supabase/migrations/0000_rls.sql.
--
-- These grant WRITE access through Supabase's `authenticated` role (Data API /
-- PostgREST). Our own server code writes through Prisma as `postgres` (which
-- bypasses RLS) and enforces role + college checks in application code, so
-- these policies are a second, direct-access layer — not the primary defence.
--
-- Policy pattern for later steps: per-feature writes (uploads, task posting,
-- escrow release, payouts) each get their own narrow policy here or in a
-- later migration. Only user self-service is needed for Step 2.
-- ============================================================

-- A user may create their own record (id matches the auth user)...
create policy "users_insert_self" on "users"
  for insert with check ("id" = auth.uid()::text);

-- ...and update only their own row.
create policy "users_update_self" on "users"
  for update using ("id" = auth.uid()::text)
  with check ("id" = auth.uid()::text);

-- Roles are written by the server (postgres role) and by admins; no direct
-- authenticated-role write policy is granted yet. Same for wallets, which are
-- created by the server when a user is provisioned.
