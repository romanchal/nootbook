"use client";

import { useState, useTransition } from "react";
import { openDisputeAction } from "./actions";
import { Button } from "@/components/ui/button";

interface OpenDisputeDialogProps {
  taskId: string;
  isOwner: boolean;
  isEarner: boolean;
}

export function OpenDisputeDialog({ taskId, isOwner, isEarner }: OpenDisputeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOwner && !isEarner) {
    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("reason", reason.trim());
    if (evidence.trim()) {
      formData.set("evidence", evidence.trim());
    }

    startTransition(async () => {
      const res = await openDisputeAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  }

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <span>⚠️</span>
          <span>Having an issue with this task or delivery?</span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-destructive hover:bg-destructive/10 border-destructive/30 text-xs"
        >
          {isOpen ? "Close Dispute Form" : "Open Dispute / Request Mediation"}
        </Button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-destructive/20 pt-3">
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Opening a formal dispute halts payment release and triggers review by College
            Administration. State facts clearly and link any relevant reference files. Frivolous or
            bad-faith disputes violate campus conduct rules and may incur a safety strike.
          </p>

          {error && (
            <div className="rounded-md bg-destructive/15 p-2 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="dispute-reason" className="font-semibold text-foreground block">
              Reason for Dispute <span className="text-destructive">*</span>
            </label>
            <textarea
              id="dispute-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue (e.g. delivery did not match requirements, earner stopped responding, or student requested unauthorized work)..."
              required
              minLength={10}
              maxLength={1000}
              className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
            <span className="text-[10px] text-muted-foreground block text-right">
              {reason.length} / 1000 (minimum 10 characters)
            </span>
          </div>

          <div className="space-y-1">
            <label htmlFor="dispute-evidence" className="font-semibold text-foreground block">
              Evidence / Proof Links (Optional)
            </label>
            <textarea
              id="dispute-evidence"
              rows={2}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Add links to screenshots, shared drafts, or timestamps of conversations..."
              maxLength={2000}
              className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || reason.trim().length < 10}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Submitting Dispute..." : "Submit Formal Dispute"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
