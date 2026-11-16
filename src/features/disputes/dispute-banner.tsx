import type { DisputeStatus } from "@/generated/prisma/client";

interface DisputeBannerProps {
  dispute: {
    id: string;
    status: DisputeStatus;
    reason: string;
    evidence?: string | null;
    decision?: string | null;
    createdAt: Date;
    decidedAt?: Date | null;
    openedBy: {
      id: string;
      name: string;
    };
    decidedBy?: {
      id: string;
      name: string;
    } | null;
  };
}

export function DisputeBanner({ dispute }: DisputeBannerProps) {
  const isResolved =
    dispute.status === "RESOLVED_REFUND" ||
    dispute.status === "RESOLVED_RELEASE" ||
    dispute.status === "CLOSED";

  return (
    <div
      className={`rounded-xl border p-4 text-xs space-y-3 shadow-2xs ${
        dispute.status === "OPEN"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200"
          : dispute.status === "RESOLVED_REFUND"
            ? "border-blue-500/40 bg-blue-500/10 text-blue-950 dark:text-blue-200"
            : "border-teal-500/40 bg-teal-500/10 text-teal-950 dark:text-teal-200"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/15 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">
            {dispute.status === "OPEN" ? "⚖️" : isResolved ? "✅" : "⚠️"}
          </span>
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {dispute.status === "OPEN"
              ? "Formal Dispute Open — College Admin Mediation Active"
              : dispute.status === "RESOLVED_REFUND"
                ? "Dispute Resolved — 100% Refunded to Student"
                : dispute.status === "RESOLVED_RELEASE"
                  ? "Dispute Resolved — Payment Released to Earner"
                  : "Dispute Settled & Closed"}
          </span>
        </div>

        <span className="text-[11px] opacity-80">
          Filed on {new Date(dispute.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
        </span>
      </div>

      <div className="space-y-1.5 leading-relaxed">
        <div>
          <span className="font-semibold">Filed by:</span> {dispute.openedBy.name}
        </div>
        <div>
          <span className="font-semibold">Reason:</span> {dispute.reason}
        </div>
        {dispute.evidence && (
          <div>
            <span className="font-semibold">Evidence / Proof:</span>{" "}
            <span className="italic">{dispute.evidence}</span>
          </div>
        )}
      </div>

      {isResolved && (
        <div className="mt-2 rounded-lg bg-background/50 p-3 border border-current/20 space-y-1">
          <div className="flex items-center justify-between font-semibold text-[11px]">
            <span>Admin Resolution Decision:</span>
            {dispute.decidedBy && (
              <span>
                Decided by {dispute.decidedBy.name}
                {dispute.decidedAt &&
                  ` on ${new Date(dispute.decidedAt).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}`}
              </span>
            )}
          </div>
          <p className="text-foreground text-xs">{dispute.decision}</p>
        </div>
      )}
    </div>
  );
}
