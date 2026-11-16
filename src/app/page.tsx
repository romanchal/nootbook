import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
      {/* Top Royal Campus Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/80 px-4 py-1.5 text-xs font-bold text-blue-800 dark:text-blue-200 mb-6 shadow-2xs">
        <span>🏛️</span>
        <span>Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS)</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-3xl leading-tight">
        Academic Library & Student Portal for <span className="text-blue-700 dark:text-blue-400">PBCOE</span>.
      </h1>

      <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
        Autonomous academic archives with verified Term I & Term II question papers, semester syllabus, and peer student task assistance with double-entry escrow.
      </p>

      {/* Primary Actions with calculated slots */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href="/login"
          className={buttonVariants({
            size: "lg",
            className: "px-6 py-2.5 rounded-xl font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs hover:shadow-md transition-all hover:scale-[1.02]",
          })}
        >
          ✨ Launch Interactive Login
        </Link>
        <Link
          href="/library"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "px-6 py-2.5 rounded-xl font-bold border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 transition-all",
          })}
        >
          Explore Library Papers →
        </Link>
      </div>

      {/* Features Grid with Royal Blue Accent */}
      <div className="mt-14 grid w-full grid-cols-1 gap-4.5 text-left sm:grid-cols-3">
        <Link
          href="/library"
          className="group rounded-2xl border border-border/80 bg-card p-6 transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3.5 text-base font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            PBCOE Exam Papers
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Autonomous Term I & Term II question papers, syllabus, and topper notes for Artificial Intelligence (AI).
          </p>
        </Link>

        <Link
          href="/tasks"
          className="group rounded-2xl border border-border/80 bg-card p-6 transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">💼</span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3.5 text-base font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            Peer Task Marketplace
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Report formatting, seminar PPT slide design, and 1-on-1 tutoring requests held securely in escrow.
          </p>
        </Link>

        <Link
          href="/wallet"
          className="group rounded-2xl border border-border/80 bg-card p-6 transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3.5 text-base font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            Wallet & Double-Entry Escrow
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Transparent student paise ledger, verified earner balance withdrawals, and fair dispute settlement.
          </p>
        </Link>
      </div>

      {/* Admin Consoles Shortcut: Cleanly Separated */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground border-t border-border/70 pt-6 w-full max-w-xl">
        <span className="font-semibold text-foreground">Separate Governance Consoles:</span>
        <Link
          href="/admin/college"
          className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 hover:underline"
        >
          <span>🏛️</span>
          <span>College Admin (PBCOE)</span>
        </Link>
        <span>·</span>
        <Link
          href="/admin/super"
          className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          <span>👑</span>
          <span>Platform Super Admin</span>
        </Link>
      </div>
    </main>
  );
}
