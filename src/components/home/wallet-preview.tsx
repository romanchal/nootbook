"use client";

import Link from "next/link";
import { Wallet, ArrowRight, CheckCircle2, Lock, Banknote, ShieldCheck } from "lucide-react";

export function WalletPreview() {
  return (
    <section id="wallet" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Mockup */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    PBCOE Student Escrow
                  </span>
                </div>
                <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Double-Entry Ledger
                </span>
              </div>

              <div className="mb-8">
                <div className="text-xs text-slate-400 mb-1">Available Student Balance</div>
                <div className="font-heading text-4xl font-extrabold text-white">
                  ₹ 1,240<span className="text-sm font-normal text-slate-400">.00</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>₹ 450.00 locked safely in active task escrow</span>
                </div>
              </div>

              {/* Recent Ledger Entries Mockup */}
              <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Recent Ledger Transactions
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Data Structure Lab Record Solved</span>
                  <span className="font-mono font-bold text-emerald-400">+₹180.00</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">OS Seminar PPT Request Posted</span>
                  <span className="font-mono font-bold text-amber-400">-₹250.00 (Escrow)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Paise Precision Banking</span>
                <Link
                  href="/wallet"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                >
                  Open Wallet →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Descriptions & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Lock className="h-3.5 w-3.5" />
              <span>Financial Security &amp; Transparency</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Wallet &amp; Earnings Dashboard
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Nootbook implements an institutional double-entry financial ledger where every rupee deposited, locked in escrow, or released to a student earner is cryptographically audited and recorded down to the exact paise.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                  <Banknote className="h-4 w-4 text-blue-600" />
                  <span>Instant Student Withdrawals</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Earners can request instant bank or UPI payouts once task reviews are signed off by the poster.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Fair Dispute Settlement</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  College admins resolve quality disputes with full revision history and evidence submission.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all"
              >
                <span>Access Student Wallet</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
