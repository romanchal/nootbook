import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("env validation", () => {
  it("accepts a valid environment and applies defaults", () => {
    const env = parseEnv({ DATABASE_URL: "postgresql://localhost:5432/db" });
    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/db");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects an environment missing DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow();
  });

  it("treats Supabase keys as optional for Step 1", () => {
    const env = parseEnv({ DATABASE_URL: "postgresql://localhost:5432/db" });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
  });
});
