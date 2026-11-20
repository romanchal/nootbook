"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface Department {
  code: string;
  name: string;
  icon: string;
  active: boolean;
  semesters: number;
  description: string;
  highlight: string;
  slug: string;
}

const DEPARTMENTS: Department[] = [
  {
    code: "AI",
    name: "Artificial Intelligence",
    icon: "🧠",
    active: true,
    semesters: 8,
    description:
      "Core autonomous curriculum covering Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, MLOps, and Semester 3 Term I & II official exam papers.",
    highlight: "Active · Term I & II Papers Available",
    slug: "ai",
  },
  {
    code: "CSE",
    name: "Computer Science and Engineering",
    icon: "💻",
    active: false,
    semesters: 8,
    description:
      "Core computing, Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks, and autonomous examination archives.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "cse",
  },
  {
    code: "IT",
    name: "Information Technology",
    icon: "🌐",
    active: false,
    semesters: 8,
    description:
      "Web Technologies, Cloud Architecture, Information Security, Software Engineering, DevOps, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "it",
  },
  {
    code: "EE",
    name: "Electrical Engineering",
    icon: "⚡",
    active: false,
    semesters: 8,
    description:
      "Electrical Machines, Power Systems, Control Systems, Power Electronics, Energy Systems, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "ee",
  },
  {
    code: "ECE",
    name: "Electronics & Communication",
    icon: "📡",
    active: false,
    semesters: 8,
    description:
      "Analog & Digital Electronics, Signals & Systems, Communication Systems, Embedded Systems, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "ece",
  },
  {
    code: "ETC",
    name: "Electronics & Telecommunication",
    icon: "📶",
    active: false,
    semesters: 8,
    description:
      "Telecommunication Systems, Digital Signal Processing, RF & Microwave Engineering, Optical Fiber, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "etc",
  },
  {
    code: "CIVIL",
    name: "Civil Engineering",
    icon: "🏗️",
    active: false,
    semesters: 8,
    description:
      "Structural Analysis, Concrete Technology, Geotechnical Engineering, Surveying, Transportation, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "civil",
  },
  {
    code: "MECH",
    name: "Mechanical Engineering",
    icon: "⚙️",
    active: false,
    semesters: 8,
    description:
      "Thermodynamics, Fluid Mechanics, Strength of Materials, Theory of Machines, CAD/CAM, and autonomous question papers.",
    highlight: "Coming Soon · Curriculum in Review",
    slug: "mech",
  },
];

export function DepartmentsGrid() {
  return (
    <section id="branches" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PBCOE Autonomous Departments</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              8 Engineering Branches
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every college branch maintains an independent academic library with autonomous syllabus mapping, semester subject cards, and verified exam question papers.
            </p>
          </div>

          <Link
            href="/library/ai"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Explore Active AI Branch</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 8 Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPARTMENTS.map((dept) => {
            return (
              <div
                key={dept.code}
                className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 ${
                  dept.active
                    ? "bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/20 hover:scale-[1.02]"
                    : "bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Bar with Icon & Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{dept.icon}</span>
                    {dept.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Branch Code & Name */}
                  <div className="space-y-1 mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {dept.code} · {dept.semesters} Semesters
                    </span>
                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                      {dept.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {dept.active ? (
                    <Link
                      href={`/library/${dept.slug}`}
                      className="flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 group"
                    >
                      <span>Explore Semesters &amp; Papers</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Curriculum in Autonomous Review</span>
                      <span className="font-mono text-[10px]">SOON</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
