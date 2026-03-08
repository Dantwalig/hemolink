const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Rwanda's 5 provinces with short uppercase codes used as primary keys
const provinces = [
  { provinceCode: "KIG", name: "Kigali" },
  { provinceCode: "NOR", name: "Northern" },
  { provinceCode: "SOU", name: "Southern" },
  { provinceCode: "EAS", name: "Eastern" },
  { provinceCode: "WES", name: "Western" },
];

// Rwanda's 30 districts. Each entry includes the provinceCode it belongs to.
// This allows the API to verify that a submitted district actually belongs to
// the submitted province — not just that both codes individually exist.
const districts = [
  // Kigali (3 districts)
  { districtCode: "GASABO",     name: "Gasabo",     provinceCode: "KIG" },
  { districtCode: "KICUKIRO",   name: "Kicukiro",   provinceCode: "KIG" },
  { districtCode: "NYARUGENGE", name: "Nyarugenge", provinceCode: "KIG" },

  // Northern (5 districts)
  { districtCode: "BURERA",   name: "Burera",   provinceCode: "NOR" },
  { districtCode: "GAKENKE",  name: "Gakenke",  provinceCode: "NOR" },
  { districtCode: "GICUMBI",  name: "Gicumbi",  provinceCode: "NOR" },
  { districtCode: "MUSANZE",  name: "Musanze",  provinceCode: "NOR" },
  { districtCode: "RULINDO",  name: "Rulindo",  provinceCode: "NOR" },

  // Southern (8 districts)
  { districtCode: "GISAGARA",  name: "Gisagara",  provinceCode: "SOU" },
  { districtCode: "HUYE",      name: "Huye",      provinceCode: "SOU" },
  { districtCode: "KAMONYI",   name: "Kamonyi",   provinceCode: "SOU" },
  { districtCode: "MUHANGA",   name: "Muhanga",   provinceCode: "SOU" },
  { districtCode: "NYAMAGABE", name: "Nyamagabe", provinceCode: "SOU" },
  { districtCode: "NYANZA",    name: "Nyanza",    provinceCode: "SOU" },
  { districtCode: "NYARUGURU", name: "Nyaruguru", provinceCode: "SOU" },
  { districtCode: "RUHANGO",   name: "Ruhango",   provinceCode: "SOU" },

  // Eastern (7 districts)
  { districtCode: "BUGESERA",  name: "Bugesera",  provinceCode: "EAS" },
  { districtCode: "GATSIBO",   name: "Gatsibo",   provinceCode: "EAS" },
  { districtCode: "KAYONZA",   name: "Kayonza",   provinceCode: "EAS" },
  { districtCode: "KIREHE",    name: "Kirehe",    provinceCode: "EAS" },
  { districtCode: "NGOMA",     name: "Ngoma",     provinceCode: "EAS" },
  { districtCode: "NYAGATARE", name: "Nyagatare", provinceCode: "EAS" },
  { districtCode: "RWAMAGANA", name: "Rwamagana", provinceCode: "EAS" },

  // Western (7 districts)
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

  // Provinces must be seeded before districts because districts reference them
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
