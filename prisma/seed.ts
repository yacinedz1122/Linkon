import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminPass = await bcrypt.hash("yacinedz1122", 10);
  await prisma.user.upsert({
    where: { email: "dz8040231@gmail.com" },
    update: {},
    create: {
      email: "dz8040231@gmail.com",
      name: "Owner Admin",
      password: adminPass,
      role: "ADMIN"
    }
  });

  const demoPass = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: {
      email: "demo@local",
      name: "Demo User",
      password: demoPass,
      role: "USER"
    }
  });

  console.log("Seeded admin and demo user.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
