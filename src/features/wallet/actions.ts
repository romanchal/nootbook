"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAppUser } from "@/features/auth/guards";
import {
  depositEscrowManual,
  processPayoutManual,
  releaseEscrowOnAcceptance,
  requestPayout,
} from "./service";

const payoutSchema = z.object({
  amountRupees: z.coerce.number().min(100, "Minimum withdrawal is ₹100.").max(50000),
  notes: z.string().max(200).optional(),
});

/**
 * Server action: Student deposits escrow for winning bid (Manual Mode).
 */
export async function depositEscrowManualAction(taskId: string, bidId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    const res = await depositEscrowManual({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId,
      bidId,
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/tasks/my");
    revalidatePath("/wallet");
    revalidatePath("/earner");
    return { success: true, escrowId: res.escrowHold.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to deposit escrow." };
  }
}

/**
 * Server action: Student accepts delivery and releases escrow funds.
 */
export async function releaseEscrowAction(taskId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    const res = await releaseEscrowOnAcceptance({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId,
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/tasks/my");
    revalidatePath("/wallet");
    revalidatePath("/earner");
    return { success: true, earnerNetPaise: res.earnerNetPaise };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to release escrow." };
  }
}

/**
 * Server action: Earner requests a withdrawal from their available wallet balance.
 */
export async function requestPayoutAction(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = payoutSchema.safeParse({
    amountRupees: formData.get("amountRupees"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid withdrawal request." };
  }

  try {
    const payout = await requestPayout({
      collegeId: user.collegeId,
      userId: user.id,
      amountPaise: Math.round(parsed.data.amountRupees * 100),
      notes: parsed.data.notes,
    });

    revalidatePath("/wallet");
    revalidatePath("/earner");
    return { success: true, payoutId: payout.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to request payout." };
  }
}

/**
 * Server action: Admin manually marks payout as settled.
 */
export async function processPayoutAction(payoutId: string, reference?: string) {
  const user = await requireAppUser();
  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  try {
    await processPayoutManual({
      collegeId: isSuperAdmin ? (user.collegeId || "") : (user.collegeId || ""),
      adminId: user.id,
      payoutId,
      reference,
    });

    revalidatePath("/wallet");
    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to process payout." };
  }
}
