import { z } from "zod";

/**
 * Server environment variables, validated with Zod.
 *
 * The schema is exported (and `parseEnv` is a pure function) so it can be
 * unit-tested, and so importing this module never crashes a build when an
 * optional variable is absent.
 */
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // Supabase Auth (wired up from Step 2 onward). Optional here so Step 1
  // builds without them.
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  // Server-only. Never expose this to the browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: unknown): Env {
  return envSchema.parse(input);
}
