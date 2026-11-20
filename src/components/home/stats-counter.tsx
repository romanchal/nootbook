"use client";

import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, CheckCircle2, Shield } from "lucide-react";

interface StatItem {
  icon: typeof GraduationCap;
  target: number;
  suffix: string;
  label: string;
  description: string;
}

const STATS_DATA: StatItem[] = [
  {
    icon: GraduationCap,
    target: 8,
    suffix: "",
    label: "Engineering Branches",
    description: "PBCOE autonomous departments (AI live, 7 upcoming)",
  },
  {
    icon: BookOpen,
    target: 7,
    suffix: "",
    label: "Official Sem 3 Papers",
    description: "Verified Term I & Term II consolidated exam papers",
  },
  {
    icon: CheckCircle2,
    target: 100,
    suffix: "%",
    label: "Bloom's Taxonomy Mapped",
    description: "Every question mapped with BL1-BL5 and Course Outcomes",
  },
  {
    icon: Shield,
    target: 0,
    suffix: "₹",
    label: "Platform Fee for Students",
    description: "Free permanent access to official syllabi and papers",
  },
];

export function StatsCounter() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCounts(
        STATS_DATA.map((item) => {
          if (item.target === 0) return 0;
          const progress = Math.min(step / steps, 1);
          // Ease-out curve
          const easeOut = 1 - Math.pow(1 - progress, 3);
          return Math.round(item.target * easeOut);
        })
      );

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS_DATA.map((item, idx) => {
            const Icon = item.icon;
            const displayValue =
              item.target === 0 ? "₹0" : `${counts[idx]}${item.suffix}`;

            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {displayValue}
                </div>
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-1 uppercase tracking-wider">
                  {item.label}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-[200px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
