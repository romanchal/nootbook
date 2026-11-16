import { db } from "@/lib/db";
import type { TaskType } from "@/generated/prisma/client";

export interface CreateTaskInput {
  collegeId: string;
  studentId: string;
  type: TaskType;
  title: string;
  description: string;
  subjectId?: string | null;
  deadline: Date;
  budgetPaise: number;
}

export interface CreateBidInput {
  collegeId: string;
  earnerId: string;
  taskId: string;
  amountPaise: number;
  message?: string;
}

export interface AssignTaskInput {
  collegeId: string;
  studentId: string;
  taskId: string;
  bidId: string;
}

export interface DeliverTaskInput {
  collegeId: string;
  earnerId: string;
  taskId: string;
  deliveryNotes: string;
}

export interface AcceptTaskDeliveryInput {
  collegeId: string;
  studentId: string;
  taskId: string;
}

export interface SubmitTaskReviewInput {
  collegeId: string;
  studentId: string;
  taskId: string;
  rating: number;
  comment?: string;
}

export interface CancelTaskInput {
  collegeId: string;
  studentId: string;
  taskId: string;
}

/**
 * Creates a new student task with status = OPEN.
 * Logs creation to AuditLog.
 */
export async function createTask(input: CreateTaskInput) {
  const { collegeId, studentId, type, title, description, subjectId, deadline, budgetPaise } =
    input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        collegeId,
        studentId,
        type,
        title,
        description,
        subjectId: subjectId || null,
        deadline,
        budgetPaise,
        status: "OPEN",
      },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "TASK_CREATE",
        entity: "Task",
        entityId: task.id,
        metadata: {
          type: task.type,
          title: task.title,
          budgetPaise: task.budgetPaise,
          deadline: task.deadline.toISOString(),
        },
      },
    });

    return task;
  });
}

/**
 * Places a bid on an open task by a verified earner.
 * Enforces:
 * - Task must belong to earner's college.
 * - Task must be OPEN and active (deadline > now).
 * - Earner cannot bid on their own task.
 * Logs submission to AuditLog.
 */
export async function createBid(input: CreateBidInput) {
  const { collegeId, earnerId, taskId, amountPaise, message } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId },
    });

    if (!task) {
      throw new Error("Task not found or inaccessible in your college.");
    }

    if (task.status !== "OPEN") {
      throw new Error("This task is no longer open for bidding.");
    }

    if (task.deadline < new Date()) {
      throw new Error("The deadline for this task has passed.");
    }

    if (task.studentId === earnerId) {
      throw new Error("You cannot bid on your own task.");
    }

    // Check if earner already has a pending bid
    const existingBid = await tx.bid.findFirst({
      where: { taskId, earnerId, status: "PENDING" },
    });

    let bid;
    if (existingBid) {
      bid = await tx.bid.update({
        where: { id: existingBid.id },
        data: { amountPaise, message: message || null },
      });
    } else {
      bid = await tx.bid.create({
        data: {
          taskId,
          earnerId,
          amountPaise,
          message: message || null,
          status: "PENDING",
        },
      });
    }

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: earnerId,
        action: "BID_SUBMIT",
        entity: "Bid",
        entityId: bid.id,
        metadata: {
          taskId,
          amountPaise,
        },
      },
    });

    return bid;
  });
}

/**
 * Allows an earner to withdraw their pending bid.
 */
export async function withdrawBid(collegeId: string, earnerId: string, bidId: string) {
  return db.$transaction(async (tx) => {
    const bid = await tx.bid.findFirst({
      where: {
        id: bidId,
        earnerId,
        task: { collegeId },
      },
    });

    if (!bid) {
      throw new Error("Bid not found.");
    }

    if (bid.status !== "PENDING") {
      throw new Error("Only pending bids can be withdrawn.");
    }

    const updated = await tx.bid.update({
      where: { id: bidId },
      data: { status: "WITHDRAWN" },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: earnerId,
        action: "BID_WITHDRAW",
        entity: "Bid",
        entityId: bid.id,
        metadata: { taskId: bid.taskId },
      },
    });

    return updated;
  });
}

/**
 * Student selects and accepts an earner's bid:
 * - Updates task: status = ASSIGNED, earnerId = bid.earnerId
 * - Updates winning bid: status = ACCEPTED
 * - Updates other bids: status = REJECTED
 * - Logs to AuditLog
 */
