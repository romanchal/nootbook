"use client";

import { useState } from "react";
import { PBCOEExamPaperSheet } from "./exam-paper-sheet";
import { PBCOE_PAPERS } from "./pbcoe-exam-papers-data";

interface ExamPaperModalTriggerProps {
  paperId: string;
  buttonLabel?: string;
}

export function ExamPaperModalTrigger({
  paperId,
  buttonLabel = "📄 View Official Paper",
}: ExamPaperModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const paper = PBCOE_PAPERS[paperId];

  if (!paper) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-all shadow-2xs cursor-pointer"
      >
        <span>📄</span>
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl my-auto">
            <div className="p-4 sm:p-6">
              <PBCOEExamPaperSheet
                paper={paper}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
