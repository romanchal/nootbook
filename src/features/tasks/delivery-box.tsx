"use client";

import { useState, useTransition } from "react";
import { deliverTaskAction, acceptTaskDeliveryAction } from "./actions";
import { releaseEscrowAction } from "@/features/wallet/actions";
import { Button } from "@/components/ui/button";

interface DeliveryBoxProps {
  taskId: string;
  status: string;
  isOwner: boolean;
  isAssignedEarner: boolean;
  earnerName?: string;
  deliveryNotes?: string | null;
}

export function DeliveryBox({
  taskId,
  status,
  isOwner,
  isAssignedEarner,
  earnerName = "The assigned earner",
  deliveryNotes,
}: DeliveryBoxProps) {
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDeliver(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!notes.trim()) return;
    setError(null);

    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("deliveryNotes", notes.trim());

    startTransition(async () => {
      const res = await deliverTaskAction(formData);
      if (res.error) {
        setError(res.error);
      }
    });
  }

  function handleAccept() {
    if (!confirm("Accept this delivery? This will release escrow funds to the earner and conclude the task.")) {
      return;
    }
    setError(null);

    startTransition(async () => {
      // First attempt to release escrow funds (splits commission & pays earner)
      const res = await releaseEscrowAction(taskId);
      if (res.error) {
        // Fallback to standard delivery acceptance if no escrow hold was attached
        const fallbackRes = await acceptTaskDeliveryAction(taskId);
        if (fallbackRes.error) {
          setError(res.error);
        }
      }
    });
  }

  if (status === "OPEN" || status === "CANCELLED") {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Task Delivery & Handover</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Peer-to-peer delivery submission and student inspection.
          </p>
        </div>

        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
            status === "ACCEPTED"
              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20"
              : status === "DELIVERED"
              ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
              : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
          }`}
        >
          {status}
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Case 1: Assigned earner delivering work */}
      {status === "ASSIGNED" && isAssignedEarner && (
        <form onSubmit={handleDeliver} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Delivery Notes & File Links</label>
            <textarea
              rows={4}
              required
              minLength={5}
              placeholder="Paste Google Drive/OneDrive links to the formatted document/slides, code files, or summary of work completed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Submitting..." : "Submit Delivery to Student →"}
          </Button>
        </form>
      )}

      {/* Case 2: In progress, waiting for earner */}
      {status === "ASSIGNED" && !isAssignedEarner && (
        <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground text-center">
          {earnerName} is currently working on this task. Once they submit their delivery, you will be able to review and accept it here.
        </div>
      )}

      {/* Case 3: Delivered, awaiting student acceptance */}
      {status === "DELIVERED" && (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-3.5 space-y-1.5">
            <div className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <span>📦</span> Work Delivered by {earnerName}
            </div>
            {deliveryNotes && (
              <p className="text-foreground whitespace-pre-wrap pt-1 font-mono text-[11px] bg-background/50 p-2 rounded border">
                {deliveryNotes}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <span className="text-[11px] text-muted-foreground">
                Please inspect the delivery. If everything looks good, click accept to complete the task.
              </span>
              <Button
                type="button"
                onClick={handleAccept}
                disabled={isPending}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {isPending ? "Accepting..." : "Accept Delivery & Complete Task ✓"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Case 4: Accepted */}
      {status === "ACCEPTED" && (
        <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3.5 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <span className="text-lg">✅</span>
          <div>
            <strong>Task successfully completed!</strong> Both parties have concluded this task.
          </div>
        </div>
      )}
    </div>
  );
}
