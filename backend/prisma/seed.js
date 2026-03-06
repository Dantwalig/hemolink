const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

async function main() {
  console.log("Seeding blood types...");

  for (const code of bloodTypes) {
    await prisma.bloodType.upsert({
      where: { bloodTypeCode: code },
      update: {},
      create: { bloodTypeCode: code },
    });
  }

  console.log(`Seeded ${bloodTypes.length} blood types.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
