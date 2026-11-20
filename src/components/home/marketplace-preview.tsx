"use client";

import Link from "next/link";
import { Briefcase, ArrowRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

interface MarketplaceTask {
  id: string;
  title: string;
  department: string;
  bounty: string;
  category: string;
  timeRemaining: string;
  status: "OPEN" | "IN_PROGRESS";
}

const SAMPLE_TASKS: MarketplaceTask[] = [
  {
    id: "task-1",
    title: "Data Structures Lab Record & Heap Sort Analysis Report",
    department: "Artificial Intelligence (AI)",
    bounty: "₹180",
    category: "Lab Record",
    timeRemaining: "1 day left",
    status: "OPEN",
  },
  {
    id: "task-2",
    title: "OS Process Synchronization & Dining Philosophers Seminar PPT",
    department: "Computer Science (CSE)",
    bounty: "₹250",
    category: "Seminar PPT",
    timeRemaining: "3 days left",
    status: "OPEN",
  },
  {
    id: "task-3",
    title: "Applied Mathematics III Differential Equations Unit 2 Notes",
    department: "AI & Common Core",
    bounty: "₹200",
    category: "Topper Notes",
    timeRemaining: "Completed",
    status: "IN_PROGRESS",
  },
];

export function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Campus Peer Assistance</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Peer Task Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Collaborate with fellow PBCOE students on lab formatting, seminar presentations, code debugging, and study notes. Every bounty is safely secured in double-entry escrow until satisfaction.
            </p>
          </div>

          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
          >
            <span>Explore All Campus Tasks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {task.category}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    {task.bounty}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-2">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-500 mb-4">{task.department}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Clock className="h-3 w-3" />
                  {task.timeRemaining}
                </span>

                <Link
                  href="/tasks"
                  className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 p-4 sm:p-6 text-xs text-blue-900 dark:text-blue-100">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
            <div>
              <strong className="font-bold block text-sm">Escrow Protection Guarantee</strong>
              <span>
                Task rewards are held securely in a paise-level balance until the requester verifies the solution. Zero financial fraud, zero delayed disputes.
              </span>
            </div>
          </div>
          <Link
            href="/tasks/create"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 font-bold text-white shrink-0 transition-colors"
          >
            + Post a Task Request
          </Link>
        </div>
      </div>
    </section>
  );
}
