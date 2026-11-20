"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Filter,
  Printer,
  Sparkles,
  Search,
} from "lucide-react";
import { ExamPaperModalTrigger } from "@/features/library/exam-paper-modal";

interface PaperMeta {
  id: string;
  courseCode: string;
  courseName: string;
  term: "Term I" | "Term II";
  maxMarks: number;
  duration: string;
  docNumber: string;
  bloomLevels: string[];
  courseOutcomes: string[];
  keyTopics: string;
}

const OFFICIAL_PAPERS: PaperMeta[] = [
  {
    id: "res-pbcoe-ds-term1",
    courseCode: "AI301T",
    courseName: "Data Structure",
    term: "Term I",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/DS/AI/T-01",
    bloomLevels: ["BL1 (Remember)", "BL2 (Understand)", "BL3 (Apply)"],
    courseOutcomes: ["CO1", "CO2", "CO3"],
    keyTopics: "Heap Sort, Binary Search, Infix to Postfix, Linked List insertion",
  },
  {
    id: "res-pbcoe-eco-term1",
    courseCode: "BAID303T",
    courseName: "Operating System",
    term: "Term I",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/OS/AI/T-01",
    bloomLevels: ["BL1 (Remember)", "BL2 (Understand)", "BL3 (Apply)"],
    courseOutcomes: ["CO1", "CO2", "CO3"],
    keyTopics: "OS Components, CPU Scheduling (FCFS & SJF), Dining Philosophers, Mutex",
  },
  {
    id: "res-pbcoe-java-term1",
    courseCode: "BAID302T",
    courseName: "Object Oriented Programming with Java",
    term: "Term I",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/OOP/AI/T-01",
    bloomLevels: ["BL1 (Remember)", "BL2 (Understand)", "BL3 (Apply)"],
    courseOutcomes: ["CO1", "CO2", "CO3"],
    keyTopics: "JVM Architecture, Method Overloading, Hierarchical Inheritance, Interfaces",
  },
  {
    id: "res-pbcoe-evs-term2",
    courseCode: "BCAD301T",
    courseName: "Applied Mathematics - III",
    term: "Term I",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/MATH3/AI/T-01",
    bloomLevels: ["BL2 (Understand)", "BL3 (Apply)", "BL4 (Analyze)"],
    courseOutcomes: ["CO1", "CO2", "CO3"],
    keyTopics: "Laplace Transforms, Inverse Laplace, Heaviside Unit Step, Differential Equations",
  },
  {
    id: "res-pbcoe-eco-term2",
    courseCode: "BAID303T",
    courseName: "Operating System",
    term: "Term II",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/OS/AI/T-02",
    bloomLevels: ["BL2 (Understand)", "BL3 (Apply)", "BL4 (Analyze)"],
    courseOutcomes: ["CO3", "CO4"],
    keyTopics: "Banker's Algorithm, Page Replacement (FIFO & LRU), Virtual Memory, Thrashing",
  },
  {
    id: "res-pbcoe-ds-term2",
    courseCode: "BAID304T",
    courseName: "Data Structure",
    term: "Term II",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/DS/AI/T-02",
    bloomLevels: ["BL2 (Understand)", "BL3 (Apply)", "BL5 (Evaluate)"],
    courseOutcomes: ["CO3", "CO4"],
    keyTopics: "Binary Search Tree Traversals, AVL Trees, Dijkstra's Shortest Path, Hashing",
  },
  {
    id: "res-pbcoe-java-term2",
    courseCode: "BAID302T",
    courseName: "Object Oriented Programming with Java",
    term: "Term II",
    maxMarks: 30,
    duration: "1.30 Hr",
    docNumber: "PBCOE/AI/26-27/OOP/AI/T-02",
    bloomLevels: ["BL2 (Understand)", "BL3 (Apply)", "BL4 (Analyze)"],
    courseOutcomes: ["CO3", "CO4"],
    keyTopics: "Multithreading Lifecycle, Exception Handling, File I/O Streams, Java Generics",
  },
];

export function PapersRepository() {
  const [selectedTerm, setSelectedTerm] = useState<"All" | "Term I" | "Term II">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPapers = OFFICIAL_PAPERS.filter((paper) => {
    const matchesTerm =
      selectedTerm === "All" || paper.term === selectedTerm;
    const matchesSearch =
      paper.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.keyTopics.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTerm && matchesSearch;
  });

  return (
    <section id="papers" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Semester 3 Question Papers</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Exam Papers Repository (Term I &amp; II)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Full autonomous exam papers for Priyadarshini Bhagwati College of Engineering. Each paper includes complete questions, subquestions, Bloom&apos;s Taxonomy levels, Course Outcomes, and maximum marks.
            </p>
          </div>

          {/* Download Consolidated PDF Button */}
          <div className="flex items-center gap-3">
            <a
              href="/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-blue-600/30 hover:shadow-md transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Consolidated PDF (42 KB)</span>
            </a>
          </div>
        </div>

        {/* Filter Controls: Term Tabs + Instant Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* Term Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 mr-2 hidden sm:inline-flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </span>
            {(["All", "Term I", "Term II"] as const).map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTerm === term
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                }`}
              >
                {term} {term === "All" ? `(7)` : term === "Term I" ? `(4)` : `(3)`}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by subject or code..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            return (
              <div
                key={paper.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        paper.term === "Term I"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      }`}
                    >
                      {paper.term}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {paper.courseCode}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {paper.courseName}
                  </h3>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-blue-600">{paper.maxMarks} Marks</span>
                    <span>•</span>
                    <span>{paper.duration}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-400">Sem 3</span>
                  </div>

                  {/* Key Topics Covered */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-200">Topics:</strong>{" "}
                    {paper.keyTopics}
                  </p>

                  {/* Bloom's Level & CO Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {paper.bloomLevels.map((bl, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {bl}
                      </span>
                    ))}
                    {paper.courseOutcomes.map((co, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                      >
                        {co}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <ExamPaperModalTrigger
                      paperId={paper.id}
                      buttonLabel="Open Sheet"
                    />
                  </div>

                  <Link
                    href={`/library/paper/${paper.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Open Dedicated Printable Page"
                  >
                    <Printer className="h-3 w-3 text-slate-500" />
                    <span>Print</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
