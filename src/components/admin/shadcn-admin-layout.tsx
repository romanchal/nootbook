"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Scale,
  History,
  Building2,
  Coins,
  PanelLeft,
  Search,
  ExternalLink,
  ChevronDown,
  LogOut,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface AdminTabItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeColor?: "default" | "destructive" | "warning" | "info";
  group: "CAMPUS" | "GOVERNANCE" | "SYSTEM";
}

interface ShadcnAdminLayoutProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    collegeName?: string | null;
    collegeCity?: string | null;
    roles?: { name: string }[];
  };
  type: "COLLEGE" | "SUPER";
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: AdminTabItem[];
  stats: {
    deptCount?: number;
    usersCount?: number;
    classAdminsCount?: number;
    openReportsCount?: number;
    openDisputesCount?: number;
    auditLogsCount?: number;
    collegesCount?: number;
  };
  children: React.ReactNode;
}

export function ShadcnAdminLayout({
  user,
  type,
  activeTab,
  onTabChange,
  tabs,
  stats,
  children,
}: ShadcnAdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [teamSwitcherOpen, setTeamSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSuper = user.roles?.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles?.some((r) =>
    ["COLLEGE_ADMIN", "DEPARTMENT_ADMIN", "SUPER_ADMIN"].includes(r.name)
  );

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter tabs if search is active
  const filteredTabs = searchQuery.trim()
    ? tabs.filter((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs;

  const campusTabs = filteredTabs.filter((t) => t.group === "CAMPUS");
  const governanceTabs = filteredTabs.filter((t) => t.group === "GOVERNANCE");
  const systemTabs = filteredTabs.filter((t) => t.group === "SYSTEM");

  // User initials
  const initials = (user.name || user.email || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR                                           */}
      {/* ============================================================ */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Team / Campus Switcher Header */}
        <div className="relative p-3 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setTeamSwitcherOpen(!teamSwitcherOpen)}
            className={`w-full flex items-center justify-between gap-2.5 rounded-xl p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              !sidebarOpen ? "justify-center p-1.5" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-xs ${
                  type === "COLLEGE"
                    ? "bg-gradient-to-tr from-blue-700 to-blue-500 shadow-blue-500/20"
                    : "bg-gradient-to-tr from-indigo-700 to-purple-600 shadow-purple-500/20"
                }`}
              >
                {type === "COLLEGE" ? "🏛️" : "👑"}
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {type === "COLLEGE" ? "PBCOE Autonomous" : "Nootbook Super Console"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {type === "COLLEGE" ? "Nagpur Engineering" : "Platform Governance"}
                  </div>
                </div>
              )}
            </div>
            {sidebarOpen && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
          </button>

          {/* Team Switcher Dropdown */}
          {teamSwitcherOpen && (
            <div className="absolute top-full left-2 right-2 mt-1 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Admin Console Workspaces
              </div>
              <Link
                href="/admin/college"
                onClick={() => setTeamSwitcherOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${
                  type === "COLLEGE"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🏛️</span>
                <div>
                  <div>PBCOE College Admin</div>
                  <div className="text-[10px] font-normal text-slate-500">Autonomous campus operations</div>
                </div>
              </Link>
              {isSuper && (
                <Link
                  href="/admin/super"
                  onClick={() => setTeamSwitcherOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors mt-1 ${
                    type === "SUPER"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>👑</span>
                  <div>
                    <div>Platform Super Admin</div>
                    <div className="text-[10px] font-normal text-slate-500">Global system &amp; ledger</div>
                  </div>
                </Link>
              )}
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <Link
                href="/library"
                onClick={() => setTeamSwitcherOpen(false)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>📚</span>
                <span>Open Student Library</span>
              </Link>
              <Link
                href="/tasks"
                onClick={() => setTeamSwitcherOpen(false)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>💼</span>
                <span>Open Task Marketplace</span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {/* Group 1: Campus Operations */}
          {campusTabs.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Campus Operations
                </div>
              )}
              {campusTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    title={!sidebarOpen ? tab.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="flex-1 text-left truncate">{tab.label}</span>}
                    {sidebarOpen && tab.badge !== undefined && tab.badge > 0 && (
                      <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Group 2: Governance & Community */}
          {governanceTabs.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Governance &amp; Users
                </div>
              )}
              {governanceTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    title={!sidebarOpen ? tab.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="flex-1 text-left truncate">{tab.label}</span>}
                    {sidebarOpen && tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold text-white ${
                          tab.badgeColor === "destructive"
                            ? "bg-rose-500"
                            : tab.badgeColor === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Group 3: System & Security */}
          {systemTabs.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  System &amp; Audit
                </div>
              )}
              {systemTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    title={!sidebarOpen ? tab.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    } ${!sidebarOpen ? "justify-center px-2" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="flex-1 text-left truncate">{tab.label}</span>}
                    {sidebarOpen && tab.badge !== undefined && tab.badge > 0 && (
                      <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
          <div
            className={`flex items-center gap-2.5 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 ${
              !sidebarOpen ? "justify-center p-1.5" : ""
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              {initials}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name || user.email || "Admin"}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="info" className="px-1.5 py-0 text-[9px] font-bold">
                    {type === "COLLEGE" ? "COLLEGE_ADMIN" : "SUPER_ADMIN"}
                  </Badge>
                </div>
              </div>
            )}
            {sidebarOpen && (
              <form action={signOut}>
                <button
                  type="submit"
                  title="Sign out"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE DRAWER SIDEBAR                                     */}
      {/* ============================================================ */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-white dark:bg-slate-900 p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                <span>{type === "COLLEGE" ? "🏛️" : "👑"}</span>
                <span>{type === "COLLEGE" ? "PBCOE College Admin" : "Super Admin"}</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT CONTAINER                                    */}
      {/* ============================================================ */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? "md:pl-64" : "md:pl-16"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar (Ctrl+B)"
              className="hidden md:inline-flex items-center justify-center rounded-xl p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            >
              <PanelLeft className="h-5 w-5" />
            </button>

            <Separator orientation="vertical" className="h-5 hidden md:block" />

            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {type === "COLLEGE" ? "College Admin (PBCOE)" : "Platform Super Admin"}
              </span>
            </nav>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Switcher Button between College & Super Admin */}
            {isSuper && (
              <Link
                href={type === "COLLEGE" ? "/admin/super" : "/admin/college"}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors shadow-2xs ${
                  type === "COLLEGE"
                    ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                    : "border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                }`}
              >
                <span>{type === "COLLEGE" ? "👑" : "🏛️"}</span>
                <span>{type === "COLLEGE" ? "Open Super Admin" : "Open College Admin"}</span>
              </Link>
            )}

            <Link
              href="/library"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              <span>View Library</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Hero Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs ${
                    type === "COLLEGE" ? "bg-blue-700" : "bg-indigo-700"
                  }`}
                >
                  {type === "COLLEGE" ? "🏛️ PBCOE Autonomous Space" : "👑 Global System Control"}
                </span>
                <span className="text-xs text-slate-500">{user.collegeName}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {type === "COLLEGE"
                  ? "College Administration Console"
                  : "Nootbook Super Console"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {type === "COLLEGE"
                  ? "Manage 8 engineering branches (AI active), verify Semester 3 exam papers with Bloom's criteria, appoint class admins, and resolve escrow disputes."
                  : "Platform governance: cross-college multi-tenancy, dispute escalation, platform commission parameters, and immutable security audit trails."}
              </p>
            </div>
          </div>

          {/* Signature Shadcn-Admin KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Departments */}
            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Engineering Branches
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.deptCount ?? 8}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Branch Active · 7 in Review</span>
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Students & Class Admins */}
            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {type === "COLLEGE" ? "Campus Students" : "Platform Users"}
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.usersCount ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {stats.classAdminsCount ?? 0} Class Admins assigned
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Reports & Flags */}
            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Open Reports
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.openReportsCount ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Awaiting faculty review
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Disputes in Escrow */}
            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Task Disputes
                </CardTitle>
                <Scale className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.openDisputesCount ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Locked in double-entry escrow
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tab Content */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
