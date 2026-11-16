import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 shadow-2xs">
        <span>🚀</span>
        <span>Pilot Live · Nagpur, India</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-3xl leading-tight">
        Everything a college student needs in <span className="text-primary">one place</span>.
      </h1>

      <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
        Multi-tenant academic library with 3-tap exam paper discovery, paired with a safe
        peer-to-peer student assistance marketplace backed by double-entry escrow.
      </p>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", className: "px-6 font-semibold shadow-xs" })}
        >
          ✨ Launch Interactive Login
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "lg", className: "px-6 font-semibold" })}
        >
          Enter Dashboard →
        </Link>
      </div>

      {/* Features Grid */}
      <div className="mt-14 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <Link
          href="/library"
          className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground">Academic Library</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Past university question papers, verified practical files, cheat sheets, and notes for Nagpur colleges.
          </p>
        </Link>

        <Link
          href="/tasks"
          className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">💼</span>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground">Task Marketplace</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Report formatting, LaTeX typing, PPT slide design, and 1-on-1 topic tutoring with held escrow.
          </p>
        </Link>

        <Link
          href="/wallet"
          className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground">Wallet & Escrow</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Immutable double-entry balanced ledger, earner withdrawal tracking, and dispute mediation.
          </p>
        </Link>
      </div>

      {/* Admin Consoles Shortcut */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-6 w-full max-w-lg">
        <span className="font-medium text-foreground">Admin Portals:</span>
        <Link href="/admin/college" className="hover:text-primary transition-colors underline">
          College Admin Console
        </Link>
        <span>·</span>
        <Link href="/admin/super" className="hover:text-primary transition-colors underline">
          Super Admin Console
        </Link>
      </div>
    </main>
  );
}
