import { z } from "zod";

export const openDisputeSchema = z.object({
  taskId: z.string().min(1, "Task ID is required."),
  reason: z
    .string()
    .min(10, "Dispute reason must be at least 10 characters.")
    .max(1000, "Reason cannot exceed 1000 characters."),
  evidence: z
    .string()
    .max(2000, "Evidence / reference links cannot exceed 2000 characters.")
    .optional()
    .nullable(),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1, "Dispute ID is required."),
  decision: z.enum(["REFUND_STUDENT", "RELEASE_EARNER", "SPLIT"]),
  decisionNotes: z
    .string()
    .min(5, "Decision notes must be at least 5 characters.")
    .max(1000, "Decision notes cannot exceed 1000 characters."),
  splitStudentRupees: z.coerce.number().min(0).optional(),
  splitEarnerRupees: z.coerce.number().min(0).optional(),
  issueStrikeUserId: z.string().optional().nullable(),
  strikeReason: z.string().max(500).optional().nullable(),
});

export const issueStrikeSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required."),
  reason: z
    .string()
    .min(5, "Strike reason must be at least 5 characters.")
    .max(500, "Strike reason cannot exceed 500 characters."),
  taskId: z.string().optional().nullable(),
});
