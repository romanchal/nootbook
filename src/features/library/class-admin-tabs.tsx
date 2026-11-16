"use client";

import { useState } from "react";
import { PendingQueueItem } from "./pending-queue-item";
import { ReportsList } from "@/features/admin/reports-list";
import { AuditLogViewer } from "@/features/admin/audit-log-viewer";
import type { ComponentProps } from "react";

interface ClassAdminTabsProps {
  queue: ComponentProps<typeof PendingQueueItem>["resource"][];
  reports: ComponentProps<typeof ReportsList>["reports"];
  logs: ComponentProps<typeof AuditLogViewer>["logs"];
}

export function ClassAdminTabs({ queue, reports, logs }: ClassAdminTabsProps) {
  const [activeTab, setActiveTab] = useState<"QUEUE" | "REPORTS" | "LOGS">("QUEUE");

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Tab Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("QUEUE")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "QUEUE"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Pending Queue ({queue.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REPORTS")}
          className={`relative rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "REPORTS"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Reported Content
          {openReportsCount > 0 && (
            <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
              {openReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LOGS")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "LOGS"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          My Moderation History ({logs.length})
        </button>
      </div>

      {activeTab === "QUEUE" && (
        <section className="space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Review queue is empty!</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                All student uploads have been reviewed. New papers submitted by classmates will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map((res) => (
                <PendingQueueItem key={res.id} resource={res} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "REPORTS" && <ReportsList reports={reports} />}

      {activeTab === "LOGS" && <AuditLogViewer logs={logs} />}
    </div>
  );
}
