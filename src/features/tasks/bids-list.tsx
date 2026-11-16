"use client";

import { useTransition } from "react";
import { formatPaiseToRupees } from "@/lib/money";
import { depositEscrowManualAction } from "@/features/wallet/actions";
import { BID_STATUS_META } from "./format";
import { Button } from "@/components/ui/button";
import type { BidStatus } from "@/generated/prisma/client";

interface BidItem {
  id: string;
  amountPaise: number;
  message: string | null;
  status: BidStatus;
  createdAt: Date | string;
  earner: {
    id: string;
    name: string;
    reviewsReceived: Array<{ rating: number }>;
  };
}

interface BidsListProps {
  taskId: string;
  taskStatus: string;
  bids: BidItem[];
  isOwner: boolean;
}

export function BidsList({ taskId, taskStatus, bids, isOwner }: BidsListProps) {
  const [isPending, startTransition] = useTransition();

  function handleAcceptBid(bidId: string) {
    if (!confirm("Accept this proposal and deposit escrow funds in manual mode?")) {
      return;
    }

    startTransition(async () => {
      const res = await depositEscrowManualAction(taskId, bidId);
      if (res.error) {
        alert(res.error);
      }
    });
  }

  if (bids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
        No bids have been submitted yet. Verified campus earners will review your task and propose bids shortly.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => {
        const meta = BID_STATUS_META[bid.status];
        const ratings = bid.earner.reviewsReceived;
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
            : null;

        return (
          <div
            key={bid.id}
            className={`rounded-xl border p-4 shadow-2xs transition-all space-y-2.5 ${
              bid.status === "ACCEPTED"
                ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                : "bg-card"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {bid.earner.name}
                </span>

                {avgRating ? (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    ★ {avgRating} ({ratings.length})
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">New earner</span>
                )}

                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-medium ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="text-right font-mono text-sm font-bold text-foreground">
                {formatPaiseToRupees(bid.amountPaise)}
              </div>
            </div>

            {bid.message && (
              <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                {bid.message}
              </p>
            )}

            {isOwner && taskStatus === "OPEN" && bid.status === "PENDING" && (
              <div className="border-t pt-2.5 flex justify-end">
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleAcceptBid(bid.id)}
                  className="text-xs"
                >
                  {isPending ? "Depositing Escrow..." : "Accept Proposal & Deposit Escrow →"}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
