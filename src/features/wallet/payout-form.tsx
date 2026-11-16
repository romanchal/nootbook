"use client";

import { useState, useTransition } from "react";
import { requestPayoutAction } from "./actions";
import { Button } from "@/components/ui/button";

interface PayoutFormProps {
  availableRupees: number;
  kycVerified: boolean;
}

export function PayoutForm({ availableRupees, kycVerified }: PayoutFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountRupees, setAmountRupees] = useState<number>(Math.min(availableRupees, 500));
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("amountRupees", String(amountRupees));
    if (notes.trim()) {
      formData.set("notes", notes.trim());
    }

    startTransition(async () => {
      const res = await requestPayoutAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setIsOpen(false);
      }
    });
  }

  if (!kycVerified) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
          <span>⚠️</span> KYC Verification Required for Payouts
        </div>
        <p>
          In accordance with RBI payment regulations (Section 17.6), earners must complete KYC verification before requesting their first withdrawal. Contact your College Admin or submit your college ID card for verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {success && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          Withdrawal request submitted! It will be reviewed and transferred to your registered UPI / bank account.
        </div>
      )}

      {!isOpen ? (
        <Button
          onClick={() => {
            setIsOpen(true);
            setSuccess(false);
            setError(null);
          }}
          disabled={availableRupees < 100}
          size="sm"
          className="text-xs"
        >
          Withdraw Earnings →
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Request Withdrawal</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:underline text-[11px]"
            >
              Cancel
            </button>
          </div>

          {error && <p className="text-destructive font-medium">{error}</p>}

          <div className="space-y-1">
            <label className="text-muted-foreground">Amount to Withdraw (₹)</label>
            <input
              type="number"
              min={100}
              max={availableRupees}
              step={50}
              required
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              className="h-8 w-full rounded border bg-background px-2.5 text-foreground font-mono"
            />
            <span className="text-[11px] text-muted-foreground">
              Available: ₹{availableRupees.toLocaleString("en-IN")} · Min ₹100
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground">UPI ID or Account Note</label>
            <input
              type="text"
              placeholder="e.g. username@okhdfcbank"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 w-full rounded border bg-background px-2.5 text-foreground font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Submitting..." : "Confirm Withdrawal Request"}
            </Button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:underline text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
