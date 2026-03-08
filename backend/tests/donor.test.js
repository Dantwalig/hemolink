const request = require("supertest");
const app = require("../src/index");

// Mock Prisma so tests don't need a real database
jest.mock("../src/config/prisma", () => ({
  donor: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require("../src/config/prisma");

// Base donor payload used across registration tests
const validDonor = {
  fullName: "Jean Pierre",
  phone: "0788000001",
  password: "secret123",
  bloodTypeCode: "O+",
  latitude: -1.9403,
  longitude: 29.8739,
  consentSms: true,
};

// Simulated stored donor (password already hashed by bcrypt)
const storedDonor = {
  donorId: 1,
  fullName: "Jean Pierre",
  phone: "0788000001",
  // bcrypt hash of "secret123" with 10 salt rounds
  password: "$2b$10$KIB0bLUjTJf4x5z.4bGKEuQvXKR1PuKGnLb5rQvNw6T4IqGWqFyYy",
  bloodTypeCode: "O+",
  latitude: -1.9403,
  longitude: 29.8739,
  available: true,
  consentSms: true,
};

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Donor Registration ────────────────────────────────────────────────────────

describe("POST /api/donors/register", () => {
  test("registers a new donor successfully", async () => {
    prisma.donor.findUnique.mockResolvedValue(null); // no existing donor
    prisma.donor.create.mockResolvedValue(storedDonor);

    const res = await request(app)
      .post("/api/donors/register")
      .send(validDonor);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Donor registered successfully.");
    // Password must never be returned in the response
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.phone).toBe(validDonor.phone);
  });

  test("returns 409 when phone number is already registered", async () => {
    prisma.donor.findUnique.mockResolvedValue(storedDonor); // duplicate

    const res = await request(app)
      .post("/api/donors/register")
      .send(validDonor);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/donors/register")
      .send({ fullName: "Jean Pierre", phone: "0788000001" }); // missing most fields

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 400 when password is shorter than 6 characters", async () => {
    prisma.donor.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/donors/register")
      .send({ ...validDonor, password: "abc" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  test("does not store plaintext password", async () => {
    prisma.donor.findUnique.mockResolvedValue(null);
    prisma.donor.create.mockResolvedValue(storedDonor);

    await request(app).post("/api/donors/register").send(validDonor);

    // Confirm Prisma received a hashed password, not the plaintext one
    const createCall = prisma.donor.create.mock.calls[0][0];
    expect(createCall.data.password).not.toBe(validDonor.password);
    expect(createCall.data.password).toMatch(/^\$2b\$/); // bcrypt hash prefix
  });
});

// ─── Donor Login ──────────────────────────────────────────────────────────────

describe("POST /api/donors/login", () => {
  test("logs in with valid credentials and returns a JWT token", async () => {
    // Use a real bcrypt hash so bcrypt.compare works during the test
    const bcrypt = require("bcrypt");
    const realHash = await bcrypt.hash("secret123", 10);
    prisma.donor.findUnique.mockResolvedValue({ ...storedDonor, password: realHash });

    const res = await request(app)
      .post("/api/donors/login")
      .send({ phone: "0788000001", password: "secret123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful.");
    expect(res.body.data.token).toBeDefined();
    // Password must never be returned in the response
    expect(res.body.data.donor.password).toBeUndefined();
  });

  test("returns 401 when donor is not found", async () => {
    prisma.donor.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/donors/login")
      .send({ phone: "0799999999", password: "secret123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid phone or password/i);
  });

  test("returns 401 when password is incorrect", async () => {
    const bcrypt = require("bcrypt");
    const realHash = await bcrypt.hash("secret123", 10);
    prisma.donor.findUnique.mockResolvedValue({ ...storedDonor, password: realHash });

    const res = await request(app)
      .post("/api/donors/login")
      .send({ phone: "0788000001", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid phone or password/i);
  });

  test("returns 400 when phone or password field is missing", async () => {
    const res = await request(app)
      .post("/api/donors/login")
      .send({ phone: "0788000001" }); // missing password

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
