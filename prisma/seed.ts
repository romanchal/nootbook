import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEPARTMENTS = [
  { name: "Computer", code: "COMP" },
  { name: "Information Technology", code: "IT" },
  { name: "Mechanical", code: "MECH" },
  { name: "Civil", code: "CIVIL" },
  { name: "Electrical", code: "ELEC" },
  { name: "Electronics and Telecommunication", code: "ENTC" },
];

async function main() {
  const college = await prisma.college.upsert({
    where: { slug: "pilot" },
    create: { name: "Pilot College", slug: "pilot", city: "Nagpur" },
    update: {},
  });

  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { collegeId_code: { collegeId: college.id, code: dept.code } },
      create: { collegeId: college.id, name: dept.name, code: dept.code },
      update: {},
    });
  }

  console.log(
    `Seeded college "${college.name}" (${college.id}) with ${DEPARTMENTS.length} departments.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
