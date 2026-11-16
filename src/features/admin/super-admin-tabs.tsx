"use client";

import { useState } from "react";
import { AuditLogViewer } from "./audit-log-viewer";
import { ReportsList } from "./reports-list";
import { UsersManager } from "./users-manager";
import { CommissionManager } from "./commission-manager";
import { CollegesManager } from "./colleges-manager";
import { DisputesManager } from "@/features/disputes/disputes-manager";
import type { ComponentProps } from "react";

interface SuperAdminTabsProps {
  logs: ComponentProps<typeof AuditLogViewer>["logs"];
  reports: ComponentProps<typeof ReportsList>["reports"];
  users: ComponentProps<typeof UsersManager>["users"];
  colleges: ComponentProps<typeof CollegesManager>["colleges"];
  disputes: ComponentProps<typeof DisputesManager>["disputes"];
  commissionConfig: {
    commissionBps: number;
    fixedFeePaise: number;
  };
}

export function SuperAdminTabs({
  logs,
  reports,
  users,
  colleges,
  disputes,
  commissionConfig,
}: SuperAdminTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "REPORTS" | "DISPUTES" | "USERS" | "FINANCE" | "COLLEGES" | "AUDIT"
  >("OVERVIEW");

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "OVERVIEW"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Overview
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
          Reports & Moderation
          {openReportsCount > 0 && (
            <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
              {openReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DISPUTES")}
          className={`relative rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "DISPUTES"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Disputes & Escrow
          {openDisputesCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
              {openDisputesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("USERS")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "USERS"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Users & Roles ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FINANCE")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "FINANCE"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Commission & Finance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COLLEGES")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "COLLEGES"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Colleges ({colleges.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeTab === "AUDIT"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Active Campuses</span>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {colleges.filter((c) => c.active).length}
              </p>
              <span className="text-xs text-muted-foreground">{colleges.length} registered</span>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Commission Setting</span>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {(commissionConfig.commissionBps / 100).toFixed(1)}%
              </p>
              <span className="text-xs text-muted-foreground">
                + ₹{commissionConfig.fixedFeePaise / 100} payer fee
              </span>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Open Reports</span>
              <p className="mt-1 text-2xl font-bold text-rose-500">{openReportsCount}</p>
              <span className="text-xs text-muted-foreground">Awaiting moderation</span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Platform Activity Feed</h3>
            <p className="text-xs text-muted-foreground">
              Recent administrative mutations across colleges recorded in the tamper-evident audit ledger.
            </p>
            <AuditLogViewer logs={logs.slice(0, 5)} />
          </div>
        </div>
      )}

      {activeTab === "REPORTS" && <ReportsList reports={reports} />}

      {activeTab === "DISPUTES" && (
        <DisputesManager disputes={disputes} isSuperAdmin={true} />
      )}

      {activeTab === "USERS" && <UsersManager users={users} isSuperAdmin={true} />}

      {activeTab === "FINANCE" && (
        <CommissionManager
          initialBps={commissionConfig.commissionBps}
          initialFixedPaise={commissionConfig.fixedFeePaise}
        />
      )}

      {activeTab === "COLLEGES" && <CollegesManager colleges={colleges} />}

      {activeTab === "AUDIT" && <AuditLogViewer logs={logs} />}
    </div>
  );
}
