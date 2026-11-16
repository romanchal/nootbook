import "dotenv/config";
import { resolve4 } from "node:dns/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ResourceStatus, ResourceType } from "../src/generated/prisma/client";

async function getConnectionString(): Promise<string> {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  const url = new URL(raw);
  if (!/^\d+(\.\d+){3}$/.test(url.hostname) && url.hostname.endsWith(".pooler.supabase.com")) {
    try {
      const ips = await resolve4(url.hostname);
      if (ips.length > 0) {
        url.hostname = ips[0];
      }
    } catch {
      // Fallback if DNS query times out or fails
    }
  }
  url.searchParams.set("sslmode", "no-verify");
  return url.toString();
}

const DEPARTMENTS = [
  { name: "Computer", code: "COMP" },
  { name: "Information Technology", code: "IT" },
  { name: "Mechanical", code: "MECH" },
  { name: "Civil", code: "CIVIL" },
  { name: "Electrical", code: "ELEC" },
  { name: "Electronics and Telecommunication", code: "ENTC" },
];

const SEMESTERS = [
  { year: 1, semester: 1, name: "First Year · Sem 1" },
  { year: 1, semester: 2, name: "First Year · Sem 2" },
  { year: 2, semester: 3, name: "Second Year · Sem 3" },
  { year: 2, semester: 4, name: "Second Year · Sem 4" },
  { year: 3, semester: 5, name: "Third Year · Sem 5" },
  { year: 3, semester: 6, name: "Third Year · Sem 6" },
  { year: 4, semester: 7, name: "Final Year · Sem 7" },
  { year: 4, semester: 8, name: "Final Year · Sem 8" },
];

const COMP_SUBJECTS_BY_SEM: Record<number, Array<{ name: string; code: string }>> = {
  1: [
    { name: "Engineering Mathematics-I", code: "MTH101" },
    { name: "Applied Physics", code: "PHY101" },
    { name: "Engineering Mechanics", code: "ENG101" },
  ],
  2: [
    { name: "Engineering Mathematics-II", code: "MTH102" },
    { name: "Applied Chemistry", code: "CHM102" },
    { name: "Programming in C", code: "CSE102" },
  ],
  3: [
    { name: "Data Structures & Algorithms", code: "COMP301" },
    { name: "Digital Circuits & Logic Design", code: "COMP302" },
    { name: "Discrete Mathematics", code: "COMP303" },
    { name: "Object Oriented Programming with Java", code: "COMP304" },
  ],
  4: [
    { name: "Database Management Systems", code: "COMP401" },
    { name: "Operating Systems", code: "COMP402" },
    { name: "Theory of Computation", code: "COMP403" },
    { name: "Computer Organization & Architecture", code: "COMP404" },
  ],
  5: [
    { name: "Computer Networks", code: "COMP501" },
    { name: "Software Engineering", code: "COMP502" },
    { name: "Artificial Intelligence", code: "COMP503" },
  ],
  6: [
    { name: "Compiler Design", code: "COMP601" },
    { name: "Cloud Computing", code: "COMP602" },
    { name: "Information Security", code: "COMP603" },
  ],
  7: [
    { name: "Machine Learning & Deep Learning", code: "COMP701" },
    { name: "Distributed Systems", code: "COMP702" },
  ],
  8: [
    { name: "High Performance Computing", code: "COMP801" },
    { name: "Major Project & Seminar", code: "COMP802" },
  ],
};

