"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  AlertTriangle,
  Scale,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  Download,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  ShadcnAdminLayout,
  type AdminTabItem,
} from "@/components/admin/shadcn-admin-layout";
import { AuditLogViewer } from "./audit-log-viewer";
import { ReportsList } from "./reports-list";
import { UsersManager } from "./users-manager";
import { DisputesManager } from "@/features/disputes/disputes-manager";
import { PBCOE_PAPERS } from "@/features/library/pbcoe-exam-papers-data";
import { ExamPaperModalTrigger } from "@/features/library/exam-paper-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComponentProps } from "react";

interface CollegeAdminTabsProps {
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
  disputes: ComponentProps<typeof DisputesManager>["disputes"];
  departments: Array<{
    id: string;
    name: string;
    code: string;
    slug?: string;
    active: boolean;
    semesters?: number;
    _count?: { subjects: number; resources: number };
  }>;
}

const DEPT_FALLBACK = [
  { code: "AI", name: "Artificial Intelligence", active: true, semesters: 8, slug: "ai" },
  { code: "CSE", name: "Computer Science and Engineering", active: false, semesters: 8, slug: "cse" },
  { code: "IT", name: "Information Technology", active: false, semesters: 8, slug: "it" },
  { code: "EE", name: "Electrical Engineering", active: false, semesters: 8, slug: "ee" },
  { code: "ECE", name: "Electronics & Communication", active: false, semesters: 8, slug: "ece" },
  { code: "ETC", name: "Electronics & Telecommunication", active: false, semesters: 8, slug: "etc" },
  { code: "CIVIL", name: "Civil Engineering", active: false, semesters: 8, slug: "civil" },
  { code: "MECH", name: "Mechanical Engineering", active: false, semesters: 8, slug: "mech" },
];

