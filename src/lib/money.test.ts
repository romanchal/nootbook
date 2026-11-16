import { describe, expect, it } from "vitest";
import { formatPaiseToRupees, formatRs, paiseToRupees, rupeesToPaise } from "./money";

describe("money helpers", () => {
  it("converts rupees to integer paise without floating-point drift", () => {
    expect(rupeesToPaise(500)).toBe(50000);
    expect(rupeesToPaise(0.1)).toBe(10);
    expect(rupeesToPaise(19.99)).toBe(1999);
  });

  it("converts paise back to rupees", () => {
    expect(paiseToRupees(50000)).toBe(500);
    expect(paiseToRupees(1999)).toBe(19.99);
  });

  it("formats paise as Indian rupees with two decimals", () => {
    expect(formatRs(50000)).toBe("Rs. 500.00");
    expect(formatRs(1999)).toBe("Rs. 19.99");
  });

  it("formats paise as compact rupee symbol text", () => {
    expect(formatPaiseToRupees(50000)).toBe("₹500");
    expect(formatPaiseToRupees(25000)).toBe("₹250");
  });
});
