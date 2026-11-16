import type { ResourceType } from "@/generated/prisma/client";

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const RESOURCE_TYPE_META: Record<
  ResourceType,
  { label: string; description: string; badgeClass: string }
> = {
  OLD_PAPER: {
    label: "Previous Year Paper",
    description: "Official end-sem and mid-term exam question papers",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  NOTES: {
    label: "Lecture Notes",
    description: "Unit-wise notes, chapter summaries, and revision guides",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  PRACTICAL_FILE: {
    label: "Practical File",
    description: "Lab records, code writeups, and experiment sheets",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  ASSIGNMENT: {
    label: "Assignment",
    description: "Tutorial sheets and assignment question banks",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  LAB_MANUAL: {
    label: "Lab Manual",
    description: "Official laboratory manuals and practical guidelines",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
  SLIDES: {
    label: "Presentation Slides",
    description: "Faculty PowerPoint and PDF slide presentations",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
  SYLLABUS: {
    label: "Syllabus Copy",
    description: "Curriculum scheme, subject units, and credit breakdown",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
};

export function getSemesterYearName(sem: number): string {
  if (sem <= 2) return "First Year";
  if (sem <= 4) return "Second Year";
  if (sem <= 6) return "Third Year";
  return "Final Year";
}
