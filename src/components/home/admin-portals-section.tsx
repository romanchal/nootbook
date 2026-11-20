"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, Building, KeyRound, Sparkles } from "lucide-react";

export function AdminPortalsSection() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Campus Governance Architecture</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Separate Governance Consoles
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Role-based isolation ensures academic faculty only manage college curriculum and question papers, while platform super administrators oversee system security and ledger guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* College Admin Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-8 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🏛️</span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-bold text-blue-800 dark:text-blue-200">
                  PBCOE Campus Space
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  College Admin Console
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  Priyadarshini Bhagwati College of Engineering, Nagpur
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Faculty and department heads can manage branch activation (AI, CSE, IT, EE, ECE, ETC, Civil, Mech), upload verified Term I &amp; II question papers with Bloom&apos;s marking criteria, and approve student-submitted notes.
              </p>

              <div className="space-y-2 border-t border-blue-100 dark:border-blue-900/60 pt-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Curate 8 PBCOE Department libraries</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Verify and approve semester exam papers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Autonomous syllabus alignment checks</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-100 dark:border-blue-900/60">
              <Link
                href="/admin/college"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <span>Launch College Admin Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Super Admin Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 p-8 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">👑</span>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-xs font-bold text-indigo-800 dark:text-indigo-200">
                  Global System Scope
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  Platform Super Admin Console
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  Enterprise Infrastructure &amp; Security
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Super administrator portal for assigning college administration privileges, monitoring double-entry escrow balances, audit logs, and managing multi-tenant campus registrations.
              </p>

              <div className="space-y-2 border-t border-indigo-100 dark:border-indigo-900/60 pt-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Assign SUPER_ADMIN &amp; COLLEGE_ADMIN roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Double-entry financial ledger integrity audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Campus tenant onboarding and isolation checks</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/60">
              <Link
                href="/admin/super"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <span>Launch Super Admin Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