export function CollegeAdminTabs({
  user,
  logs,
  reports,
  users,
  disputes,
  departments,
}: CollegeAdminTabsProps) {
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;
  const classAdminsCount = users.filter((u) =>
    u.roles.some((r) => r.name === "CLASS_ADMIN")
  ).length;

  const depts = departments.length > 0 ? departments : DEPT_FALLBACK;
  const papersList = Object.values(PBCOE_PAPERS);

  const tabs: AdminTabItem[] = [
    {
      id: "OVERVIEW",
      label: "Campus Overview",
      icon: LayoutDashboard,
      group: "CAMPUS",
    },
    {
      id: "BRANCHES",
      label: "8 Engineering Branches",
      icon: GraduationCap,
      badge: depts.length,
      group: "CAMPUS",
    },
    {
      id: "PAPERS",
      label: "Exam Papers (Sem 3)",
      icon: BookOpen,
      badge: papersList.length,
      group: "CAMPUS",
    },
    {
      id: "USERS",
      label: "Students & Admins",
      icon: Users,
      badge: users.length,
      group: "GOVERNANCE",
    },
    {
      id: "REPORTS",
      label: "Reports & Flags",
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
      id: "AUDIT",
      label: "Immutable Audit Log",
      icon: History,
      badge: logs.length,
      group: "SYSTEM",
    },
  ];

  return (
    <ShadcnAdminLayout
      user={user}
      type="COLLEGE"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      stats={{
        deptCount: depts.length,
        usersCount: users.length,
        classAdminsCount,
        openReportsCount,
        openDisputesCount,
        auditLogsCount: logs.length,
      }}
    >
      {/* ======================================================== */}
      {/* 1. OVERVIEW DASHBOARD VIEW                               */}
      {/* ======================================================== */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Campus Dashboard Overview
              </h2>
              <p className="text-xs text-slate-500">
                Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("USERS")}
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                + Assign Class Admin
              </button>
              <button
                onClick={() => setActiveTab("PAPERS")}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                Inspect Papers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Department & Papers Status */}
            <div className="lg:col-span-7 space-y-6">
              {/* Engineering Branches Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Autonomous Engineering Departments</CardTitle>
                    <CardDescription>
                      8 branches configured for autonomous curriculum &amp; library
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("BRANCHES")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All →
                  </button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {depts.slice(0, 6).map((dept) => (
                      <div
                        key={dept.code}
                        className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {dept.code}
                          </span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {dept.name}
                          </span>
                        </div>
                        {dept.active ? (
                          <Badge variant="success" className="text-[10px]">
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-slate-400">
                            Review
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Official Semester 3 Papers Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Semester 3 Exam Papers Repository</CardTitle>
                    <CardDescription>
                      Official Term I &amp; II papers with Bloom&apos;s Taxonomy breakdown
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("PAPERS")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Manage 7 Papers →
                  </button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    {papersList.slice(0, 3).map((paper) => (
                      <div
                        key={paper.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {paper.courseCode}
                            </span>
                            <Badge variant={paper.term === "Term I" ? "info" : "secondary"}>
                              {paper.term}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {paper.courseName}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-600">
                            {paper.maxMarks} Marks
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {paper.duration}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 Columns: Recent Audit & Activity */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Recent Campus Audit Activity</CardTitle>
                    <CardDescription>
                      Last 5 security &amp; moderation logs
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("AUDIT")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Full Log →
                  </button>
                </CardHeader>
                <CardContent>
                  <AuditLogViewer logs={logs.slice(0, 5)} />
                </CardContent>
              </Card>

              {/* Quick Escrow & Dispute Alert */}
              <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 border-blue-200/80 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm">Campus Double-Entry Escrow</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p>
                    All marketplace transactions for PBCOE students are held in isolated double-entry escrow.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-slate-800 text-[11px] font-bold">
                    <span>Active Disputes: {openDisputesCount}</span>
                    <button
                      onClick={() => setActiveTab("DISPUTES")}
                      className="text-blue-600 hover:underline"
                    >
                      Resolve Disputes →
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. 8 ENGINEERING BRANCHES MANAGEMENT VIEW                */}
      {/* ======================================================== */}
      {activeTab === "BRANCHES" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                PBCOE Engineering Branches (8 Departments)
              </h2>
              <p className="text-xs text-slate-500">
                Control branch visibility, semester curricula, and exam papers
              </p>
            </div>
            <Link
              href="/library/ai"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <span>Explore AI Live Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Semesters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depts.map((dept) => (
                  <TableRow key={dept.code}>
                    <TableCell className="font-mono font-bold text-blue-600">
                      {dept.code}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {dept.name}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {dept.semesters ?? 8} Semesters Available
                    </TableCell>
                    <TableCell>
                      {dept.active ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active / Live</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>Under Autonomous Review</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {dept.active ? (
                        <Link
                          href={`/library/${dept.slug || dept.code.toLowerCase()}`}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Open Library →
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400">Curriculum Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. OFFICIAL SEMESTER 3 EXAM PAPERS REPOSITORY VIEW       */}
      {/* ======================================================== */}
      {activeTab === "PAPERS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Official Semester 3 Exam Papers Repository (7 Papers)
              </h2>
              <p className="text-xs text-slate-500">
                Priyadarshini Bhagwati College of Engineering Autonomous Session 2026-27
              </p>
            </div>
            <a
              href="/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Consolidated PDF</span>
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Marks &amp; Duration</TableHead>
                  <TableHead>Document No.</TableHead>
                  <TableHead className="text-right">Inspect &amp; Print</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papersList.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-mono font-bold text-blue-600">
                      {paper.courseCode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {paper.courseName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paper.term === "Term I" ? "info" : "secondary"}>
                        {paper.term}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-blue-600">{paper.maxMarks} Marks</span>
                      <span className="text-[11px] block">{paper.duration}</span>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-500">
                      {paper.docNumber}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <ExamPaperModalTrigger
                        paperId={paper.id}
                        buttonLabel="Sheet"
                      />
                      <Link
                        href={`/library/paper/${paper.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STUDENTS & CLASS ADMINS MANAGEMENT                     */}
      {/* ======================================================== */}
      {activeTab === "USERS" && (
        <UsersManager users={users} isSuperAdmin={false} />
      )}

      {/* ======================================================== */}
      {/* 5. REPORTS & CONTENT FLAGS                                */}
      {/* ======================================================== */}
      {activeTab === "REPORTS" && (
        <ReportsList reports={reports} />
      )}

      {/* ======================================================== */}
      {/* 6. TASK DISPUTES & ESCROW SETTLEMENT                      */}
      {/* ======================================================== */}
      {activeTab === "DISPUTES" && (
        <DisputesManager disputes={disputes} />
      )}

      {/* ======================================================== */}
      {/* 7. IMMUTABLE CAMPUS AUDIT LOG TRAIL                       */}
      {/* ======================================================== */}
      {activeTab === "AUDIT" && (
        <AuditLogViewer logs={logs} />
      )}
    </ShadcnAdminLayout>
  );
}
