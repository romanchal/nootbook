"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is PBCOE Autonomous and why are papers separate from RTMNU?",
    answer:
      "Priyadarshini Bhagwati College of Engineering, Nagpur has been granted Autonomous academic status. This allows the college to design its own specialized industry curriculum, conduct autonomous Term I and Term II examinations, and evaluate question papers using modern Bloom's Taxonomy standards rather than legacy university formats.",
  },
  {
    question: "What do Bloom's Taxonomy (BL1–BL5) and Course Outcomes (CO) mean on the papers?",
    answer:
      "Each question in the autonomous exam papers is mapped to a Bloom's Level (BL1: Remember, BL2: Understand, BL3: Apply, BL4: Analyze, BL5: Evaluate) and a Course Outcome (CO1 to CO4). This helps students understand the cognitive depth expected in their answers and aligns with NBA/NAAC outcome-based education standards.",
  },
  {
    question: "Are these the official Semester 3 Term I & Term II question papers?",
    answer:
      "Yes. All 7 papers featured in the Nootbook repository are official PBCOE examination papers for the 2026-27 academic session, complete with official document codes (e.g. PBCOE/AI/26-27/DS/AI/T-01), duration (1.30 Hr), 30 maximum marks, and instructions.",
  },
  {
    question: "How does the Student Peer Task Marketplace work?",
    answer:
      "Students can request assistance with lab record formatting, seminar presentation slide design, or programming problem solutions. The student sets a task bounty, which is locked safely in double-entry escrow. The payment is only released to the peer student earner once the work is reviewed and approved.",
  },
  {
    question: "Is access to the exam papers and syllabi completely free for students?",
    answer:
      "Yes. The Academic Library, semester subject syllabus lists, interactive paper sheet viewers, and printable/PDF downloads are 100% free forever for all PBCOE students.",
  },
  {
    question: "How do faculty or department admins get access to College Admin?",
    answer:
      "Faculty members registered with their college email address can be provisioned with COLLEGE_ADMIN privileges by the department head or platform super administrator. Once granted, they can manage branches and upload new term papers directly at /admin/college.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Everything you need to know about PBCOE Autonomous papers, Bloom&apos;s levels, and the student peer task marketplace.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
