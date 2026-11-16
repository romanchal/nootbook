"use client";

import { useState, useTransition } from "react";
import { resolveDisputeAction } from "./actions";
import { formatPaiseToRupees } from "@/lib/money";
import { Button } from "@/components/ui/button";
import type { DisputeStatus, TaskStatus, TaskType } from "@/generated/prisma/client";

export interface DisputeItem {
  id: string;
  status: DisputeStatus;
  reason: string;
  evidence: string | null;
  decision: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  openedBy: {
    id: string;
    name: string;
    email: string | null;
  };
  decidedBy: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  college?: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
    type: TaskType;
    budgetPaise: number;
    status: TaskStatus;
    student: {
      id: string;
      name: string;
      email: string | null;
    };
    earner: {
      id: string;
      name: string;
      email: string | null;
    } | null;
    escrowHold: {
      id: string;
      amountPaise: number;
      status: string;
      paymentId: string;
    } | null;
  };
}

interface DisputesManagerProps {
  disputes: DisputeItem[];
  isSuperAdmin?: boolean;
}

export function DisputesManager({ disputes, isSuperAdmin = false }: DisputesManagerProps) {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);

  // Form state
  const [decision, setDecision] = useState<"REFUND_STUDENT" | "RELEASE_EARNER" | "SPLIT">(
    "REFUND_STUDENT",
  );
  const [decisionNotes, setDecisionNotes] = useState("");
  const [splitStudentRupees, setSplitStudentRupees] = useState<number>(0);
  const [splitEarnerRupees, setSplitEarnerRupees] = useState<number>(0);
  const [issueStrike, setIssueStrike] = useState(false);
  const [strikeTargetUserId, setStrikeTargetUserId] = useState<string>("");
  const [strikeReason, setStrikeReason] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredDisputes = disputes.filter((d) => {
    if (filter === "OPEN") return d.status === "OPEN";
    if (filter === "RESOLVED") return d.status !== "OPEN";
    return true;
  });

  const activeDispute = disputes.find((d) => d.id === resolvingDisputeId);

  function startResolution(dispute: DisputeItem) {
    setResolvingDisputeId(dispute.id);
    setDecision("REFUND_STUDENT");
    setDecisionNotes("");
    const escrowRupees = dispute.task.escrowHold
      ? Math.round(dispute.task.escrowHold.amountPaise / 100)
      : Math.round(dispute.task.budgetPaise / 100);
    setSplitStudentRupees(Math.floor(escrowRupees / 2));
    setSplitEarnerRupees(Math.floor(escrowRupees / 2));
    setIssueStrike(false);
    setStrikeTargetUserId(dispute.task.earner?.id || dispute.task.student.id);
    setStrikeReason("");
    setError(null);
  }

  function handleResolveSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeDispute) return;
    setError(null);

    const formData = new FormData();
    formData.set("disputeId", activeDispute.id);
    formData.set("decision", decision);
    formData.set("decisionNotes", decisionNotes.trim());

    if (decision === "SPLIT") {
      formData.set("splitStudentRupees", String(splitStudentRupees));
      formData.set("splitEarnerRupees", String(splitEarnerRupees));
    }

    if (issueStrike && strikeTargetUserId) {
      formData.set("issueStrikeUserId", strikeTargetUserId);
      formData.set("strikeReason", strikeReason.trim() || "Policy violation in disputed task");
    }

    startTransition(async () => {
      const res = await resolveDisputeAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setResolvingDisputeId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters and Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Button
            type="button"
            size="sm"
            variant={filter === "OPEN" ? "default" : "outline"}
            onClick={() => setFilter("OPEN")}
            className="text-xs"
          >
            Open Disputes ({disputes.filter((d) => d.status === "OPEN").length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "RESOLVED" ? "default" : "outline"}
            onClick={() => setFilter("RESOLVED")}
            className="text-xs"
          >
            Resolved ({disputes.filter((d) => d.status !== "OPEN").length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "ALL" ? "default" : "outline"}
            onClick={() => setFilter("ALL")}
            className="text-xs"
          >
            All ({disputes.length})
          </Button>
        </div>
      </div>

      {/* Disputes Cards List */}
      {filteredDisputes.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No disputes match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((dispute) => {
            const escrowPaise =
              dispute.task.escrowHold?.amountPaise ?? dispute.task.budgetPaise;
            const isDisputeOpen = dispute.status === "OPEN";

            return (
              <div
                key={dispute.id}
                className="rounded-xl border bg-card p-5 space-y-3 text-xs shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {dispute.task.title}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        dispute.status === "OPEN"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : dispute.status === "RESOLVED_REFUND"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                            : "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                      }`}
                    >
                      {dispute.status}
                    </span>
                    {isSuperAdmin && dispute.college && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                        {dispute.college.name}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground">Escrow Held:</span>{" "}
                    <span className="font-bold text-foreground">
                      {formatPaiseToRupees(escrowPaise)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground text-[11px]">
                  <div>
                    <span className="font-semibold text-foreground">Student:</span>{" "}
                    {dispute.task.student.name} ({dispute.task.student.email || "No email"})
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Assigned Earner:</span>{" "}
                    {dispute.task.earner
                      ? `${dispute.task.earner.name} (${dispute.task.earner.email || "No email"})`
                      : "Unassigned"}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Dispute Opened By:</span>{" "}
                    {dispute.openedBy.name}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Filed At:</span>{" "}
                    {new Date(dispute.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                  <span className="font-semibold text-foreground text-[11px] block">
                    Dispute Reason:
                  </span>
                  <p className="text-foreground leading-relaxed">{dispute.reason}</p>
                  {dispute.evidence && (
                    <div className="pt-1">
                      <span className="font-semibold text-foreground text-[11px] block">
                        Evidence / Proof:
                      </span>
                      <p className="text-muted-foreground italic">{dispute.evidence}</p>
                    </div>
                  )}
                </div>

                {dispute.decision && (
                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[11px] text-teal-900 dark:text-teal-300">
                      <span>Resolution Ruling:</span>
                      {dispute.decidedBy && (
                        <span>
                          Decided by {dispute.decidedBy.name} on{" "}
                          {dispute.decidedAt &&
                            new Date(dispute.decidedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                    <p className="text-teal-800 dark:text-teal-200">{dispute.decision}</p>
                  </div>
                )}

                {isDisputeOpen && (
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => startResolution(dispute)}
                      className="text-xs"
                    >
                      Resolve Dispute & Settle Escrow
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Modal / Form Drawer */}
      {activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Resolve Task Dispute: {activeDispute.task.title}
              </h3>
              <button
                type="button"
                onClick={() => setResolvingDisputeId(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-muted-foreground text-[11px]">
              Escrow of{" "}
              <strong className="text-foreground">
                {formatPaiseToRupees(
                  activeDispute.task.escrowHold?.amountPaise ?? activeDispute.task.budgetPaise,
                )}
              </strong>{" "}
              will be distributed via balanced double-entry ledger entries according to your
              ruling.
            </p>

            {error && (
              <div className="rounded-md bg-destructive/15 p-2.5 text-destructive font-medium text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="font-semibold text-foreground block">
                  Select Settlement Decision <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      decision === "REFUND_STUDENT"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="REFUND_STUDENT"
                      checked={decision === "REFUND_STUDENT"}
                      onChange={() => setDecision("REFUND_STUDENT")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-foreground block">
                        Full Refund to Student (100%)
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Earner failed to deliver or breached guidelines. Total escrow is credited
                        back to the student&apos;s wallet balance.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      decision === "RELEASE_EARNER"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="RELEASE_EARNER"
                      checked={decision === "RELEASE_EARNER"}
                      onChange={() => setDecision("RELEASE_EARNER")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-foreground block">
                        Release Payment to Earner
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Earner delivered according to requirements. Escrow is released to earner
                        minus standard platform commission.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      decision === "SPLIT"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="SPLIT"
                      checked={decision === "SPLIT"}
                      onChange={() => setDecision("SPLIT")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-foreground block">
                        Custom Split Settlement
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Partial work delivered or mutual compromise. Allocate specific amounts to
                        each party.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {decision === "SPLIT" && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">
                      Student Refund (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={splitStudentRupees}
                      onChange={(e) => setSplitStudentRupees(Number(e.target.value))}
                      className="w-full rounded-md border bg-background px-3 py-1.5 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">
                      Earner Payout (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={splitEarnerRupees}
                      onChange={(e) => setSplitEarnerRupees(Number(e.target.value))}
                      className="w-full rounded-md border bg-background px-3 py-1.5 text-xs shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="decisionNotes" className="font-semibold text-foreground block">
                  Admin Resolution Ruling & Explanation <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="decisionNotes"
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Explain why this decision was reached (visible to both parties in task logs)..."
                  required
                  minLength={5}
                  maxLength={1000}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Conduct Strike Checkbox */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-900 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={issueStrike}
                    onChange={(e) => setIssueStrike(e.target.checked)}
                    className="rounded"
                  />
                  <span>Issue a Conduct & Safety Strike for policy violation</span>
                </label>

                {issueStrike && (
                  <div className="space-y-2 pt-2 border-t border-amber-500/20 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground block">
                        Strike Target User
                      </label>
                      <select
                        value={strikeTargetUserId}
                        onChange={(e) => setStrikeTargetUserId(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
                      >
                        {activeDispute.task.earner && (
                          <option value={activeDispute.task.earner.id}>
                            Assigned Earner: {activeDispute.task.earner.name}
                          </option>
                        )}
                        <option value={activeDispute.task.student.id}>
                          Student: {activeDispute.task.student.name}
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground block">
                        Reason for Strike
                      </label>
                      <input
                        type="text"
                        value={strikeReason}
                        onChange={(e) => setStrikeReason(e.target.value)}
                        placeholder="e.g. Failure to deliver agreed work, non-compliance with guidelines..."
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-xs shadow-2xs"
                      />
                      <span className="text-[10px] text-muted-foreground block">
                        3 strikes will automatically suspend the user account and freeze their
                        wallet.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResolvingDisputeId(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || decisionNotes.trim().length < 5}
                >
                  {isPending ? "Executing Resolution..." : "Confirm & Settle Escrow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
