const request = require("supertest");
const app = require("../src/index");

// Mock Prisma so tests don't need a real database
jest.mock("../src/config/prisma", () => ({
  donor:    { findUnique: jest.fn(), create: jest.fn() },
  hospital: { findUnique: jest.fn(), create: jest.fn() },
  province: { findUnique: jest.fn() },
  district: { findUnique: jest.fn() },
}));

const prisma = require("../src/config/prisma");

// ── Fixtures ──────────────────────────────────────────────────────────────────

const validHospital = {
  name:         "King Faisal Hospital",
  phone:        "0788100001",
  email:        "kfh@hemolink.rw",
  password:     "secure123",
  provinceCode: "KIG",
  districtCode: "GASABO",
  sector:       "Remera",
  cell:         "Nyabisindu",
  village:      "Gisimenti",
  latitude:     -1.9441,
  longitude:    30.0619,
};

// Simulated DB row returned after successful creation
const storedHospital = {
  hospitalId:   1,
  name:         "King Faisal Hospital",
  phone:        "0788100001",
  email:        "kfh@hemolink.rw",
  password:     "$2b$10$KIB0bLUjTJf4x5z.4bGKEuQvXKR1PuKGnLb5rQvNw6T4IqGWqFyYy",
  provinceCode: "KIG",
  districtCode: "GASABO",
  sector:       "Remera",
  cell:         "Nyabisindu",
  village:      "Gisimenti",
  latitude:     -1.9441,
  longitude:    30.0619,
};

// Seeded reference rows
const kigaliProvince = { provinceCode: "KIG", name: "Kigali" };
const gasaboDistrict = { districtCode: "GASABO", name: "Gasabo", provinceCode: "KIG" };
const musanzeDistrict = { districtCode: "MUSANZE", name: "Musanze", provinceCode: "NOR" }; // Northern, not Kigali

// Helper: set up the "happy path" mocks for a successful registration.
// The register controller calls findUnique in this order:
//   1. hospital (phone check) → null
//   2. hospital (email check) → null
//   3. province               → kigaliProvince
//   4. district               → gasaboDistrict
const mockSuccessfulRegistration = () => {
  prisma.hospital.findUnique
    .mockResolvedValueOnce(null)         // phone: not taken
    .mockResolvedValueOnce(null);        // email: not taken
  prisma.province.findUnique.mockResolvedValue(kigaliProvince);
  prisma.district.findUnique.mockResolvedValue(gasaboDistrict);
  prisma.hospital.create.mockResolvedValue(storedHospital);
};

afterEach(() => {
  jest.clearAllMocks();
});

// ── Registration ───────────────────────────────────────────────────────────────

