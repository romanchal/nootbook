import { db } from "@/lib/db";

export interface BookmarkedResourceItem {
  id: string;
  bookmarkId: string;
  bookmarkedAt: Date;
  title: string;
  description: string | null;
  type: string;
  fileName: string;
  fileSize: number;
  academicYear: string | null;
  examType: string | null;
  verifiedBadge: boolean;
  downloadCount: number;
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  department: {
    name: string;
    code: string;
  };
  class: {
    semester: number;
  };
  uploader: {
    name: string;
  };
}

/**
 * Returns the list of resource IDs bookmarked by a user in a college.
 * Used for fast lookup when rendering lists of resources.
 */
export async function getUserBookmarkedResourceIds(
  collegeId: string,
  userId: string,
): Promise<string[]> {
  const bookmarks = await db.bookmark.findMany({
    where: {
      collegeId,
      userId,
    },
    select: {
      resourceId: true,
    },
  });

  return bookmarks.map((b) => b.resourceId);
}

/**
 * Retrieves all bookmarked resources for a user within their college.
 */
export async function getUserBookmarks(
  collegeId: string,
  userId: string,
): Promise<BookmarkedResourceItem[]> {
  const bookmarks = await db.bookmark.findMany({
    where: {
      collegeId,
      userId,
      resource: {
        status: "APPROVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      resource: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          department: { select: { name: true, code: true } },
          class: { select: { semester: true } },
          uploader: { select: { name: true } },
        },
      },
    },
  });

  return bookmarks.map((b) => ({
    id: b.resource.id,
    bookmarkId: b.id,
    bookmarkedAt: b.createdAt,
    title: b.resource.title,
    description: b.resource.description,
    type: b.resource.type,
    fileName: b.resource.fileName,
    fileSize: b.resource.fileSize,
    academicYear: b.resource.academicYear,
    examType: b.resource.examType,
    verifiedBadge: b.resource.verifiedBadge,
    downloadCount: b.resource.downloadCount,
    subject: b.resource.subject,
    department: b.resource.department,
    class: b.resource.class,
    uploader: b.resource.uploader,
  }));
}

/**
 * Toggles bookmark status for a given resource.
 * If bookmarked -> deletes it.
 * If not bookmarked -> creates it (verifying the resource belongs to the college first).
 */
export async function toggleBookmark(
  collegeId: string,
  userId: string,
  resourceId: string,
): Promise<{ bookmarked: boolean }> {
  // Ensure the target resource exists and belongs to the user's college
  const resource = await db.resource.findFirst({
    where: {
      id: resourceId,
      collegeId,
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (!resource) {
    throw new Error("Resource not found or inaccessible in your college.");
  }

  const existing = await db.bookmark.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  if (existing) {
    await db.bookmark.delete({
      where: { id: existing.id },
    });
    return { bookmarked: false };
  } else {
    await db.bookmark.create({
      data: {
        collegeId,
        userId,
        resourceId,
      },
    });
    return { bookmarked: true };
  }
}
