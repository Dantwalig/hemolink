const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// FIX #4: Seed RequestStatus so BloodRequest FK inserts don't fail
const requestStatuses = ["pending", "fulfilled", "cancelled"];

// FIX #5: Seed NotificationStatus so Notification FK inserts don't fail
const notificationStatuses = ["sent", "delivered", "failed"];

const provinces = [
  { provinceCode: "KIG", name: "Kigali" },
  { provinceCode: "NOR", name: "Northern" },
  { provinceCode: "SOU", name: "Southern" },
  { provinceCode: "EAS", name: "Eastern" },
  { provinceCode: "WES", name: "Western" },
];

const districts = [
  // Kigali
  { districtCode: "GASABO",     name: "Gasabo",     provinceCode: "KIG" },
  { districtCode: "KICUKIRO",   name: "Kicukiro",   provinceCode: "KIG" },
  { districtCode: "NYARUGENGE", name: "Nyarugenge", provinceCode: "KIG" },
  // Northern
  { districtCode: "BURERA",   name: "Burera",   provinceCode: "NOR" },
  { districtCode: "GAKENKE",  name: "Gakenke",  provinceCode: "NOR" },
  { districtCode: "GICUMBI",  name: "Gicumbi",  provinceCode: "NOR" },
  { districtCode: "MUSANZE",  name: "Musanze",  provinceCode: "NOR" },
  { districtCode: "RULINDO",  name: "Rulindo",  provinceCode: "NOR" },
  // Southern
  { districtCode: "GISAGARA",  name: "Gisagara",  provinceCode: "SOU" },
  { districtCode: "HUYE",      name: "Huye",      provinceCode: "SOU" },
  { districtCode: "KAMONYI",   name: "Kamonyi",   provinceCode: "SOU" },
  { districtCode: "MUHANGA",   name: "Muhanga",   provinceCode: "SOU" },
  { districtCode: "NYAMAGABE", name: "Nyamagabe", provinceCode: "SOU" },
  { districtCode: "NYANZA",    name: "Nyanza",    provinceCode: "SOU" },
  { districtCode: "NYARUGURU", name: "Nyaruguru", provinceCode: "SOU" },
  { districtCode: "RUHANGO",   name: "Ruhango",   provinceCode: "SOU" },
  // Eastern
  { districtCode: "BUGESERA",  name: "Bugesera",  provinceCode: "EAS" },
  { districtCode: "GATSIBO",   name: "Gatsibo",   provinceCode: "EAS" },
  { districtCode: "KAYONZA",   name: "Kayonza",   provinceCode: "EAS" },
  { districtCode: "KIREHE",    name: "Kirehe",    provinceCode: "EAS" },
  { districtCode: "NGOMA",     name: "Ngoma",     provinceCode: "EAS" },
  { districtCode: "NYAGATARE", name: "Nyagatare", provinceCode: "EAS" },
  { districtCode: "RWAMAGANA", name: "Rwamagana", provinceCode: "EAS" },
  // Western
  { districtCode: "KARONGI",    name: "Karongi",    provinceCode: "WES" },
  { districtCode: "NGORORERO",  name: "Ngororero",  provinceCode: "WES" },
  { districtCode: "NYABIHU",    name: "Nyabihu",    provinceCode: "WES" },
  { districtCode: "NYAMASHEKE", name: "Nyamasheke", provinceCode: "WES" },
  { districtCode: "RUBAVU",     name: "Rubavu",     provinceCode: "WES" },
  { districtCode: "RUTSIRO",    name: "Rutsiro",    provinceCode: "WES" },
  { districtCode: "RUSIZI",     name: "Rusizi",     provinceCode: "WES" },
];

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

  // FIX #4
  console.log("Seeding request statuses...");
  for (const code of requestStatuses) {
    await prisma.requestStatus.upsert({
      where: { statusCode: code },
      update: {},
      create: { statusCode: code },
    });
  }
  console.log(`Seeded ${requestStatuses.length} request statuses.`);

  // FIX #5
  console.log("Seeding notification statuses...");
  for (const code of notificationStatuses) {
    await prisma.notificationStatus.upsert({
      where: { deliveryStatusCode: code },
      update: {},
      create: { deliveryStatusCode: code },
    });
  }
  console.log(`Seeded ${notificationStatuses.length} notification statuses.`);

  console.log("Seeding Rwanda provinces...");
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { provinceCode: province.provinceCode },
      update: {},
      create: province,
    });
  }
  console.log(`Seeded ${provinces.length} provinces.`);

  console.log("Seeding Rwanda districts...");
  for (const district of districts) {
    await prisma.district.upsert({
      where: { districtCode: district.districtCode },
      update: {},
      create: district,
    });
  }
  console.log(`Seeded ${districts.length} districts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());