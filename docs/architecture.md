# Nootbook — architecture note

> Status: Steps 1 through 9 (Disputes, Escrow Settlements, & Safety Engine) complete. Kept short; grows as the build proceeds.

## 1. What Nootbook is

A multi-tenant web platform for college students in Nagpur, India: an academic
library (college → department → year/semester → subject → resources) plus a
peer-to-peer task marketplace with escrow and a small commission.

## 2. Technology

| Concern        | Choice                                                    |
| -------------- | --------------------------------------------------------- |
| Frontend       | Next.js (App Router), React, TypeScript (strict), Tailwind 4 |
| UI             | shadcn/ui (base-nova style, neutral base colour, light/dark) |
| Database       | PostgreSQL via Supabase, Prisma ORM 7                     |
| Driver adapter | `@prisma/adapter-pg` (`pg`) — required by Prisma 7        |
| Validation     | Zod                                                       |
| Auth (planned) | Supabase Auth (Step 2) — email/phone OTP, Google, 2FA     |
| Storage        | Supabase Storage (signed URLs)                            |
| Payments       | Licensed partner, e.g. Razorpay Route / Cashfree (Step 8) |
| Tests          | Vitest (unit), CI via GitHub Actions                      |

## 3. Folder structure (feature-first)

```
src/
  app/            # App Router routes and layouts
  components/     # shared UI (shadcn/ui in components/ui)
  lib/            # shared logic: db, env, money
  features/
    library/      # academic library (Steps 3–5)
    tasks/        # marketplace (Steps 7–8)
    wallet/       # wallet/ledger (Step 8)
    disputes/     # dispute mediation, escrow settlement & safety (Step 9)
    admin/        # admin console (Step 6)
  generated/      # Prisma client (git-ignored)
prisma/
  schema.prisma   # source of truth for the data model
  migrations/     # versioned SQL migrations
supabase/
  migrations/     # row-level security and Supabase-specific SQL
docs/
  decisions.md    # decision log
```

## 4. Multi-tenancy (the most important rule)

One college must never see another college's data. Enforced in two layers:

1. **Application layer (primary).** Every route, server action and query
   filters by the current user's `collegeId`. This is enforced in code and
   tested.
2. **Database layer (defence-in-depth).** Postgres row-level security on every
   tenant table (see `supabase/migrations/0000_rls.sql`). Note: Prisma connects
   as `postgres` (table owner), which bypasses RLS — so RLS protects any
   direct access through Supabase's `authenticated` role, not the Prisma path.

## 5. Money model

All amounts are integer **paise** (1 rupee = 100 paise) to avoid floating-point
errors. The wallet is a **ledger view**; real money always stays with the
licensed payment partner. Ledger entries are **immutable** and double-entry
(each movement writes rows whose debits/credits sum to zero). See
`src/lib/money.ts`.

## 6. Security invariants (never broken)

- Never build a payment gateway; never store card/UPI PIN data.
- Never edit or delete a ledger entry — corrections are reverse entries.
- Never put secrets in code — environment variables only (see `.env.example`).
- Every query checks role AND college.
