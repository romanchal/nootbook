/**
 * Money helpers.
 *
 * Every monetary amount in the database is stored as an integer number of
 * paise (1 rupee = 100 paise). Integers avoid the floating-point rounding
 * errors that would otherwise corrupt the wallet ledger. Commission is stored
 * in basis points (see the schema) and is not handled here.
 */

export const PAISE_PER_RUPEE = 100;

/** Convert a rupee amount (number, may have decimals) to integer paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

/** Convert integer paise to a rupee number (may have decimals). */
export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

/** Format integer paise for display, e.g. formatRs(50000) -> "Rs. 500.00". */
export function formatRs(paise: number): string {
  return `Rs. ${paiseToRupees(paise).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