async function main() {
  const connectionString = await getConnectionString();
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const college = await prisma.college.upsert({
      where: { slug: "pilot" },
      create: { name: "Pilot College", slug: "pilot", city: "Nagpur" },
      update: {},
    });

    // Seed pilot admin user for uploader/approver associations
    const adminUser = await prisma.user.upsert({
      where: { id: "pilot-seed-admin" },
      create: {
        id: "pilot-seed-admin",
        name: "Pilot Class Admin",
        email: "classadmin@pilot.edu",
        collegeId: college.id,
        status: "ACTIVE",
      },
      update: {},
    });

    await prisma.role.upsert({
      where: { id: "pilot-seed-role-admin" },
      create: {
        id: "pilot-seed-role-admin",
        userId: adminUser.id,
        name: "CLASS_ADMIN",
        collegeId: college.id,
      },
      update: {},
    });

    for (const deptData of DEPARTMENTS) {
      const dept = await prisma.department.upsert({
        where: { collegeId_code: { collegeId: college.id, code: deptData.code } },
        create: { collegeId: college.id, name: deptData.name, code: deptData.code },
        update: {},
      });

      // Seed standard classes (Year 1-4, Sem 1-8)
      for (const semData of SEMESTERS) {
        const cls = await prisma.class.upsert({
          where: {
            departmentId_year_semester_division: {
              departmentId: dept.id,
              year: semData.year,
              semester: semData.semester,
              division: "A",
            },
          },
          create: {
            collegeId: college.id,
            departmentId: dept.id,
            year: semData.year,
            semester: semData.semester,
            division: "A",
            name: `${semData.name} · A`,
          },
          update: {},
        });

        // Seed subjects for COMP (and common subjects for Year 1)
        const subjects = COMP_SUBJECTS_BY_SEM[semData.semester] ?? [];
        for (const subData of subjects) {
          const subject = await prisma.subject.upsert({
            where: {
              departmentId_classId_name: {
                departmentId: dept.id,
                classId: cls.id,
                name: subData.name,
              },
            },
            create: {
              collegeId: college.id,
              departmentId: dept.id,
              classId: cls.id,
              name: subData.name,
              code: subData.code,
            },
            update: {
              code: subData.code,
            },
          });

          // Seed sample approved resources for DBMS (COMP401)
          if (deptData.code === "COMP" && subData.code === "COMP401") {
            const sampleResources = [
              {
                id: "res-dbms-paper-2024",
                type: ResourceType.OLD_PAPER,
                title: "Winter 2024 End-Sem Question Paper (DBMS)",
                description: "Official end-semester question paper with marking scheme and question breakdown.",
                fileName: "dbms-winter-2024.pdf",
                fileKey: "samples/dbms-winter-2024.pdf",
                mimeType: "application/pdf",
                fileSize: 1420000,
                academicYear: "2024-25",
                examType: "End-Sem",
                tags: ["Question Paper", "End-Sem", "2024"],
              },
              {
                id: "res-dbms-notes-unit1",
                type: ResourceType.NOTES,
                title: "Unit 1: ER Model, Functional Dependency & Relational Algebra",
                description: "Comprehensive handwritten notes by topper with ER diagram examples and normalized schema designs.",
                fileName: "dbms-unit1-notes.pdf",
                fileKey: "samples/dbms-unit1-notes.pdf",
                mimeType: "application/pdf",
                fileSize: 2840000,
                academicYear: "2024-25",
                examType: "Theory",
                tags: ["Notes", "Topper Notes", "Unit 1"],
              },
              {
                id: "res-dbms-lab-manual",
                type: ResourceType.LAB_MANUAL,
                title: "DBMS Practical Lab Manual with Solved SQL Queries (Exp 1-10)",
                description: "Complete practical record with table schemas, DDL, DML, triggers, and PL/SQL procedure scripts.",
                fileName: "dbms-lab-manual.pdf",
                fileKey: "samples/dbms-lab-manual.pdf",
                mimeType: "application/pdf",
                fileSize: 3150000,
                academicYear: "2024-25",
                examType: "Practical",
                tags: ["Lab Manual", "SQL", "Practicals"],
              },
            ];

            for (const res of sampleResources) {
              const createdRes = await prisma.resource.upsert({
                where: { id: res.id },
                create: {
                  id: res.id,
                  collegeId: college.id,
                  departmentId: dept.id,
                  classId: cls.id,
                  subjectId: subject.id,
                  type: res.type,
                  title: res.title,
                  description: res.description,
                  fileName: res.fileName,
                  fileKey: res.fileKey,
                  mimeType: res.mimeType,
                  fileSize: res.fileSize,
                  academicYear: res.academicYear,
                  examType: res.examType,
                  status: ResourceStatus.APPROVED,
                  verifiedBadge: true,
                  uploaderId: adminUser.id,
                  approvedById: adminUser.id,
                  approvedAt: new Date(),
                },
                update: {},
              });

              for (const tag of res.tags) {
                const tagId = `${res.id}-${tag.toLowerCase().replace(/\s+/g, "-")}`;
                await prisma.resourceTag.upsert({
                  where: { id: tagId },
                  create: {
                    id: tagId,
                    resourceId: createdRes.id,
                    name: tag,
                  },
                  update: {},
                });
              }
            }
          }

          // Seed sample approved resources for DSA (COMP301)
          if (deptData.code === "COMP" && subData.code === "COMP301") {
            const sampleDsaResources = [
              {
                id: "res-dsa-paper-2024",
                type: ResourceType.OLD_PAPER,
                title: "Summer 2024 End-Sem Question Paper (DSA)",
                description: "University end-sem question paper covering trees, sorting, and graph traversals.",
                fileName: "dsa-summer-2024.pdf",
                fileKey: "samples/dsa-summer-2024.pdf",
                mimeType: "application/pdf",
                fileSize: 1100000,
                academicYear: "2023-24",
                examType: "End-Sem",
                tags: ["Question Paper", "End-Sem", "DSA"],
              },
              {
                id: "res-dsa-trees-graphs",
                type: ResourceType.NOTES,
                title: "Binary Search Trees, AVL Trees & Graph Algorithms Cheat Sheet",
                description: "Time complexity cheat sheet and algorithm tracing examples.",
                fileName: "dsa-trees-graphs.pdf",
                fileKey: "samples/dsa-trees-graphs.pdf",
                mimeType: "application/pdf",
                fileSize: 1950000,
                academicYear: "2024-25",
                examType: "Theory",
                tags: ["Cheat Sheet", "DSA", "Revision"],
              },
            ];

            for (const res of sampleDsaResources) {
              const createdRes = await prisma.resource.upsert({
                where: { id: res.id },
                create: {
                  id: res.id,
                  collegeId: college.id,
                  departmentId: dept.id,
                  classId: cls.id,
                  subjectId: subject.id,
                  type: res.type,
                  title: res.title,
                  description: res.description,
                  fileName: res.fileName,
                  fileKey: res.fileKey,
                  mimeType: res.mimeType,
                  fileSize: res.fileSize,
                  academicYear: res.academicYear,
                  examType: res.examType,
                  status: ResourceStatus.APPROVED,
                  verifiedBadge: true,
                  uploaderId: adminUser.id,
                  approvedById: adminUser.id,
                  approvedAt: new Date(),
                },
                update: {},
              });

              for (const tag of res.tags) {
                const tagId = `${res.id}-${tag.toLowerCase().replace(/\s+/g, "-")}`;
                await prisma.resourceTag.upsert({
                  where: { id: tagId },
                  create: {
                    id: tagId,
                    resourceId: createdRes.id,
                    name: tag,
                  },
                  update: {},
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `Successfully seeded Pilot College with classes, subjects, and verified sample resources.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
