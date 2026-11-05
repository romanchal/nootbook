import { describe, expect, it } from "vitest";
import { emailSchema, otpSchema } from "./schemas";

describe("auth schemas", () => {
  it("accepts a valid email and normalises it", () => {
    const result = emailSchema.parse({ email: "  Student@College.edu " });
    expect(result.email).toBe("student@college.edu");
  });

  it("rejects an invalid email", () => {
    expect(() => emailSchema.parse({ email: "not-an-email" })).toThrow();
  });

  it("accepts a 6-digit OTP code", () => {
    const result = otpSchema.parse({ email: "a@b.com", code: "123456" });
    expect(result.code).toBe("123456");
  });

  it("rejects a code that is not 6 digits", () => {
    expect(() => otpSchema.parse({ email: "a@b.com", code: "123" })).toThrow();
    expect(() => otpSchema.parse({ email: "a@b.com", code: "abcdef" })).toThrow();
  });
});
