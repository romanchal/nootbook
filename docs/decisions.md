# Nootbook — decision log

Each entry records a decision, the reason in plain language, and the date.
Add a new entry whenever a non-obvious choice is made.

## 2026-11-06 — Database host: Supabase (free tier)

**Decision.** Use Supabase PostgreSQL (free tier) for the database, storage and
planned auth.

**Why.** The project document requires PostgreSQL + Prisma with row-level
security. Supabase provides managed Postgres with native RLS, object storage
and Auth in one free project — the fewest moving parts. Firebase was considered
but rejected because Firestore is a NoSQL document store, which conflicts with
the document's hard requirement for PostgreSQL + Prisma + versioned migrations.

## 2026-11-06 — ORM version: Prisma 7 (not 8)

**Decision.** Pin `prisma` and `@prisma/client` to 7.10.1.

**Why.** Prisma 8 was still a release candidate (`8.0.0-rc.30`) at build time;
7.10.1 is the current stable. Prisma 7 requires a driver adapter, so we use
`@prisma/adapter-pg` with `pg`.

## 2026-11-06 — Money stored as integer paise

**Decision.** Every monetary amount is an integer number of paise (e.g. Rs. 500
= `50000`). Commission is integer basis points (1000 = 10%).

**Why.** Floating-point arithmetic can produce rounding errors that would
corrupt the double-entry ledger. Integers keep every ledger balance exact.
Formatting to rupees happens only at display time (`src/lib/money.ts`).

## 2026-11-06 — User id binds to Supabase Auth id

**Decision.** `User.id` has no default and is set to the Supabase Auth user id
(`auth.uid()`) at signup.

**Why.** Postgres row-level security decides access with `auth.uid()`. Binding
our user rows to that id lets RLS (and the app) tie rows to the signed-in user
without a second lookup column.

## 2026-11-06 — RLS is defence-in-depth, app scoping is primary

**Decision.** College isolation is enforced primarily in application code
(every query filters by `collegeId`); RLS is enabled as a second layer.

**Why.** Prisma connects as the `postgres` role, which is a table owner and
bypasses RLS. So RLS alone does not protect the Prisma path. We keep RLS for
any direct Supabase `authenticated`-role access and document this honestly.

## 2026-11-06 — Auth provider: Supabase Auth (confirmed)

**Decision.** Use Supabase Auth for OTP/email/Google login and 2FA.

**Why.** It is in the document's allowed list, is included in the Supabase free
tier, and its JWTs integrate with Postgres RLS. Confirmed by the team when the
Supabase project (`jcbwmatnivnfbgphtjva`) was provided.

## 2026-11-06 — Database region: ap-northeast-2 (Seoul)

**Decision.** The Supabase project lives in `ap-northeast-2` (Seoul); the pooler
host is `aws-0-ap-northeast-2.pooler.supabase.com`.

**Why.** Discovered by scanning the poolers (the tenant resolves only in Seoul).
Recorded so the connection string and migration helper target the right host.

## 2026-11-06 — SSL mode and the schema-engine IPv6 workaround

**Decision.** Append `?sslmode=no-verify` to the connection string, and run
`prisma migrate` through `scripts/db-migrate.mjs`, which resolves the pooler to
an IPv4 address first.

**Why.** The pooler requires TLS but its certificate is not in the default trust
store on this machine, so `no-verify` is required. Separately, the Prisma
*schema engine* (Rust) cannot connect to the pooler's IPv6/NAT64 DNS entries
(error `P1001`), while the Node `pg` driver can. The helper resolves IPv4 for
migrations only; the app runtime (pg adapter) connects via the hostname.

## 2026-11-06 — users.id stored as text (auth.uid() UUID string)

**Decision.** `users.id` is a `text` column holding the Supabase Auth user id
(UUID string), not a native `uuid` type.

**Why.** Prisma `String @id` maps to `text`, so the RLS policies compare
`"id" = auth.uid()::text`. Functionally identical for the app; a native `uuid`
column can be adopted later for index/type benefits.

## Open items (to confirm with the team / professionals)

- Final commission and fixed-fee numbers (the document's Rs. 500 / 10% / Rs. 20
  example is illustrative) — to confirm with a CA.
- Payment partner (Razorpay Route vs Cashfree Easy Split) — Step 8.
- GST, TDS and payout tax treatment — CA/lawyer, before public launch.
