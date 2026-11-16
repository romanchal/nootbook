"use client";

import { useState } from "react";
import { AuditLogViewer } from "./audit-log-viewer";
import { ReportsList } from "./reports-list";
import { UsersManager } from "./users-manager";
import { DisputesManager } from "@/features/disputes/disputes-manager";
import type { ComponentProps } from "react";

interface CollegeAdminTabsProps {
  logs: ComponentProps<typeof AuditLogViewer>["logs"];
  reports: ComponentProps<typeof ReportsList>["reports"];
  users: ComponentProps<typeof UsersManager>["users"];
  disputes: ComponentProps<typeof DisputesManager>["disputes"];
  deptCount: number;
}

export function CollegeAdminTabs({
  logs,
  reports,
  users,
  disputes,
  deptCount,
}: CollegeAdminTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "USERS" | "REPORTS" | "DISPUTES" | "AUDIT"
  >("OVERVIEW");

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;
  const classAdminsCount = users.filter((u) =>
    u.roles.some((r) => r.name === "CLASS_ADMIN"),
  ).length;

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
          Campus Overview
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
          Students & Class Admins ({users.length})
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
          Reports & Flags
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
          Task Disputes & Escrow
          {openDisputesCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
              {openDisputesCount}
            </span>
          )}
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
          Campus Audit Log ({logs.length})
        </button>
      </div>

      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Departments</span>
              <p className="mt-1 text-2xl font-bold">{deptCount}</p>
              <span className="text-xs text-muted-foreground">Engineering branches</span>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Class Admins</span>
              <p className="mt-1 text-2xl font-bold text-amber-500">{classAdminsCount}</p>
              <span className="text-xs text-muted-foreground">Assigned division moderators</span>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <span className="text-xs text-muted-foreground">Campus Reports</span>
              <p className="mt-1 text-2xl font-bold text-rose-500">{openReportsCount}</p>
              <span className="text-xs text-muted-foreground">Awaiting review</span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Campus Actions</h3>
            <p className="text-xs text-muted-foreground">
              Audit log of student verifications, role updates, and moderation actions within this college.
            </p>
            <AuditLogViewer logs={logs.slice(0, 5)} />
          </div>
        </div>
      )}

      {activeTab === "USERS" && <UsersManager users={users} isSuperAdmin={false} />}

      {activeTab === "REPORTS" && <ReportsList reports={reports} />}

      {activeTab === "DISPUTES" && <DisputesManager disputes={disputes} />}

      {activeTab === "AUDIT" && <AuditLogViewer logs={logs} />}
    </div>
  );
}
