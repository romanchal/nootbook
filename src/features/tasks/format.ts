import type { TaskType, TaskStatus, BidStatus } from "@/generated/prisma/client";

export const TASK_TYPE_META: Record<
  TaskType,
  { label: string; description: string; badgeClass: string; icon: string }
> = {
  FORMATTING: {
    label: "Report / Doc Formatting",
    description: "Font styling, table of contents, IEEE/college guideline margins, page numbering",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    icon: "📄",
  },
  TYPING: {
    label: "Typing & Transcription",
    description: "Transcribing handwritten rough notes into clean typed Word/LaTeX documents",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: "⌨️",
  },
  SLIDE_DESIGN: {
    label: "Presentation / PPT Design",
    description: "Designing clean PowerPoint/Canva slide decks for seminars and project reviews",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    icon: "📊",
  },
  DIAGRAM: {
    label: "Diagram & Schematic Drawing",
    description: "Creating digital block diagrams, circuit schematics, UML, and flowcharts",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: "📐",
  },
  PROOFREADING: {
    label: "Proofreading & Editing",
    description: "Grammar correction, language polish, reference citation formatting",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    icon: "✍️",
  },
  TUTORING: {
    label: "1-on-1 Tutoring",
    description: "Personal senior student tutoring on syllabus concepts and code walkthroughs",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    icon: "🎓",
  },
  DOUBT_SOLVING: {
    label: "Problem & Doubt Solving",
    description: "Step-by-step mathematical derivation guidance and algorithm explanation",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    icon: "💡",
  },
  PROJECT_GUIDANCE: {
    label: "Project Guidance & Setup",
    description: "Architecture advice, local environment setup, dependency troubleshooting",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: "🚀",
  },
};

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; badgeClass: string }
> = {
  OPEN: {
    label: "Open for Bids",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  ASSIGNED: {
    label: "In Progress",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  ACCEPTED: {
    label: "Completed",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
  DISPUTED: {
    label: "Disputed",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
  REFUNDED: {
    label: "Refunded",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export const BID_STATUS_META: Record<
  BidStatus,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: "Pending Review",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  REJECTED: {
    label: "Declined",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export function formatDeadline(date: Date | string): { text: string; isPast: boolean } {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { text: "Expired", isPast: true };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return { text: `${hours}h left`, isPast: false };
  }

  const days = Math.floor(hours / 24);
  return { text: `${days}d left`, isPast: false };
}
