"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser, requireEarnerGuard } from "@/features/auth/guards";
import {
  createBidSchema,
  createTaskSchema,
  deliverTaskSchema,
  reviewTaskSchema,
} from "./schemas";
import {
  acceptTaskDelivery,
  assignTask,
  cancelTask,
  createBid,
  createTask,
  deliverTask,
  submitTaskReview,
  withdrawBid,
} from "./lifecycle";
import type { TaskType } from "@/generated/prisma/client";

/**
 * Server action: Student posts a new marketplace assistance task.
 */
export async function createTaskAction(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = createTaskSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    subjectId: formData.get("subjectId") || null,
    deadline: formData.get("deadline"),
    budgetRupees: formData.get("budgetRupees"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task details." };
  }

  try {
    const task = await createTask({
      collegeId: user.collegeId,
      studentId: user.id,
      type: parsed.data.type as TaskType,
      title: parsed.data.title,
      description: parsed.data.description,
      subjectId: parsed.data.subjectId,
      deadline: new Date(parsed.data.deadline),
      budgetPaise: Math.round(parsed.data.budgetRupees * 100),
    });

    revalidatePath("/tasks");
    revalidatePath("/tasks/my");
    revalidatePath("/dashboard");
    return { success: true, taskId: task.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create task." };
  }
}

/**
 * Server action: Verified Earner places a bid on a task.
 */
export async function submitBidAction(formData: FormData) {
  const user = await requireEarnerGuard();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = createBidSchema.safeParse({
    taskId: formData.get("taskId"),
    amountRupees: formData.get("amountRupees"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid bid details." };
  }

  try {
    const bid = await createBid({
      collegeId: user.collegeId,
      earnerId: user.id,
      taskId: parsed.data.taskId,
      amountPaise: Math.round(parsed.data.amountRupees * 100),
      message: parsed.data.message,
    });

    revalidatePath(`/tasks/${parsed.data.taskId}`);
    revalidatePath("/earner");
    return { success: true, bidId: bid.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to place bid." };
  }
}

/**
 * Server action: Earner withdraws pending bid.
 */
export async function withdrawBidAction(bidId: string, taskId: string) {
  const user = await requireEarnerGuard();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    await withdrawBid(user.collegeId, user.id, bidId);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/earner");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to withdraw bid." };
  }
}

/**
 * Server action: Student assigns task to selected earner bid.
 */
export async function assignTaskAction(taskId: string, bidId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    await assignTask({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId,
      bidId,
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/tasks/my");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to assign task." };
  }
}

/**
 * Server action: Earner submits delivery.
 */
export async function deliverTaskAction(formData: FormData) {
  const user = await requireEarnerGuard();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = deliverTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    deliveryNotes: formData.get("deliveryNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid delivery submission." };
  }

  try {
    await deliverTask({
      collegeId: user.collegeId,
      earnerId: user.id,
      taskId: parsed.data.taskId,
      deliveryNotes: parsed.data.deliveryNotes,
    });

    revalidatePath(`/tasks/${parsed.data.taskId}`);
    revalidatePath("/earner");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to deliver task." };
  }
}

/**
 * Server action: Student accepts task delivery.
 */
export async function acceptTaskDeliveryAction(taskId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    await acceptTaskDelivery({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId,
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/tasks/my");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to accept delivery." };
  }
}

/**
 * Server action: Student reviews earner after completion.
 */
export async function submitTaskReviewAction(formData: FormData) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  const parsed = reviewTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review input." };
  }

  try {
    await submitTaskReview({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId: parsed.data.taskId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    revalidatePath(`/tasks/${parsed.data.taskId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to submit review." };
  }
}

/**
 * Server action: Student cancels open task.
 */
export async function cancelTaskAction(taskId: string) {
  const user = await requireAppUser();
  if (!user.collegeId) {
    return { error: "No college associated with your account." };
  }

  try {
    await cancelTask({
      collegeId: user.collegeId,
      studentId: user.id,
      taskId,
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/tasks/my");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to cancel task." };
  }
}
