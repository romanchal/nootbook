"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/features/auth/guards";
import { openDisputeSchema, resolveDisputeSchema, issueStrikeSchema } from "./schemas";
import { openDispute, resolveDispute } from "./service";
import { issueUserStrike, reinstateUser } from "./safety";

/**
 * Server action: Student or Earner opens a dispute on an ASSIGNED or DELIVERED task.
 */
export async function openDisputeAction(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = openDisputeSchema.safeParse({
    taskId: formData.get("taskId"),
    reason: formData.get("reason"),
    evidence: formData.get("evidence") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid dispute details." };
  }

  try {
    const result = await openDispute({
      collegeId: user.collegeId,
      userId: user.id,
      taskId: parsed.data.taskId,
      reason: parsed.data.reason,
      evidence: parsed.data.evidence,
    });

    revalidatePath(`/tasks/${parsed.data.taskId}`);
    revalidatePath("/tasks");
    revalidatePath("/tasks/my");
    revalidatePath("/wallet");
    revalidatePath("/dashboard");

    return { success: true, disputeId: result.dispute.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to open dispute." };
  }
}

/**
 * Server action: Super Admin or College Admin resolves a dispute end-to-end.
 */
export async function resolveDisputeAction(formData: FormData) {
  const user = await requireAppUser();

  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: College or Super Admin role required." };
  }

  const parsed = resolveDisputeSchema.safeParse({
    disputeId: formData.get("disputeId"),
    decision: formData.get("decision"),
    decisionNotes: formData.get("decisionNotes"),
    splitStudentRupees: formData.get("splitStudentRupees") || undefined,
    splitEarnerRupees: formData.get("splitEarnerRupees") || undefined,
    issueStrikeUserId: formData.get("issueStrikeUserId") || null,
    strikeReason: formData.get("strikeReason") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid resolution input." };
  }

  try {
    const splitStudentPaise =
      parsed.data.splitStudentRupees !== undefined
        ? Math.round(parsed.data.splitStudentRupees * 100)
        : undefined;

    const splitEarnerPaise =
      parsed.data.splitEarnerRupees !== undefined
        ? Math.round(parsed.data.splitEarnerRupees * 100)
        : undefined;

    const result = await resolveDispute({
      collegeId: user.collegeId || "",
      adminId: user.id,
      isSuperAdmin,
      disputeId: parsed.data.disputeId,
      decision: parsed.data.decision,
      decisionNotes: parsed.data.decisionNotes,
      splitStudentPaise,
      splitEarnerPaise,
      issueStrikeUserId: parsed.data.issueStrikeUserId,
      strikeReason: parsed.data.strikeReason,
    });

    revalidatePath(`/tasks/${result.task.id}`);
    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    revalidatePath("/wallet");
    return { success: true, disputeId: result.dispute.id, status: result.dispute.status };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to resolve dispute." };
  }
}

/**
 * Server action: Admin issues a safety/conduct strike against a user.
 */
export async function issueStrikeAction(formData: FormData) {
  const user = await requireAppUser();

  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  const parsed = issueStrikeSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    reason: formData.get("reason"),
    taskId: formData.get("taskId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid strike details." };
  }

  try {
    const result = await issueUserStrike({
      collegeId: user.collegeId || "",
      adminId: user.id,
      targetUserId: parsed.data.targetUserId,
      reason: parsed.data.reason,
      taskId: parsed.data.taskId,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return {
      success: true,
      strikeCount: result.strikeCount,
      suspended: result.suspended,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to issue strike." };
  }
}

/**
 * Server action: Admin reinstates a suspended user.
 */
export async function reinstateUserAction(formData: FormData) {
  const user = await requireAppUser();

  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  const targetUserId = formData.get("targetUserId") as string;
  const reason = (formData.get("reason") as string) || "Reinstated by administrator";

  if (!targetUserId) {
    return { error: "Target user ID is required." };
  }

  try {
    await reinstateUser({
      collegeId: user.collegeId || "",
      adminId: user.id,
      targetUserId,
      reason,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to reinstate user." };
  }
}
