import { describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const findFirstMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    department: {
      findMany: (...args: unknown[]) => findManyMock("department", ...args),
      findFirst: (...args: unknown[]) => findFirstMock("department", ...args),
    },
    class: {
      findFirst: (...args: unknown[]) => findFirstMock("class", ...args),
    },
    subject: {
      findMany: (...args: unknown[]) => findManyMock("subject", ...args),
      findFirst: (...args: unknown[]) => findFirstMock("subject", ...args),
    },
    resource: {
      findMany: (...args: unknown[]) => findManyMock("resource", ...args),
      update: (...args: unknown[]) => updateMock("resource", ...args),
    },
  },
}));

import {
  getCollegeDepartments,
  getDepartmentWithClasses,
  getSemesterSubjects,
  getSubjectResources,
  recordResourceDownload,
} from "./queries";

describe("Library database queries (Multi-tenancy)", () => {
  it("scopes getCollegeDepartments strictly to collegeId", async () => {
    findManyMock.mockResolvedValueOnce([{ id: "d1", name: "Computer", code: "COMP" }]);

    const result = await getCollegeDepartments("college-pilot");
    expect(findManyMock).toHaveBeenCalledWith(
      "department",
      expect.objectContaining({
        where: expect.objectContaining({ collegeId: "college-pilot", active: true }),
      }),
    );
    expect(result).toHaveLength(1);
  });

  it("scopes getDepartmentWithClasses to collegeId and department code", async () => {
    findFirstMock.mockResolvedValueOnce({
      id: "dept-comp",
      code: "COMP",
      classes: [],
    });

    await getDepartmentWithClasses("college-pilot", "comp");
    expect(findFirstMock).toHaveBeenCalledWith(
      "department",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-pilot",
          code: "COMP",
        }),
      }),
    );
  });

  it("retrieves subjects for a semester strictly within collegeId", async () => {
    findFirstMock
      .mockResolvedValueOnce({ id: "dept-1", code: "COMP" }) // department
      .mockResolvedValueOnce({ id: "class-1", semester: 3 }); // class
    findManyMock.mockResolvedValueOnce([
      { id: "sub-1", name: "Data Structures", code: "COMP301" },
    ]);

    const result = await getSemesterSubjects("college-pilot", "comp", 3);
    expect(result).not.toBeNull();
    expect(result?.subjects).toHaveLength(1);
    expect(findManyMock).toHaveBeenCalledWith(
      "subject",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-pilot",
          departmentId: "dept-1",
          classId: "class-1",
          active: true,
        }),
      }),
    );
  });

  it("filters only APPROVED resources for students", async () => {
    findFirstMock.mockResolvedValueOnce({
      id: "sub-1",
      name: "DBMS",
      department: { name: "Computer" },
      class: { name: "Sem 4" },
    });
    findManyMock.mockResolvedValueOnce([
      { id: "res-1", title: "Paper 2024", status: "APPROVED" },
    ]);

    const result = await getSubjectResources("college-pilot", "sub-1", "OLD_PAPER");
    expect(result).not.toBeNull();
    expect(findManyMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-pilot",
          subjectId: "sub-1",
          status: "APPROVED",
          type: "OLD_PAPER",
        }),
      }),
    );
  });

  it("increments download count on approved resource download", async () => {
    updateMock.mockResolvedValueOnce({
      id: "res-1",
      downloadCount: 5,
    });

    await recordResourceDownload("college-pilot", "res-1");
    expect(updateMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: { id: "res-1", collegeId: "college-pilot", status: "APPROVED" },
        data: { downloadCount: { increment: 1 } },
      }),
    );
  });
});
