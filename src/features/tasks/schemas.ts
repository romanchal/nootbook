import { z } from "zod";

const BLOCKED_INTEGRITY_PATTERNS = [
  /\bexam\s+help\b/i,
  /\bcheat(ing)?\b/i,
  /\bproxy(\s+attendance)?\b/i,
  /\bwrite\s+(my\s+)?exam\b/i,
  /\btake\s+(my\s+)?exam\b/i,
  /\bimpersonat(e|ion)\b/i,
  /\bpaper\s+leak\b/i,
  /\bhack(\s+marks)?\b/i,
  /\bonline\s+test\s+cheat\b/i,
];

export function containsAcademicIntegrityViolation(text: string): boolean {
  return BLOCKED_INTEGRITY_PATTERNS.some((pattern) => pattern.test(text));
}

export const createTaskSchema = z.object({
  type: z.enum([
    "FORMATTING",
    "TYPING",
    "SLIDE_DESIGN",
    "DIAGRAM",
    "PROOFREADING",
    "TUTORING",
    "DOUBT_SOLVING",
    "PROJECT_GUIDANCE",
  ]),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters.")
    .refine(
      (val) => !containsAcademicIntegrityViolation(val),
      "Task title violates Academic Integrity policy (no exam cheating or impersonation allowed).",
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters.")
    .refine(
      (val) => !containsAcademicIntegrityViolation(val),
      "Task description violates Academic Integrity policy (no exam cheating or impersonation allowed).",
    ),
  subjectId: z.string().optional().nullable(),
  deadline: z.string().refine((val) => {
    const d = new Date(val);
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;
    return !isNaN(d.getTime()) && d.getTime() > oneHourFromNow;
  }, "Deadline must be at least 1 hour in the future."),
  budgetRupees: z.coerce
    .number()
    .min(50, "Minimum budget is ₹50.")
    .max(10000, "Maximum budget is ₹10,000 for student assistance tasks."),
});

export const createBidSchema = z.object({
  taskId: z.string().min(1, "Task ID is required."),
  amountRupees: z.coerce
    .number()
    .min(50, "Minimum bid is ₹50.")
    .max(10000, "Maximum bid is ₹10,000."),
  message: z.string().max(500, "Message cannot exceed 500 characters.").optional(),
});

export const deliverTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required."),
  deliveryNotes: z
    .string()
    .min(5, "Please provide delivery details, explanation, or reference links (min 5 characters).")
    .max(3000, "Delivery notes cannot exceed 3000 characters."),
});

export const reviewTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1 star.")
    .max(5, "Rating cannot exceed 5 stars."),
  comment: z.string().max(500, "Feedback cannot exceed 500 characters.").optional(),
});
