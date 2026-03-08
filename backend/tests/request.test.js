const request = require("supertest");
const app = require("../src/index");
const jwt = require("jsonwebtoken");

// Mock Prisma so tests don't need a real database
jest.mock("../src/config/prisma", () => ({
  donor:    { findUnique: jest.fn(), create: jest.fn() },
  hospital: { findUnique: jest.fn(), create: jest.fn() },
  province: { findUnique: jest.fn() },
  district: { findUnique: jest.fn() },
  bloodRequest: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
}));

const prisma = require("../src/config/prisma");

// Generate a valid hospital JWT so protected routes let requests through
const hospitalToken = jwt.sign(
  { id: 1, role: "hospital" },
  process.env.JWT_SECRET || "test_secret"
);

// Simulated blood request returned from Prisma
const storedRequest = {
  requestId: 1,
  hospitalId: 1,
  bloodTypeCode: "O+",
  unitsNeeded: 3,
  urgencyLevel: "high",
  statusCode: "pending",
  neededBy: new Date("2026-03-10T08:00:00.000Z"),
};

// Valid payload for creating a blood request
const validPayload = {
  bloodTypeCode: "O+",
  unitsNeeded: 3,
  urgencyLevel: "high",
  neededBy: "2026-03-10T08:00:00.000Z",
};

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Create Blood Request ──────────────────────────────────────────────────────

describe("POST /api/requests", () => {
  test("creates a blood request successfully", async () => {
    prisma.bloodRequest.create.mockResolvedValue(storedRequest);

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Blood request created successfully.");
    expect(res.body.data.statusCode).toBe("pending");
    expect(res.body.data.bloodTypeCode).toBe("O+");
  });

  test("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ bloodTypeCode: "O+" }); // missing unitsNeeded, urgencyLevel, neededBy

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 400 when unitsNeeded is not a positive integer", async () => {
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ ...validPayload, unitsNeeded: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/positive integer/i);
  });

  test("returns 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/requests")
      .send(validPayload);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("returns 403 when a donor tries to create a request", async () => {
    const donorToken = jwt.sign(
      { id: 10, role: "donor" },
      process.env.JWT_SECRET || "test_secret"
    );

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${donorToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── Update Request Status ─────────────────────────────────────────────────────

describe("PATCH /api/requests/:id/status", () => {
  test("updates status to fulfilled successfully", async () => {
    prisma.bloodRequest.findUnique.mockResolvedValue(storedRequest);
    prisma.bloodRequest.update.mockResolvedValue({ ...storedRequest, statusCode: "fulfilled" });

    const res = await request(app)
      .patch("/api/requests/1/status")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ status: "fulfilled" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.statusCode).toBe("fulfilled");
  });

  test("updates status to cancelled successfully", async () => {
    prisma.bloodRequest.findUnique.mockResolvedValue(storedRequest);
    prisma.bloodRequest.update.mockResolvedValue({ ...storedRequest, statusCode: "cancelled" });

    const res = await request(app)
      .patch("/api/requests/1/status")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ status: "cancelled" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.statusCode).toBe("cancelled");
  });

  test("returns 400 when status field is missing", async () => {
    const res = await request(app)
      .patch("/api/requests/1/status")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 400 when status is not a valid value", async () => {
    const res = await request(app)
      .patch("/api/requests/1/status")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ status: "approved" }); // not a valid status

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid status/i);
  });

  test("returns 404 when blood request does not exist", async () => {
    prisma.bloodRequest.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/requests/999/status")
      .set("Authorization", `Bearer ${hospitalToken}`)
      .send({ status: "fulfilled" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test("returns 401 when no token is provided", async () => {
    const res = await request(app)
      .patch("/api/requests/1/status")
      .send({ status: "fulfilled" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
