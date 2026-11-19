import { describe, expect, it } from "vitest";
import { isPublicPath } from "./routes";

describe("isPublicPath", () => {
  it("keeps the home page public", () => {
    expect(isPublicPath("/")).toBe(true);
  });

  it("keeps auth pages public", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/signup")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
    expect(isPublicPath("/unauthorized")).toBe(true);
    expect(isPublicPath("/papers/test.pdf")).toBe(true);
  });

  it("protects app pages", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/earner")).toBe(false);
    expect(isPublicPath("/admin")).toBe(false);
    expect(isPublicPath("/wallet")).toBe(false);
  });
});
