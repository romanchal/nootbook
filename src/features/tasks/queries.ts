import { db } from "@/lib/db";
import type { Prisma, TaskType } from "@/generated/prisma/client";

export interface TaskFilterOptions {
  type?: TaskType;
  search?: string;
  limit?: number;
}

/**
 * Returns open marketplace tasks within the college.
 * Strictly scopes by collegeId and status = OPEN with active deadlines.
 */
export async function getOpenMarketplaceTasks(
  collegeId: string,
  options: TaskFilterOptions = {},
) {
  const { type, search, limit = 50 } = options;
  const now = new Date();

  const where: Prisma.TaskWhereInput = {
    collegeId,
    status: "OPEN",
    deadline: { gt: now },
  };

  if (type) {
    where.type = type;
  }

  if (search && search.trim().length > 0) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { subject: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return db.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      _count: { select: { bids: true } },
    },
  });
}

/**
 * Fetches full task details with bids, earner, student, subject, and reviews.
 * Strictly scoped by collegeId for tenant security.
 */
export async function getTaskDetails(collegeId: string, taskId: string) {
  return db.task.findFirst({
    where: {
      id: taskId,
      collegeId,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      earner: { select: { id: true, name: true, email: true } },
      escrowHold: true,
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          department: { select: { name: true, code: true } },
        },
      },
      bids: {
        orderBy: { createdAt: "desc" },
        include: {
          earner: {
            select: {
              id: true,
              name: true,
              roles: true,
              reviewsReceived: {
                select: { rating: true },
              },
            },
          },
        },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true } },
        },
      },
      dispute: {
        include: {
          openedBy: { select: { id: true, name: true } },
          decidedBy: { select: { id: true, name: true } },
        },
      },
      _count: { select: { bids: true } },
    },
  });
}

/**
 * Returns tasks posted by a student in their college.
 */
export async function getStudentPostedTasks(collegeId: string, studentId: string) {
  return db.task.findMany({
    where: {
      collegeId,
      studentId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      subject: { select: { name: true, code: true } },
      earner: { select: { id: true, name: true } },
      _count: { select: { bids: true } },
    },
  });
}

/**
 * Returns active tasks assigned to an earner in their college.
 */
export async function getEarnerActiveTasks(collegeId: string, earnerId: string) {
  return db.task.findMany({
    where: {
      collegeId,
      earnerId,
      status: { in: ["ASSIGNED", "DELIVERED"] },
    },
    orderBy: { deadline: "asc" },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { name: true, code: true } },
    },
  });
}

/**
 * Returns completed tasks for an earner.
 */
export async function getEarnerCompletedTasks(collegeId: string, earnerId: string) {
  return db.task.findMany({
    where: {
      collegeId,
      earnerId,
      status: "ACCEPTED",
    },
    orderBy: { updatedAt: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { name: true, code: true } },
      reviews: true,
    },
  });
}

/**
 * Aggregates statistics for an earner (rating, completed count, active count).
 */
export async function getEarnerStats(collegeId: string, earnerId: string) {
  const [completedCount, activeCount, reviews] = await Promise.all([
    db.task.count({
      where: { collegeId, earnerId, status: "ACCEPTED" },
    }),
    db.task.count({
      where: { collegeId, earnerId, status: { in: ["ASSIGNED", "DELIVERED"] } },
    }),
    db.review.findMany({
      where: { collegeId, earnerId },
      select: { rating: true },
    }),
  ]);

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : null;

  return {
    completedCount,
    activeCount,
    reviewsCount: reviews.length,
    averageRating: avgRating,
  };
}

/**
 * Returns active subjects available in the college curriculum for task categorization.
 */
export async function getCollegeSubjectsForTask(collegeId: string) {
  return db.subject.findMany({
    where: { collegeId, active: true },
    select: {
      id: true,
      name: true,
      code: true,
      department: { select: { code: true } },
      class: { select: { semester: true } },
    },
    orderBy: [{ department: { code: "asc" } }, { name: "asc" }],
  });
}
