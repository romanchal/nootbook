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

## 2026-11-07 — Step 2: Role route protection via server guards

**Decision.** Implement role-specific boundaries (`requireEarnerGuard`,
`requireClassAdminGuard`, `requireCollegeAdminGuard`, `requireSuperAdminGuard`)
in `src/features/auth/guards.ts` with automated redirect to `/unauthorized`.

**Why.** Fulfills Step 2 acceptance criteria that each role can only reach its
designated screens and data. Super Admins retain cross-college privileges.

## 2026-11-07 — Step 3: Fixed 5-Level Academic Library Tree (3-Tap Mobile Flow)

**Decision.** Structure the academic repository into the fixed 5-level hierarchy
mandated by Section 4:
`College (Tenant) -> Department -> Year/Class -> Subject -> Resource Hub`.

**Why.** Enables the core requirement where any student can reach their target
paper within three taps (`/library` → `/[deptCode]` → `/sem/[sem]` → `/subject/[id]`).
Only `APPROVED` resources are ever returned to students. Unapproved files remain
in the Class Admin moderation queue.

## 2026-11-07 — Offline and 4G Optimization: System Font Stacks

**Decision.** Rely on system sans-serif font fallbacks in `src/app/layout.tsx`
rather than blocking external Google Fonts HTTP requests at build time.

**Why.** Aligns with Section 17.7 requirement for fast first-paint on mid-range
Android phones on mobile data in Nagpur, eliminating external network dependencies.

## 2026-11-07 — Step 4: Quality Control & Class Admin Approval Pipeline

**Decision.** Every resource upload starts in `PENDING` status. Unapproved files
are strictly filtered out from student queries (`status: "APPROVED"` only). Class
Admins review submissions in their moderation queue; approval assigns `verifiedBadge: true`
and publishes the file, while rejection records the reason. Every action writes to
the immutable `AuditLog`.

**Why.** Fulfills Section 4 and Section 18 Step 4 acceptance criteria to safeguard
academic integrity and ensure only verified study material is published to students.



## 2026-11-07 — Step 5: Search, Bookmarks, and Download Tracking
 
**Decision.** Built multi-attribute academic search (`/library/search`) with sub-second execution (<1000ms),
instant debounce/URL synchronization, multi-tenant college isolation (`collegeId`), and multi-attribute
filtering (department, semester, resource type, verified status). Integrated user bookmarks (`/library/bookmarks`)
with optimistic toggling (`BookmarkButton`) and server validation preventing cross-tenant access. Download tracking
increments the immutable count on each request.

