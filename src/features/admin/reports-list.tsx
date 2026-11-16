"use client";

import { useState, useTransition } from "react";
import { resolveReportAction } from "./actions";
import { Button } from "@/components/ui/button";
import type { ReportStatus } from "@/generated/prisma/client";

interface ReportItem {
  id: string;
  reason: string;
  status: ReportStatus;
  note: string | null;
  createdAt: Date;
  reportedBy: {
    id: string;
    name: string;
    email: string | null;
  };
  resolvedBy: {
    id: string;
    name: string;
  } | null;
  college: {
    name: string;
    slug: string;
  };
  resource: {
    id: string;
    title: string;
    type: string;
    status: string;
    fileName: string;
    department: { name: string; code: string };
    subject: { name: string; code: string | null };
    uploader: { id: string; name: string };
  } | null;
}

export function ReportsList({ reports }: { reports: ReportItem[] }) {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");
  const [isPending, startTransition] = useTransition();
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  const filteredReports = reports.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return r.status === "OPEN";
    return r.status !== "OPEN";
  });

  function handleAction(reportId: string, status: "RESOLVED" | "DISMISSED", takedown: boolean) {
    startTransition(async () => {
      const res = await resolveReportAction({
        reportId,
        status,
        note: adminNote.trim() || undefined,
        takedownResource: takedown,
      });

      if (res.error) {
        alert(res.error);
      } else {
        setActiveReportId(null);
        setAdminNote("");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter("OPEN")}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            filter === "OPEN"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Open Reports ({reports.filter((r) => r.status === "OPEN").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("RESOLVED")}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            filter === "RESOLVED"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Resolved / Dismissed ({reports.filter((r) => r.status !== "OPEN").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            filter === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({reports.length})
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reports found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isActing = activeReportId === report.id;
            const isOpen = report.status === "OPEN";

            return (
              <div
                key={report.id}
                className="rounded-xl border bg-card p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        report.status === "OPEN"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : report.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {report.college.name}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    Reported {new Date(report.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                {/* Reason & Content */}
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="font-semibold text-foreground">Report Reason:</span>
                  <p className="text-muted-foreground">{report.reason}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Reported by: <strong>{report.reportedBy.name}</strong> ({report.reportedBy.email ?? report.reportedBy.id})
                  </p>
                </div>

                {/* Associated Resource */}
                {report.resource && (
                  <div className="rounded-lg border p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {report.resource.title}
                      </span>
                      <span className="font-mono text-[11px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                        Status: {report.resource.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {report.resource.department.name} · {report.resource.subject.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Uploader: {report.resource.uploader.name}
                    </p>
                  </div>
                )}

                {/* Resolution note if already resolved */}
                {report.note && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border">
                    <strong>Admin Note:</strong> {report.note}{" "}
                    {report.resolvedBy && `(by ${report.resolvedBy.name})`}
                  </div>
                )}

                {/* Action Buttons for Open Reports */}
                {isOpen && (
                  <div className="space-y-2 border-t pt-3">
                    {isActing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Optional admin note explaining resolution..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="h-8 w-full rounded border bg-background px-2.5 text-xs"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleAction(report.id, "RESOLVED", true)}
                          >
                            Resolve & Takedown Resource
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={isPending}
                            onClick={() => handleAction(report.id, "RESOLVED", false)}
                          >
                            Resolve (Keep Resource)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleAction(report.id, "DISMISSED", false)}
                          >
                            Dismiss Report
                          </Button>
                          <button
                            type="button"
                            onClick={() => setActiveReportId(null)}
                            className="text-xs text-muted-foreground hover:underline ml-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveReportId(report.id);
                          setAdminNote("");
                        }}
                      >
                        Resolve Report →
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