describe("POST /api/hospitals/register", () => {

  test("registers a new hospital successfully", async () => {
    mockSuccessfulRegistration();

    const res = await request(app)
      .post("/api/hospitals/register")
      .send(validHospital);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Hospital registered successfully.");
    expect(res.body.data.password).toBeUndefined();   // password never returned
    expect(res.body.data.phone).toBe(validHospital.phone);
    expect(res.body.data.provinceCode).toBe("KIG");
    expect(res.body.data.districtCode).toBe("GASABO");
  });

  test("registers successfully without optional email and coordinates", async () => {
    // email, latitude, longitude are all optional
    prisma.hospital.findUnique.mockResolvedValueOnce(null); // phone check only (no email)
    prisma.province.findUnique.mockResolvedValue(kigaliProvince);
    prisma.district.findUnique.mockResolvedValue(gasaboDistrict);
    prisma.hospital.create.mockResolvedValue({ ...storedHospital, email: null, latitude: null, longitude: null });

    const { email, latitude, longitude, ...withoutOptionals } = validHospital;
    const res = await request(app)
      .post("/api/hospitals/register")
      .send(withoutOptionals);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("returns 400 when required address fields are missing", async () => {
    // Omit provinceCode, districtCode, sector, cell, village
    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ name: "KFH", phone: "0788100001", password: "secure123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 400 when password is shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, password: "abc" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  test("returns 400 when email format is invalid", async () => {
    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, email: "not-an-email" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid email format/i);
  });

  test("returns 400 when only latitude is provided without longitude", async () => {
    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, longitude: undefined });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/both latitude and longitude/i);
  });

  test("returns 400 when coordinates are outside Rwanda's boundaries", async () => {
    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, latitude: -4.0, longitude: 30.0 }); // too far south

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/outside Rwanda/i);
  });

  test("returns 409 when phone number is already registered", async () => {
    prisma.hospital.findUnique.mockResolvedValueOnce(storedHospital); // phone taken

    const res = await request(app)
      .post("/api/hospitals/register")
      .send(validHospital);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/phone number already exists/i);
  });

  test("returns 409 when email is already registered", async () => {
    prisma.hospital.findUnique
      .mockResolvedValueOnce(null)           // phone: available
      .mockResolvedValueOnce(storedHospital); // email: taken

    const res = await request(app)
      .post("/api/hospitals/register")
      .send(validHospital);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/email address already exists/i);
  });

  test("returns 400 when province code does not exist in Rwanda", async () => {
    prisma.hospital.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.province.findUnique.mockResolvedValue(null); // unrecognised province

    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, provinceCode: "INVALID" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid province code/i);
  });

  test("returns 400 when district code does not exist", async () => {
    prisma.hospital.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.province.findUnique.mockResolvedValue(kigaliProvince);
    prisma.district.findUnique.mockResolvedValue(null); // unrecognised district

    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, districtCode: "NOWHERE" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid district code/i);
  });

  test("returns 400 when district does not belong to the given province", async () => {
    // MUSANZE is in Northern Province, but the hospital claims to be in KIG
    prisma.hospital.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.province.findUnique.mockResolvedValue(kigaliProvince);
    prisma.district.findUnique.mockResolvedValue(musanzeDistrict); // NOR, not KIG

    const res = await request(app)
      .post("/api/hospitals/register")
      .send({ ...validHospital, districtCode: "MUSANZE" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/does not belong to province/i);
  });

  test("does not store plaintext password", async () => {
    mockSuccessfulRegistration();

    await request(app).post("/api/hospitals/register").send(validHospital);

    const createCall = prisma.hospital.create.mock.calls[0][0];
    expect(createCall.data.password).not.toBe(validHospital.password);
    expect(createCall.data.password).toMatch(/^\$2b\$/); // bcrypt hash prefix
  });

});

// ── Login ──────────────────────────────────────────────────────────────────────

describe("POST /api/hospitals/login", () => {

  test("logs in with valid credentials and returns a JWT token", async () => {
    const bcrypt = require("bcrypt");
    const realHash = await bcrypt.hash("secure123", 10);
    prisma.hospital.findUnique.mockResolvedValue({ ...storedHospital, password: realHash });

    const res = await request(app)
      .post("/api/hospitals/login")
      .send({ phone: "0788100001", password: "secure123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful.");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.hospital.password).toBeUndefined();
  });

  test("returns 401 when hospital is not found", async () => {
    prisma.hospital.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/hospitals/login")
      .send({ phone: "0799999999", password: "secure123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid phone or password/i);
  });

  test("returns 401 when password is incorrect", async () => {
    const bcrypt = require("bcrypt");
    const realHash = await bcrypt.hash("secure123", 10);
    prisma.hospital.findUnique.mockResolvedValue({ ...storedHospital, password: realHash });

    const res = await request(app)
      .post("/api/hospitals/login")
      .send({ phone: "0788100001", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid phone or password/i);
  });

  test("returns 400 when phone or password field is missing", async () => {
    const res = await request(app)
      .post("/api/hospitals/login")
      .send({ phone: "0788100001" }); // missing password

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});