**Why.** Satisfies Section 18 Step 5 acceptance criteria ("Full-text search with filters, bookmarks and download tracking.
Accepted when search returns results in under one second on pilot data"). Ensures students can bookmark resources for
offline/quick exam access and discover papers across departments.

## 2026-11-07 — Step 6: Admin Console, Content Moderation, and Audit Logging

**Decision.** Implemented comprehensive administration consoles across roles (`/admin/super`, `/admin/college`, `/admin/class`):
- Centralized immutable audit logging (`AuditLog`): Every administrative mutation (resource approval/rejection, report resolution, content takedown, role assignment/revocation, user suspension, college status change, and financial commission adjustments) writes a tamper-evident record.
- Content & Report Moderation: Student report resolution with optional automated resource takedown (marking status `REJECTED`).
- Dynamic Commission Configuration: Stored in `commission_configs` table (defaults: 1000 bps / 10% earner fee, 2000 paise / Rs. 20 payer fee) with live financial simulator.
- College Tenant Lifecycle: Super Admin onboarding of new colleges with standard department provisioning.

**Why.** Satisfies Section 18 Step 6 acceptance criteria ("User, content and report management with audit logs. Accepted when every admin action is logged"). Enforces strict multi-tenancy where College and Class Admins only see and manage their college's data.

## 2026-11-14 — Step 7: Peer-to-Peer Task Marketplace Lifecycle

**Decision.** Implemented peer-to-peer task marketplace (`/tasks`, `/tasks/new`, `/tasks/[taskId]`, `/tasks/my`, `/earner`):
- Academic Integrity Enforcement (Section 6 & 17.8): Whitelist of allowed categories (`FORMATTING`, `TYPING`, `SLIDE_DESIGN`, `DIAGRAM`, `PROOFREADING`, `TUTORING`, `DOUBT_SOLVING`, `PROJECT_GUIDANCE`). Programmatic blocking of exam cheating, proxy attendance, and test impersonation patterns.
- Verified Earner Boundary: Only verified campus earners (`EARNER` role) can submit bid proposals. Bidding on own tasks is prohibited.
- Full 8-Step Lifecycle with Audit Logging:
  1. `TASK_CREATE` (status `OPEN`)
  2. `BID_SUBMIT` (status `PENDING`)
  3. `BID_WITHDRAW` (status `WITHDRAWN`)
  4. `TASK_ASSIGN` (status `ASSIGNED`, accepts winning bid, rejects competing bids)
  5. `TASK_DELIVER` (status `DELIVERED`, records delivery notes/links)
  6. `TASK_ACCEPT` (status `ACCEPTED`, concludes work delivery)
  7. `TASK_REVIEW` (1–5 star rating and feedback stored in `reviews`)
  8. `TASK_CANCEL` (allowed only while `OPEN`, status `CANCELLED`)

**Why.** Satisfies Section 18 Step 7 acceptance criteria ("Task posting, earner approval, bidding, delivery and reviews. Accepted when a full task can be completed without payment errors"). Establishes the lifecycle foundations prior to Step 8 (escrow holds and double-entry ledger settlement).

## 2026-11-14 — Step 8: Double-Entry Ledger, Wallet, and Manual Escrow Settlement

**Decision.** Configured payments and escrow in **Manual / Pilot Mode** (`/wallet`, `src/features/wallet`):
- Double-Entry Balanced Ledger Engine: Every monetary movement writes immutable legs to `LedgerEntry` where debits and credits sum exactly to zero. Entries are never updated or deleted.
- Manual Escrow Deposit: Students accept proposals and fund escrow in manual simulation mode, creating `EscrowHold` (`status: HELD`) and debiting payer / crediting `ESCROW_HELD`.
- Escrow Release on Delivery Acceptance: When student accepts work, escrow is released, recording exact 3-leg distribution:
  - Debit `ESCROW_HELD` (e.g. ₹520)
  - Credit Earner `USER_BALANCE` (e.g. ₹450)
  - Credit `PLATFORM_REVENUE` (e.g. ₹70 = ₹50 commission + ₹20 fee)
  - Total Debits (₹520) == Total Credits (₹520). Discrepancy is 0.
- Earner Payouts with RBI Compliance: Earner withdrawals enforce KYC verification guard (`user.kycVerified`), debiting `USER_BALANCE` and crediting `PAYOUTS_PENDING` until settled.

**Why.** Satisfies Section 18 Step 8 acceptance criteria ("The ledger always balances and repeated webhooks cause no double payment") while accommodating user guidance to operate in manual/pilot mode during development.

## 2026-11-14 — Step 9: Disputes, Escrow Settlements, and Three-Strike Safety

**Decision.** Built the comprehensive Dispute Mediation, Ledger Settlement, and Safety system (`src/features/disputes`):
- Dispute Opening: Students or assigned earners can open a formal dispute on active (`ASSIGNED` or `DELIVERED`) tasks. Halts escrow release and updates task status to `DISPUTED`.
- Dispute Resolution by Admins (College Admin for their college, Super Admin platform-wide):
  1. `REFUND_STUDENT`: Full escrow hold refunded to student via balanced double-entry ledger movement (Debit `ESCROW_HELD`, Credit `USER_BALANCE` for student), updating escrow to `REFUNDED` and task to `REFUNDED`.
  2. `RELEASE_EARNER`: Deliverable verified and upheld. Escrow released to earner minus standard platform commission via balanced 3-leg distribution, updating escrow to `RELEASED` and task to `ACCEPTED`.
  3. `SPLIT`: Custom partial settlement between student and earner with strictly balanced debit/credit sums.
- Three-Strike Conduct & Safety Escalation:
  - Strikes recorded in immutable `AuditLog` (`action: "USER_STRIKE"`).
  - Strike 1 & 2: Official warnings with reason.
  - Strike 3: Triggers automated suspension (`User.status = "SUSPENDED"`) and wallet freeze (`Wallet.status = "FROZEN"`).
  - Administrative reinstatement unfreezes wallet and reactivates account (`action: "USER_REINSTATE"`).
- Academic Integrity & Category Whitelist: Programmatic enforcement of allowed assistance types (`FORMATTING`, `TYPING`, `SLIDE_DESIGN`, `DIAGRAM`, `PROOFREADING`, `TUTORING`, `DOUBT_SOLVING`, `PROJECT_GUIDANCE`) with rejection of exam cheating, proxy attendance, or test impersonation.
- Admin Integration: Dedicated "Disputes & Escrow" tab in College Admin Console (`/admin/college`) and Super Admin Console (`/admin/super`), with dispute banner and mediation request dialog on `/tasks/[taskId]`.

**Why.** Satisfies Section 18 Step 9 acceptance criteria ("Dispute flow, refunds, strikes and category whitelist. Accepted when an admin can resolve a dispute end to end").

## Open items (to confirm with the team / professionals)

- Final commission and fixed-fee numbers (the document's Rs. 500 / 10% / Rs. 20
  example is illustrative) — to confirm with a CA.
- Payment partner (Razorpay Route vs Cashfree Easy Split) — Step 8.
- GST, TDS and payout tax treatment — CA/lawyer, before public launch.