export async function assignTask(input: AssignTaskInput) {
  const { collegeId, studentId, taskId, bidId } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not authorized to assign it.");
    }

    if (task.status !== "OPEN") {
      throw new Error("Task is not in an open status.");
    }

    const winningBid = await tx.bid.findFirst({
      where: { id: bidId, taskId, status: "PENDING" },
      include: { earner: { select: { id: true, name: true } } },
    });

    if (!winningBid) {
      throw new Error("Selected bid is not valid or no longer pending.");
    }

    // 1. Update task
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "ASSIGNED",
        earnerId: winningBid.earnerId,
      },
    });

    // 2. Accept winning bid
    await tx.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });

    // 3. Reject other bids on this task
    await tx.bid.updateMany({
      where: {
        taskId,
        id: { not: bidId },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    // 4. Log to AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "TASK_ASSIGN",
        entity: "Task",
        entityId: taskId,
        metadata: {
          winningBidId: bidId,
          earnerId: winningBid.earnerId,
          earnerName: winningBid.earner.name,
          agreedAmountPaise: winningBid.amountPaise,
        },
      },
    });

    return updatedTask;
  });
}

/**
 * Earner delivers the requested work.
 * Enforces that caller is the assigned earner and task is ASSIGNED.
 * Status becomes DELIVERED.
 */
export async function deliverTask(input: DeliverTaskInput) {
  const { collegeId, earnerId, taskId, deliveryNotes } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, earnerId },
    });

    if (!task) {
      throw new Error("Task not found or you are not the assigned earner.");
    }

    if (task.status !== "ASSIGNED") {
      throw new Error("Task is not in ASSIGNED status.");
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: "DELIVERED" },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: earnerId,
        action: "TASK_DELIVER",
        entity: "Task",
        entityId: taskId,
        metadata: {
          deliveryNotes,
          deliveredAt: new Date().toISOString(),
        },
      },
    });

    return updatedTask;
  });
}

/**
 * Student accepts delivered work:
 * Task status becomes ACCEPTED.
 */
export async function acceptTaskDelivery(input: AcceptTaskDeliveryInput) {
  const { collegeId, studentId, taskId } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not the task owner.");
    }

    if (task.status !== "DELIVERED") {
      throw new Error("Task has not been marked as delivered yet.");
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: "ACCEPTED" },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "TASK_ACCEPT",
        entity: "Task",
        entityId: taskId,
        metadata: {
          earnerId: task.earnerId,
          acceptedAt: new Date().toISOString(),
        },
      },
    });

    return updatedTask;
  });
}

/**
 * Student reviews the earner after task acceptance.
 */
export async function submitTaskReview(input: SubmitTaskReviewInput) {
  const { collegeId, studentId, taskId, rating, comment } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not the task owner.");
    }

    if (task.status !== "ACCEPTED") {
      throw new Error("Reviews can only be submitted for completed/accepted tasks.");
    }

    if (!task.earnerId) {
      throw new Error("No earner was associated with this task.");
    }

    const existingReview = await tx.review.findUnique({
      where: {
        taskId_reviewerId: {
          taskId,
          reviewerId: studentId,
        },
      },
    });

    if (existingReview) {
      throw new Error("You have already submitted a review for this task.");
    }

    const review = await tx.review.create({
      data: {
        taskId,
        collegeId,
        reviewerId: studentId,
        earnerId: task.earnerId,
        rating,
        comment: comment || null,
      },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "TASK_REVIEW",
        entity: "Review",
        entityId: review.id,
        metadata: {
          taskId,
          earnerId: task.earnerId,
          rating,
        },
      },
    });

    return review;
  });
}

/**
 * Student cancels an open task (before any bid is assigned).
 */
export async function cancelTask(input: CancelTaskInput) {
  const { collegeId, studentId, taskId } = input;

  return db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not the owner.");
    }

    if (task.status !== "OPEN") {
      throw new Error("Only open tasks with no assigned earner can be cancelled.");
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: "CANCELLED" },
    });

    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "TASK_CANCEL",
        entity: "Task",
        entityId: taskId,
        metadata: { cancelledAt: new Date().toISOString() },
      },
    });

    return updatedTask;
  });
}
