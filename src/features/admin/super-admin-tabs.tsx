"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Scale,
  Coins,
  History,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  ShadcnAdminLayout,
  type AdminTabItem,
} from "@/components/admin/shadcn-admin-layout";
import { AuditLogViewer } from "./audit-log-viewer";
import { ReportsList } from "./reports-list";
import { UsersManager } from "./users-manager";
import { CommissionManager } from "./commission-manager";
import { CollegesManager } from "./colleges-manager";
import { DisputesManager } from "@/features/disputes/disputes-manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComponentProps } from "react";

interface SuperAdminTabsProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    collegeName?: string | null;
    collegeCity?: string | null;
    roles?: { name: string }[];
  };
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
  user,
  logs,
  reports,
  users,
  colleges,
  disputes,
  commissionConfig,
}: SuperAdminTabsProps) {
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;

  const tabs: AdminTabItem[] = [
    {
      id: "OVERVIEW",
      label: "Platform Overview",
      icon: LayoutDashboard,
      group: "CAMPUS",
    },
    {
      id: "COLLEGES",
      label: "Colleges & Tenants",
      icon: Building2,
      badge: colleges.length,
      group: "CAMPUS",
    },
    {
      id: "USERS",
      label: "Global Users & Roles",
      icon: Users,
      badge: users.length,
      group: "GOVERNANCE",
    },
    {
      id: "REPORTS",
      label: "Reports & Moderation",
      icon: AlertTriangle,
      badge: openReportsCount,
      badgeColor: "destructive",
      group: "GOVERNANCE",
    },
    {
      id: "DISPUTES",
      label: "Disputes & Escrow",
      icon: Scale,
      badge: openDisputesCount,
      badgeColor: "warning",
      group: "GOVERNANCE",
    },
    {
      id: "FINANCE",
      label: "Commission & Ledger",
      icon: Coins,
      group: "SYSTEM",
    },
    {
      id: "AUDIT",
      label: "System Audit Trail",
      icon: History,
      badge: logs.length,
      group: "SYSTEM",
    },
  ];

  return (
    <ShadcnAdminLayout
      user={user}
      type="SUPER"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      stats={{
        deptCount: colleges.length,
        usersCount: users.length,
        openReportsCount,
        openDisputesCount,
        auditLogsCount: logs.length,
        collegesCount: colleges.length,
      }}
    >
      {/* ======================================================== */}
      {/* 1. PLATFORM OVERVIEW DASHBOARD VIEW                      */}
      {/* ======================================================== */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Platform Super Console Overview
              </h2>
              <p className="text-xs text-slate-500">
                Multi-college infrastructure, escrow audits, and system security
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/college"
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                🏛️ Open PBCOE Campus Admin
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Colleges & Commission Summary */}
            <div className="lg:col-span-7 space-y-6">
              {/* Colleges Registry Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Registered Campus Tenants</CardTitle>
                    <CardDescription>
                      {colleges.length} active college institutions
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("COLLEGES")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Manage Colleges →
                  </button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {colleges.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {col.name}
                          </span>
                          <Badge variant="info">{col.city}</Badge>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Slug: /{col.slug}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {col._count.departments} Departments
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {col._count.users} Users
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Commission Config Quick Glance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Marketplace Commission Parameters</CardTitle>
                    <CardDescription>
                      Double-entry fee deductions on completed student tasks
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("FINANCE")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Edit Commission →
                  </button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                    <span className="text-xs text-slate-500">Platform Commission</span>
                    <div className="font-heading text-2xl font-extrabold text-blue-600 mt-1">
                      {commissionConfig.commissionBps / 100}%
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {commissionConfig.commissionBps} basis points
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                    <span className="text-xs text-slate-500">Fixed Platform Fee</span>
                    <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      ₹{(commissionConfig.fixedFeePaise / 100).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      per completed escrow task
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 Columns: Global Activity & Security */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>System Audit Stream</CardTitle>
                    <CardDescription>Latest platform-wide actions</CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("AUDIT")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All →
                  </button>
                </CardHeader>
                <CardContent>
                  <AuditLogViewer logs={logs.slice(0, 5)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. COLLEGES & TENANTS VIEW                                */}
      {/* ======================================================== */}
      {activeTab === "COLLEGES" && (
        <CollegesManager colleges={colleges} />
      )}

      {/* ======================================================== */}
      {/* 3. GLOBAL USERS & ROLES VIEW                             */}
      {/* ======================================================== */}
      {activeTab === "USERS" && (
        <UsersManager users={users} isSuperAdmin={true} />
      )}

      {/* ======================================================== */}
      {/* 4. REPORTS & CONTENT MODERATION VIEW                     */}
      {/* ======================================================== */}
      {activeTab === "REPORTS" && (
        <ReportsList reports={reports} />
      )}

      {/* ======================================================== */}
      {/* 5. DISPUTES & ESCROW SETTLEMENT VIEW                     */}
      {/* ======================================================== */}
      {activeTab === "DISPUTES" && (
        <DisputesManager disputes={disputes} />
      )}

      {/* ======================================================== */}
      {/* 6. COMMISSION & FINANCIAL LEDGER VIEW                    */}
      {/* ======================================================== */}
      {activeTab === "FINANCE" && (
        <CommissionManager
          initialBps={commissionConfig.commissionBps}
          initialFixedPaise={commissionConfig.fixedFeePaise}
        />
      )}

      {/* ======================================================== */}
      {/* 7. IMMUTABLE PLATFORM AUDIT LOG VIEW                     */}
      {/* ======================================================== */}
      {activeTab === "AUDIT" && (
        <AuditLogViewer logs={logs} />
      )}
    </ShadcnAdminLayout>
  );
}
