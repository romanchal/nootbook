"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import { ExamPaperModalTrigger } from "@/features/library/exam-paper-modal";

/**
 * Split Hero Section: Corporate & Tech-Forward
 * Left: PBCOE Autonomous Badge, Headline, Fast Search, Primary Actions
 * Right: Interactive Autonomous Question Paper Card Preview with Live Modal Trigger
 */
export function SplitHero() {
  const [searchQuery, setSearchQuery] = useState("");

  const sampleSearchSuggestions = [
    { label: "Data Structure (AI301T)", anchor: "#papers" },
    { label: "Java OOP (BAID302T)", anchor: "#papers" },
    { label: "Operating System (BAID303T)", anchor: "#papers" },
    { label: "Applied Mathematics III (BCAD301T)", anchor: "#papers" },
    { label: "AI Department (Sem 3)", anchor: "#branches" },
  ];

  const filteredSuggestions = searchQuery.trim()
    ? sampleSearchSuggestions.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-corporate-grid border-b border-slate-100 dark:border-slate-800">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Column: Campus Messaging & Interactive Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Autonomous Campus Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/90 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>🏛️ Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS)</span>
            </div>

            {/* Main Headline in Plus Jakarta Sans */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-slate-900 dark:text-white leading-[1.15]">
              Academic Library & Exam Paper Hub for{" "}
              <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-200 dark:decoration-blue-800 underline-offset-8">
                PBCOE Autonomous
              </span>
            </h1>

            {/* Tagline / Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              An official academic platform and student marketplace for Priyadarshini Bhagwati College of Engineering, Nagpur. Features branch-wise curricula, semester exam papers with Bloom&apos;s taxonomy marking, and peer task collaboration.
            </p>

            {/* Fast Search Bar */}
            <div id="hero-search" className="relative max-w-xl pt-2">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exam papers (e.g. Data Structure, AI301T, Java, OS)..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-24 py-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <a
                  href="#papers"
                  className="absolute right-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Find Paper
                </a>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1">
                    Matching Papers & Departments:
                  </div>
                  {filteredSuggestions.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.anchor}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        {item.label}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#papers"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <BookOpen className="h-4 w-4" />
                <span>Explore 7 Official Papers</span>
              </a>

              <Link
                href="/library/ai"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 px-5 py-3 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 transition-all"
              >
                <span>Browse AI Department</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/tasks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>Peer Marketplace</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Autonomous Academic Cell Verified</span>
              </div>
              <span>•</span>
              <div>8 Engineering Branches</div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Bloom&apos;s Taxonomy (BL1-BL5)</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Paper Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-blue-500/10">
              {/* Paper Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Term I &amp; II
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Doc: PBCOE/AI/26-27/DS/T-01
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Data Structure (AI301T)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dept. of Artificial Intelligence · 3rd Semester
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-blue-600">30 Marks</div>
                  <div className="text-[10px] text-slate-400">Duration: 1.30 Hr</div>
                </div>
              </div>

              {/* Bloom's Level & CO Pills */}
              <div className="my-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  BL1: Remember
                </span>
                <span className="rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  BL2: Understand
                </span>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                  BL3: Apply
                </span>
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Mapped to CO1, CO2, CO3
                </span>
              </div>

              {/* Sample Question Mockup */}
              <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Q.1 a) Data Structure Definition</span>
                  <span className="text-blue-600 font-extrabold">6 Marks · BL1</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  &ldquo;Define Data Structure. Explain different types of Data Structure with memory representation.&rdquo;
                </p>
                <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Choice: Solve Q1 or Q2</span>
                  <span>Course Outcome: CO-01</span>
                </div>
              </div>

              {/* Action Buttons: Modal Sheet Trigger + Direct PDF */}
              <div className="mt-4 flex items-center gap-2 pt-2">
                <div className="flex-1">
                  <ExamPaperModalTrigger
                    paperId="res-pbcoe-ds-term1"
                    buttonLabel="View Interactive Paper"
                  />
                </div>

                <a
                  href="/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <span>PDF</span>
                </a>
              </div>

              {/* Autonomous Verification Footer */}
              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Official Autonomous Exam Paper
                </span>
                <span>Session 2026-27</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
