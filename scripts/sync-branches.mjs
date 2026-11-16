import { config } from "dotenv";
config();
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncBranches() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get the primary college
    const collegeRes = await client.query("SELECT id, name FROM colleges LIMIT 1");
    if (collegeRes.rows.length === 0) {
      throw new Error("No college found in database.");
    }
    const collegeId = collegeRes.rows[0].id;
    console.log(`Using college: ${collegeRes.rows[0].name} (${collegeId})`);

    // 2. Define the exact 8 branches
    const branches = [
      {
        code: "AI",
        name: "Artificial Intelligence (AI)",
        active: true,
      },
      {
        code: "CSE",
        name: "Computer Science and Engineering",
        active: false,
      },
      {
        code: "CIVIL",
        name: "Civil Engineering",
        active: false,
      },
      {
        code: "IT",
        name: "Information Technology",
        active: false,
      },
      {
        code: "EE",
        name: "Electrical Engineering",
        active: false,
      },
      {
        code: "ECE",
        name: "Electronics and Communication Engineering",
        active: false,
      },
      {
        code: "ETC",
        name: "Electronics and Telecommunication Engineering",
        active: false,
      },
      {
        code: "MECH",
        name: "Mechanical Engineering",
        active: false,
      },
    ];

    const deptMap = new Map();

    for (const b of branches) {
      // Upsert department by (collegeId, code)
      const existing = await client.query(
        'SELECT id FROM departments WHERE "collegeId" = $1 AND UPPER(code) = $2',
        [collegeId, b.code.toUpperCase()]
      );

      let deptId;
      if (existing.rows.length > 0) {
        deptId = existing.rows[0].id;
        await client.query(
          'UPDATE departments SET name = $1, active = $2, "updatedAt" = NOW() WHERE id = $3',
          [b.name, b.active, deptId]
        );
        console.log(`Updated department: ${b.code} -> active: ${b.active}`);
      } else {
        const id = `dept_${b.code.toLowerCase()}_${Date.now()}`;
        const insertRes = await client.query(
          'INSERT INTO departments (id, "collegeId", name, code, active, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
          [id, collegeId, b.name, b.code, b.active]
        );
        deptId = insertRes.rows[0].id;
        console.log(`Created department: ${b.code} (${b.name}) -> active: ${b.active}`);
      }
      deptMap.set(b.code, deptId);
    }

    // 3. For the active AI branch, ensure classes for semesters 1 through 8 exist
    const aiDeptId = deptMap.get("AI");
    const aiClasses = [
      { year: 1, semester: 1, name: "First Year · Sem 1 · Div A" },
      { year: 1, semester: 2, name: "First Year · Sem 2 · Div A" },
      { year: 2, semester: 3, name: "Second Year · Sem 3 · Div A" },
      { year: 2, semester: 4, name: "Second Year · Sem 4 · Div A" },
      { year: 3, semester: 5, name: "Third Year · Sem 5 · Div A" },
      { year: 3, semester: 6, name: "Third Year · Sem 6 · Div A" },
      { year: 4, semester: 7, name: "Final Year · Sem 7 · Div A" },
      { year: 4, semester: 8, name: "Final Year · Sem 8 · Div A" },
    ];

    const classMap = new Map();
    for (const c of aiClasses) {
      const existingClass = await client.query(
        'SELECT id FROM classes WHERE "collegeId" = $1 AND "departmentId" = $2 AND semester = $3',
        [collegeId, aiDeptId, c.semester]
      );

      let classId;
      if (existingClass.rows.length > 0) {
        classId = existingClass.rows[0].id;
      } else {
        const id = `class_ai_sem${c.semester}_${Date.now()}`;
        const ins = await client.query(
          'INSERT INTO classes (id, "collegeId", "departmentId", year, semester, division, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, \'A\', $6, NOW(), NOW()) RETURNING id',
          [id, collegeId, aiDeptId, c.year, c.semester, c.name]
        );
        classId = ins.rows[0].id;
        console.log(`Created Class: AI Semester ${c.semester}`);
      }
      classMap.set(c.semester, classId);
    }

    // 4. Seed Curriculum Subjects for AI
    const aiSubjects = [
      // Sem 1
      { sem: 1, name: "Applied Mathematics I", code: "AI-101" },
      { sem: 1, name: "Engineering Physics", code: "AI-102" },
      { sem: 1, name: "Basic Electrical & Electronics", code: "AI-103" },
      // Sem 2
      { sem: 2, name: "Applied Mathematics II", code: "AI-201" },
      { sem: 2, name: "Programming for Problem Solving (Python)", code: "AI-202" },
      { sem: 2, name: "Engineering Chemistry & Materials", code: "AI-203" },
      // Sem 3
      { sem: 3, name: "Data Structures & Algorithms", code: "AI-301" },
      { sem: 3, name: "Discrete Mathematical Structures", code: "AI-302" },
      { sem: 3, name: "Digital Logic & Computer Architecture", code: "AI-303" },
      // Sem 4
      { sem: 4, name: "Design & Analysis of Algorithms", code: "AI-401" },
      { sem: 4, name: "Database Management Systems", code: "AI-402" },
      { sem: 4, name: "Formal Language & Automata Theory", code: "AI-403" },
      // Sem 5
      { sem: 5, name: "Foundations of Artificial Intelligence", code: "AI-501" },
      { sem: 5, name: "Machine Learning Concepts & Practice", code: "AI-502" },
      { sem: 5, name: "Computer Networks & Protocols", code: "AI-503" },
      // Sem 6
      { sem: 6, name: "Deep Learning & Neural Networks", code: "AI-601" },
      { sem: 6, name: "Natural Language Processing (NLP)", code: "AI-602" },
      { sem: 6, name: "Computer Vision & Image Processing", code: "AI-603" },
      // Sem 7
      { sem: 7, name: "Reinforcement Learning & Robotics", code: "AI-701" },
      { sem: 7, name: "Cloud MLOps & Big Data Architecture", code: "AI-702" },
      { sem: 7, name: "AI Ethics, Governance & Safety", code: "AI-703" },
      // Sem 8
      { sem: 8, name: "Generative AI & LLM Systems", code: "AI-801" },
      { sem: 8, name: "Autonomous Systems & Edge AI", code: "AI-802" },
      { sem: 8, name: "Capstone Major Project", code: "AI-803" },
    ];

    for (const sub of aiSubjects) {
      const classId = classMap.get(sub.sem);
      const existingSub = await client.query(
        'SELECT id FROM subjects WHERE "collegeId" = $1 AND code = $2',
        [collegeId, sub.code]
      );

      if (existingSub.rows.length === 0) {
        const id = `sub_${sub.code.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`;
        await client.query(
          'INSERT INTO subjects (id, "collegeId", "departmentId", "classId", name, code, active, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())',
          [id, collegeId, aiDeptId, classId, sub.name, sub.code]
        );
        console.log(`Created Subject: [Sem ${sub.sem}] ${sub.code} - ${sub.name}`);
      }
    }

    await client.query("COMMIT");
    console.log("All branches, AI semesters, and subjects successfully synced!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Sync error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

syncBranches().catch(console.error);
