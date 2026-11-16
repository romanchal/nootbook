import { describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const findFirstMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    bookmark: {
      findMany: (...args: unknown[]) => findManyMock("bookmark", ...args),
      findUnique: (...args: unknown[]) => findUniqueMock("bookmark", ...args),
      create: (...args: unknown[]) => createMock("bookmark", ...args),
      delete: (...args: unknown[]) => deleteMock("bookmark", ...args),
    },
    resource: {
      findFirst: (...args: unknown[]) => findFirstMock("resource", ...args),
    },
  },
}));

import {
  getUserBookmarkedResourceIds,
  getUserBookmarks,
  toggleBookmark,
} from "./bookmarks";

describe("Bookmarks Feature (Step 5 Acceptance Criteria)", () => {
  it("getUserBookmarkedResourceIds scopes query strictly to collegeId and userId", async () => {
    findManyMock.mockResolvedValueOnce([
      { resourceId: "res-1" },
      { resourceId: "res-2" },
    ]);

    const ids = await getUserBookmarkedResourceIds("college-a", "user-1");

    expect(findManyMock).toHaveBeenCalledWith(
      "bookmark",
      expect.objectContaining({
        where: { collegeId: "college-a", userId: "user-1" },
        select: { resourceId: true },
      }),
    );
    expect(ids).toEqual(["res-1", "res-2"]);
  });

  it("getUserBookmarks requires resource.status to be APPROVED and filters by collegeId", async () => {
    const dummyDate = new Date();
    findManyMock.mockResolvedValueOnce([
      {
        id: "b-1",
        createdAt: dummyDate,
        resource: {
          id: "res-1",
          title: "Operating Systems Notes",
          description: null,
          type: "NOTES",
          fileName: "os_notes.pdf",
          fileSize: 1024,
          academicYear: "2024",
          examType: "End-Sem",
          verifiedBadge: true,
          downloadCount: 15,
          subject: { id: "sub-1", name: "Operating Systems", code: "OS" },
          department: { name: "Computer", code: "COMP" },
          class: { semester: 4 },
          uploader: { name: "Student A" },
        },
      },
    ]);

    const bookmarks = await getUserBookmarks("college-a", "user-1");

    expect(findManyMock).toHaveBeenCalledWith(
      "bookmark",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-a",
          userId: "user-1",
          resource: { status: "APPROVED" },
        }),
      }),
    );
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].title).toBe("Operating Systems Notes");
  });

  it("toggleBookmark creates a new bookmark when none exists", async () => {
    // 1. Resource exists in the user's college
    findFirstMock.mockResolvedValueOnce({ id: "res-1" });
    // 2. No existing bookmark
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({ id: "b-new" });

    const result = await toggleBookmark("college-a", "user-1", "res-1");

    expect(findFirstMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          id: "res-1",
          collegeId: "college-a",
          status: "APPROVED",
        }),
      }),
    );
    expect(createMock).toHaveBeenCalledWith(
      "bookmark",
      expect.objectContaining({
        data: {
          collegeId: "college-a",
          userId: "user-1",
          resourceId: "res-1",
        },
      }),
    );
    expect(result.bookmarked).toBe(true);
  });

  it("toggleBookmark deletes existing bookmark when one exists", async () => {
    // 1. Resource exists in the user's college
    findFirstMock.mockResolvedValueOnce({ id: "res-1" });
    // 2. Existing bookmark found
    findUniqueMock.mockResolvedValueOnce({ id: "b-existing" });
    deleteMock.mockResolvedValueOnce({ id: "b-existing" });

    const result = await toggleBookmark("college-a", "user-1", "res-1");

    expect(deleteMock).toHaveBeenCalledWith(
      "bookmark",
      expect.objectContaining({
        where: { id: "b-existing" },
      }),
    );
    expect(result.bookmarked).toBe(false);
  });

  it("toggleBookmark throws error if resource belongs to another college (multi-tenant boundary)", async () => {
    // Resource findFirst returns null because collegeId doesn't match
    findFirstMock.mockResolvedValueOnce(null);

    await expect(
      toggleBookmark("college-b", "user-1", "res-from-college-a"),
    ).rejects.toThrow(/Resource not found or inaccessible/i);

    expect(createMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
