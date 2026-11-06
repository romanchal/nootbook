#!/usr/bin/env node
/**
 * Runs a Prisma `migrate` command against the pooler's IPv4 address.
 *
 * The Prisma schema engine (Rust) cannot reach Supabase's pooler over its
 * IPv6/NAT64 DNS entries (error P1001), while the Node `pg` driver connects
 * fine. This script resolves the pooler hostname to IPv4 and re-runs Prisma
 * with that address, so migrations work from the same DATABASE_URL.
 *
 * Usage: node scripts/db-migrate.mjs <prisma args...>
 *        e.g. pnpm db:deploy  ==  node scripts/db-migrate.mjs migrate deploy
 */
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import { resolve4 } from "node:dns/promises";

dotenv.config();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/db-migrate.mjs <migrate args...>");
  process.exit(1);
}

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const url = new URL(raw);
const hostname = url.hostname;

if (!/^\d+(\.\d+){3}$/.test(hostname) && hostname.endsWith(".pooler.supabase.com")) {
  const ips = await resolve4(hostname);
  if (ips.length === 0) {
    console.error(`No IPv4 address found for ${hostname}`);
    process.exit(1);
  }
  url.hostname = ips[0];
}
url.searchParams.set("sslmode", "no-verify");

console.log(`\nRunning migrations against ${url.hostname} (sslmode=no-verify)\n`);
execSync(`prisma ${args.join(" ")}`, {
  env: { ...process.env, DATABASE_URL: url.toString() },
  stdio: "inherit",
});
