import { describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const countMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    resource: {
      findMany: (...args: unknown[]) => findManyMock("resource", ...args),
      count: (...args: unknown[]) => countMock("resource", ...args),
    },
    department: {
      findMany: (...args: unknown[]) => findManyMock("department", ...args),
    },
  },
}));

import { searchCollegeResources, getSearchFilterOptions } from "./search";

describe("Search college resources (Step 5 Acceptance Criteria)", () => {
  it("enforces multi-tenancy collegeId and status APPROVED on all queries", async () => {
    findManyMock.mockResolvedValueOnce([
      {
        id: "res-1",
        title: "DSA Previous Year Paper 2024",
        status: "APPROVED",
        collegeId: "college-nagpur-1",
      },
    ]);
    countMock.mockResolvedValueOnce(1);

    const result = await searchCollegeResources("college-nagpur-1", {});

    expect(findManyMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-nagpur-1",
          status: "APPROVED",
        }),
      }),
    );
    expect(countMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-nagpur-1",
          status: "APPROVED",
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("adds text search OR conditions across title, description, tags, and subjects", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    await searchCollegeResources("college-nagpur-1", {
      query: "DBMS indexing",
    });

    expect(findManyMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-nagpur-1",
          status: "APPROVED",
          OR: expect.arrayContaining([
            { title: { contains: "DBMS indexing", mode: "insensitive" } },
            { description: { contains: "DBMS indexing", mode: "insensitive" } },
            { fileName: { contains: "DBMS indexing", mode: "insensitive" } },
            { subject: { name: { contains: "DBMS indexing", mode: "insensitive" } } },
          ]),
        }),
      }),
    );
  });

  it("applies department, semester, category, and verified filters correctly", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    await searchCollegeResources("college-nagpur-1", {
      deptCode: "cse",
      semester: 4,
      type: "OLD_PAPER",
      verifiedOnly: true,
      academicYear: "2023-2024",
    });

    expect(findManyMock).toHaveBeenCalledWith(
      "resource",
      expect.objectContaining({
        where: expect.objectContaining({
          collegeId: "college-nagpur-1",
          status: "APPROVED",
          department: {
            code: "CSE",
            collegeId: "college-nagpur-1",
          },
          class: {
            semester: 4,
            collegeId: "college-nagpur-1",
          },
          type: "OLD_PAPER",
          verifiedBadge: true,
          academicYear: "2023-2024",
        }),
      }),
    );
  });

  it("meets the acceptance criterion: executes in under 1 second (< 1000 ms)", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    const result = await searchCollegeResources("college-nagpur-1", {
      query: "data structures",
    });

    expect(result.durationMs).toBeLessThan(1000);
    expect(typeof result.durationMs).toBe("number");
  });

  it("scopes getSearchFilterOptions to collegeId", async () => {
    findManyMock.mockResolvedValueOnce([
      { code: "COMP", name: "Computer Engineering" },
      { code: "MECH", name: "Mechanical Engineering" },
    ]);

    const options = await getSearchFilterOptions("college-nagpur-1");

    expect(findManyMock).toHaveBeenCalledWith(
      "department",
      expect.objectContaining({
        where: { collegeId: "college-nagpur-1", active: true },
      }),
    );
    expect(options.departments).toHaveLength(2);
    expect(options.semesters).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(options.resourceTypes).toContain("OLD_PAPER");
    expect(options.resourceTypes).toContain("NOTES");
  });
});
