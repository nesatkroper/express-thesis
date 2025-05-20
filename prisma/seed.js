const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { ROLE, STATE, CITY } = require("./seed-data");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  console.log("Seeding states...");
  for (const state of STATE) {
    await prisma.state.upsert({
      where: { name: state.name },
      update: {},
      create: state,
    });
    console.log(`Created state: ${state.name}`);
  }

  console.log("Seeding cities...");
  for (const city of CITY) {
    await prisma.city.upsert({
      where: {
        name_stateId: {
          name: city.name,
          stateId: parseInt(city.stateId),
        },
      },
      update: {},
      create: {
        name: city.name,
        stateId: parseInt(city.stateId),
      },
    });
    console.log(`Created city: ${city.name}`);
  }

  console.log("Seeding roles with permissions...");
  for (const roleData of ROLE) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        ...roleData,
        status: "active",
      },
    });
  }

  console.log("Creating admin user...");
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found!");
  }

  await prisma.auth.upsert({
    where: { email: "superadmin@nun.com" },
    update: {},
    create: {
      email: "superadmin@nun.com",
      password: await bcrypt.hash("123456", 10),
      roleId: adminRole.roleId,
    },
  });
  console.log("Admin user created: superadmin@nun.com");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
