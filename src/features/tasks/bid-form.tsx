"use client";

import { useState, useTransition } from "react";
import { submitBidAction, withdrawBidAction } from "./actions";
import { Button } from "@/components/ui/button";

interface BidFormProps {
  taskId: string;
  defaultAmountRupees: number;
  existingBid?: {
    id: string;
    amountPaise: number;
    message: string | null;
    status: string;
  } | null;
}

export function BidForm({ taskId, defaultAmountRupees, existingBid }: BidFormProps) {
  const [amountRupees, setAmountRupees] = useState<number>(
    existingBid ? Math.round(existingBid.amountPaise / 100) : defaultAmountRupees,
  );
  const [message, setMessage] = useState<string>(existingBid?.message || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 10% standard earner commission calculation
  const earnerCut = Math.round(amountRupees * 0.9);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("amountRupees", String(amountRupees));
    if (message.trim()) {
      formData.set("message", message.trim());
    }

    startTransition(async () => {
      const res = await submitBidAction(formData);
      if (res.error) {
        setError(res.error);
      }
    });
  }

  function handleWithdraw() {
    if (!existingBid || !confirm("Are you sure you want to withdraw your bid?")) return;
    setError(null);

    startTransition(async () => {
      const res = await withdrawBidAction(existingBid.id, taskId);
      if (res.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {existingBid ? "Update Your Proposal" : "Submit a Bid for this Task"}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verified earners can submit custom pricing and explain their delivery approach.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {existingBid && existingBid.status === "PENDING" && (
        <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span>You currently have a pending bid of ₹{Math.round(existingBid.amountPaise / 100)}</span>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isPending}
            className="text-xs font-semibold text-rose-500 hover:underline"
          >
            Withdraw Bid
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-foreground">Proposed Bid Amount (₹)</label>
          <input
            type="number"
            min={50}
            max={10000}
            step={25}
            required
            value={amountRupees}
            onChange={(e) => setAmountRupees(Number(e.target.value))}
            className="h-9 w-full rounded-md border bg-background px-3 text-foreground font-mono focus:border-primary focus:outline-hidden"
          />
          <div className="text-[11px] text-muted-foreground">
            Estimated payout to your wallet after 10% commission:{" "}
            <strong className="text-emerald-600 font-mono">₹{earnerCut}</strong>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-foreground">Approach & Pitch to Student</label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Explain your relevant experience, tools you'll use, or estimated delivery turnaround..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Submitting..." : existingBid ? "Update Bid Proposal" : "Submit Bid Proposal →"}
        </Button>
      </form>
    </div>
  );
}
