"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/features/auth/actions";

interface NavUserProps {
  id: string;
  name?: string | null;
  email?: string | null;
  collegeName?: string | null;
  collegeCity?: string | null;
  roles?: { name: string }[];
}

interface AppNavbarProps {
  user: NavUserProps;
}

export function AppNavbar({ user }: AppNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles = user.roles || [];
  const isEarner = roles.some((r) => r.name === "EARNER" || r.name === "SUPER_ADMIN" || r.name === "COLLEGE_ADMIN");
  const isAdmin = roles.some((r) => ["CLASS_ADMIN", "DEPARTMENT_ADMIN", "COLLEGE_ADMIN", "SUPER_ADMIN"].includes(r.name));

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/library", label: "Library", icon: "📚" },
    { href: "/tasks", label: "Marketplace", icon: "💼" },
    { href: "/tasks/my", label: "My Tasks", icon: "📋", isMy: true },
    { href: "/wallet", label: "Wallet", icon: "💰" },
    ...(isEarner ? [{ href: "/earner", label: "Earner Hub", icon: "⚡" }] : []),
    ...(isAdmin ? [{ href: "/admin/college", label: "Admin", icon: "🛡️" }] : []),
  ];

  // Generate initials from name or email
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo & Campus Badge */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <span className="text-lg">📖</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-foreground text-base sm:text-lg">
                    Nootbook
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Pilot
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:block truncate max-w-[160px]">
                  {user.collegeName || "Nagpur Campus"}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href) && (link.href !== "/tasks" || pathname === "/tasks"));
              const isMyTasks = link.href === "/tasks/my";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : isMyTasks
                      ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-700"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                  {isMyTasks && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Action & User Menu */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/tasks/new"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 hover:shadow-sm transition-all"
            >
              <span>+</span>
              <span>Post Task</span>
            </Link>

            {/* User Chip */}
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 py-1 pl-1 pr-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:inline-block max-w-[120px] truncate">
                {user.name?.split(" ")[0] || "Student"}
              </span>
              <form action={signOut} className="inline-block">
                <button
                  type="submit"
                  title="Sign out"
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            <div className="pb-2 mb-2 border-b border-border/60">
              <p className="text-xs font-semibold text-foreground">{user.name || "Student"}</p>
              <p className="text-[11px] text-muted-foreground">{user.email}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                {user.collegeName || "Nagpur Campus"}
              </p>
            </div>

            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href) && (link.href !== "/tasks" || pathname === "/tasks"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {link.isMy && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                      My Space
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between">
              <Link
                href="/tasks/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
              >
                <span>✨ Post New Task</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs text-destructive hover:underline font-medium"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (App Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/90 backdrop-blur-xl px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              pathname === "/dashboard" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <span className="text-base">🏠</span>
            <span>Home</span>
          </Link>

          <Link
            href="/library"
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/library") ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <span className="text-base">📚</span>
            <span>Library</span>
          </Link>

          <Link
            href="/tasks/new"
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30">
              <span className="text-xl font-bold leading-none">+</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">Post</span>
          </Link>

          <Link
            href="/tasks/my"
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/tasks/my") ? "text-amber-600 font-bold dark:text-amber-400" : "text-muted-foreground"
            }`}
          >
            <span className="text-base">📋</span>
            <span>My Tasks</span>
          </Link>

          <Link
            href="/wallet"
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/wallet") ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <span className="text-base">💰</span>
            <span>Wallet</span>
          </Link>
        </div>
      </div>
    </>
  );
}
