-- ============================================================
-- Nootbook — row-level security (RLS) baseline (Step 1)
-- ============================================================
-- Apply this in the Supabase SQL editor (or `psql`) after creating
-- the tables with `pnpm db:migrate`.
--
-- IMPORTANT — how this interacts with Prisma:
--   Prisma connects with the `postgres` role, which is a table owner and
--   therefore BYPASSES row-level security. So the PRIMARY college-isolation
--   enforcement is application-level: every query must filter by `collegeId`
--   (see the golden rules). These policies are defence-in-depth for any
--   access through Supabase's `authenticated` role (PostgREST / Data API),
--   which does enforce RLS.
--
--   For RLS to bind rows to the signed-in user, `public.users.id` must equal
--   the Supabase Auth user id (`auth.uid()`). Our signup flow (Step 2) writes
--   the user id from `auth.uid()`.
--
-- Write (INSERT/UPDATE/DELETE) policies are intentionally NOT added here:
-- with RLS enabled and no write policy, writes are denied by default. Per-role
-- write policies are added in Step 2 (authentication & roles).
-- ============================================================

-- Helper: the college id of the currently authenticated user.
-- `security definer` runs as the function owner, so it can read `users`
-- even while RLS is enabled on that table.
create or replace function public.nootbook_current_user_college_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "collegeId" from "users" where "id" = auth.uid();
$$;

-- Colleges: a user may read their own college row.
alter table "colleges" enable row level security;
create policy "colleges_own_college" on "colleges"
  for select using ("id" = public.nootbook_current_user_college_id());

-- Tenant tables with a non-null collegeId: read only your own college's rows.
alter table "departments" enable row level security;
create policy "departments_college_isolation" on "departments"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "classes" enable row level security;
create policy "classes_college_isolation" on "classes"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "subjects" enable row level security;
create policy "subjects_college_isolation" on "subjects"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "resources" enable row level security;
create policy "resources_college_isolation" on "resources"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "bookmarks" enable row level security;
create policy "bookmarks_college_isolation" on "bookmarks"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "tasks" enable row level security;
create policy "tasks_college_isolation" on "tasks"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "escrow_holds" enable row level security;
create policy "escrow_holds_college_isolation" on "escrow_holds"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "ledger_entries" enable row level security;
create policy "ledger_entries_college_isolation" on "ledger_entries"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "wallets" enable row level security;
create policy "wallets_college_isolation" on "wallets"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "payouts" enable row level security;
create policy "payouts_college_isolation" on "payouts"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "disputes" enable row level security;
create policy "disputes_college_isolation" on "disputes"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "reviews" enable row level security;
create policy "reviews_college_isolation" on "reviews"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "reports" enable row level security;
create policy "reports_college_isolation" on "reports"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

-- Tables without a direct collegeId: isolate via their parent.
alter table "resource_tags" enable row level security;
create policy "resource_tags_via_resource" on "resource_tags"
  for select using (
    exists (
      select 1 from "resources" r
      where r."id" = "resource_tags"."resourceId"
        and r."collegeId" = public.nootbook_current_user_college_id()
    )
  );

alter table "bids" enable row level security;
create policy "bids_via_task" on "bids"
  for select using (
    exists (
      select 1 from "tasks" t
      where t."id" = "bids"."taskId"
        and t."collegeId" = public.nootbook_current_user_college_id()
    )
  );

-- Users: see yourself, or (for admins) your own college's users.
alter table "users" enable row level security;
create policy "users_self_or_college" on "users"
  for select using (
    "id" = auth.uid()
    or "collegeId" = public.nootbook_current_user_college_id()
  );

alter table "roles" enable row level security;
create policy "roles_self_or_college" on "roles"
  for select using (
    "userId" = auth.uid()
    or "collegeId" = public.nootbook_current_user_college_id()
  );

alter table "notifications" enable row level security;
create policy "notifications_own" on "notifications"
  for select using ("userId" = auth.uid());

alter table "audit_logs" enable row level security;
create policy "audit_logs_college" on "audit_logs"
  for select using ("collegeId" = public.nootbook_current_user_college_id());

alter table "commission_configs" enable row level security;
create policy "commission_configs_college_or_default" on "commission_configs"
  for select using (
    "collegeId" is null
    or "collegeId" = public.nootbook_current_user_college_id()
  );
