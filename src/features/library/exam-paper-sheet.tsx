"use client";

import Link from "next/link";
import { type PBCOEExamPaperData } from "./pbcoe-exam-papers-data";

interface ExamPaperSheetProps {
  paper: PBCOEExamPaperData;
  onClose?: () => void;
  showPrintAction?: boolean;
}

export function PBCOEExamPaperSheet({
  paper,
  onClose,
  showPrintAction = true,
}: ExamPaperSheetProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="bg-white text-slate-900 shadow-xl border border-slate-300 rounded-2xl max-w-4xl mx-auto p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
            <span>🏛️</span>
            <span>PBCOE Official Paper</span>
          </span>
          <span className="font-mono text-xs text-slate-500 font-semibold">
            {paper.docNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showPrintAction && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.222.72-2.329 1.96-2.329h6.64c1.24 0 2.2 1.107 1.96 2.329m-10.56 0A3.75 3.75 0 006 17.25v2.25h12v-2.25a3.75 3.75 0 00-.72-3.421m-10.56 0A3.75 3.75 0 016 10.5V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v4.5a3.75 3.75 0 01-1.28 2.829" />
              </svg>
              <span>Print / Save PDF</span>
            </button>
          )}

          <a
            href="/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf"
            download={`${paper.courseCode}-${paper.term.replace(" ", "")}.pdf`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-2xs"
          >
            <span>⬇️ Original PDF</span>
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="Close paper"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Official PBCOE Institution Header */}
      <header className="text-center space-y-1 border-b-2 border-slate-900 pb-4 mb-4">
        <p className="text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase text-right">
          {paper.docNumber}
        </p>
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 uppercase">
          Lokmanya Tilak Jankalyan Shikshan Sanstha&apos;s
        </p>
        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
          PRIYADARSHINI BHAGWATI COLLEGE OF ENGINEERING, NAGPUR
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-700">
          An Autonomous Institution Affiliated to R.T.M. Nagpur University, Nagpur
        </p>
        <p className="text-xs font-bold text-slate-800">
          Accredited with Grade &apos;A&apos; by NAAC
        </p>
        <div className="pt-2">
          <p className="text-sm sm:text-base font-bold text-blue-900 tracking-wide">
            {paper.department}
          </p>
          <p className="text-xs sm:text-sm font-black text-slate-900 uppercase">
            Exam :- {paper.term}
          </p>
        </div>
      </header>

      {/* Exam Meta Table */}
      <div className="border border-slate-900 rounded-sm mb-4 text-xs font-semibold">
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-900">
          <div className="p-2 border-b sm:border-b-0 sm:border-r border-slate-900">
            <span className="font-bold">Semester:</span> {paper.semester}
          </div>
          <div className="p-2">
            <span className="font-bold">Session:</span> {paper.session}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-900">
          <div className="p-2 border-b sm:border-b-0 sm:border-r border-slate-900">
            <span className="font-bold">Course Code:</span> {paper.courseCode}
          </div>
          <div className="p-2">
            <span className="font-bold">Course:</span> {paper.courseName}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="p-2 border-b sm:border-b-0 sm:border-r border-slate-900">
            <span className="font-bold">Duration:</span> {paper.duration}
          </div>
          <div className="p-2">
            <span className="font-bold">Max. Marks:</span> {paper.maxMarks}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 text-xs text-slate-800 space-y-0.5 bg-slate-50 p-3 rounded border border-slate-200">
        <p className="font-bold text-slate-900">Instructions :-</p>
        {paper.instructions.map((inst, idx) => (
          <p key={idx} className="leading-snug">
            {inst}
          </p>
        ))}
      </div>

      {/* Official Questions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900 text-slate-950 font-bold">
              <th className="border-r border-slate-900 p-2.5 text-center w-16 sm:w-20">
                Q. No.
              </th>
              <th className="border-r border-slate-900 p-2.5 text-left">
                Questions
              </th>
              <th className="border-r border-slate-900 p-2 text-center w-14 sm:w-16">
                Marks
              </th>
              <th className="border-r border-slate-900 p-2 text-center w-12 sm:w-14">
                BL
              </th>
              <th className="p-2 text-center w-12 sm:w-14">
                CO
              </th>
            </tr>
          </thead>
          <tbody>
            {paper.questions.map((q, idx) => {
              if (q.isOrDivider) {
                return (
                  <tr key={idx} className="bg-slate-50 border-y border-slate-900 font-bold">
                    <td
                      colSpan={5}
                      className="py-1 text-center font-black tracking-widest text-slate-900 text-xs"
                    >
                      OR
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={idx}
                  className="border-b border-slate-300 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="border-r border-slate-900 p-2.5 text-center font-bold text-slate-900 align-top">
                    {q.qNo}
                  </td>
                  <td className="border-r border-slate-900 p-2.5 text-slate-900 leading-relaxed whitespace-pre-line align-top">
                    {q.question}
                  </td>
                  <td className="border-r border-slate-900 p-2 text-center font-bold text-slate-900 align-top">
                    {q.marks}
                  </td>
                  <td className="border-r border-slate-900 p-2 text-center font-semibold text-slate-700 align-top">
                    {q.bl}
                  </td>
                  <td className="p-2 text-center font-semibold text-slate-700 align-top">
                    {q.co}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>PBCOE Autonomous Consolidated Exam Papers — Semester III</span>
        <span>Grade &apos;A&apos; NAAC Accredited</span>
      </footer>
    </div>
  );
}
