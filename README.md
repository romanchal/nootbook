# Nootbook

A multi-tenant web platform for college students in Nagpur, India: an academic
library (college → department → year/semester → subject → resources) plus a
peer-to-peer task marketplace with escrow and a small commission.

**Stack:** Next.js (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui ·
PostgreSQL (Supabase) + Prisma · Zod · Vitest.

> Current status: **Step 1 — Foundation** (repository, CI, database schema,
> environments). See `docs/architecture.md` and `docs/decisions.md`.

---

## Prerequisites

- **Node.js 20+** (we develop on Node 22/24)
- **pnpm 9+** (this repo pins `pnpm@11.28.5`)

## One-time setup

```bash
# 1. Install dependencies (this also generates the Prisma client)
pnpm install

# 2. Configure environment variables
cp .env.example .env
#    then edit .env: fill in DATABASE_URL (and Supabase keys for Step 2).

# 3. Create the tables
pnpm db:migrate

# 4. Apply row-level security (Supabase SQL editor, or psql)
#    Paste the contents of supabase/migrations/0000_rls.sql.

# 5. Run the app
pnpm dev
```

Open http://localhost:3000.

### Getting a Supabase database (free)

1. Create a project at https://supabase.com (free tier).
2. In **Project Settings → Database**, copy the **connection string**.
3. Use the **Session pooler** URL (port `5432`) for `DATABASE_URL` so Prisma
   can run migrations.
4. To apply the RLS script: open **SQL Editor** in Supabase and run the file
   `supabase/migrations/0000_rls.sql`.

## Scripts

| Command                | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `pnpm dev`             | Start the dev server                           |
| `pnpm build`           | Production build                               |
| `pnpm start`           | Serve the production build                     |
| `pnpm lint`            | Run ESLint                                     |
| `pnpm typecheck`       | TypeScript check (`tsc --noEmit`)              |
| `pnpm typegen`         | Generate Next.js route types                   |
| `pnpm test`            | Run tests once (Vitest)                        |
| `pnpm test:watch`      | Run tests in watch mode                        |
| `pnpm format`          | Format code with Prettier                      |
| `pnpm format:check`    | Check formatting                               |
| `pnpm prisma:generate` | Generate the Prisma client                     |
| `pnpm prisma:validate` | Validate `prisma/schema.prisma`                |
| `pnpm db:migrate`      | Apply pending migrations (dev)                 |
| `pnpm db:deploy`       | Apply migrations in CI/production              |
| `pnpm db:studio`       | Open Prisma Studio                             |

## Verifying a change

```bash
pnpm lint
pnpm prisma:generate && pnpm typegen && pnpm typecheck
pnpm test
```

GitHub Actions runs these on every push and pull request (`.github/workflows/ci.yml`).

## Project layout

```
src/app/           App Router routes
src/components/    shared UI (shadcn/ui)
src/lib/           db, env, money helpers
src/features/      feature folders (library, tasks, wallet, admin)
prisma/            schema + migrations
supabase/          RLS / Supabase SQL
docs/              architecture note + decision log
```

## Rules and assumptions

Money is stored as integer **paise**; the wallet is a ledger view and real money
always stays with a licensed payment partner. Ledger entries are immutable and
double-entry. Commission/fixed-fee numbers are configurable, not hard-coded.
One college's data is never visible to another college. See
`docs/architecture.md` for the full list of security invariants.
