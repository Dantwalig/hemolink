const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const prisma  = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const RBC_EMAIL_DOMAIN = "@rbc.gov.rw";
const SALT_ROUNDS      = 10;

// ---------------------------------------------------------------------------
// Admin login
// Only @rbc.gov.rw emails are accepted.
// Admin accounts are seeded via environment variables or a separate seed step.
// ---------------------------------------------------------------------------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password are required.", 400);
    }

    if (!email.endsWith(RBC_EMAIL_DOMAIN)) {
      return error(res, `Admin accounts must use an ${RBC_EMAIL_DOMAIN} email address.`, 403);
    }

    // Admin credentials stored in environment variables
    // ADMIN_EMAIL and ADMIN_PASSWORD_HASH set in .env
    const adminEmail        = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return error(res, "Admin account not configured. Contact system administrator.", 500);
    }

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return error(res, "Invalid email or password.", 401);
    }

    const valid = await bcrypt.compare(password, adminPasswordHash);
    if (!valid) {
      return error(res, "Invalid email or password.", 401);
    }

    const token = jwt.sign(
      { id: 0, role: "admin", email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return success(res, { admin: { email, role: "admin" }, token }, "Admin login successful.");
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------
const getStats = async (req, res, next) => {
  try {
    const [
      totalDonors,
      availableDonors,
      totalHospitals,
      pendingApproval,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      totalNotifications,
      acceptedResponses,
    ] = await Promise.all([
      prisma.donor.count(),
      prisma.donor.count({ where: { available: true } }),
      prisma.hospital.count(),
      prisma.hospital.count({ where: { isApproved: false } }),
      prisma.bloodRequest.count(),
      prisma.bloodRequest.count({ where: { statusCode: "pending" } }),
      prisma.bloodRequest.count({ where: { statusCode: "fulfilled" } }),
      prisma.notification.count(),
      prisma.notification.count({ where: { responseStatus: "Accepted" } }),
    ]);

    return success(res, {
      donors: {
        total:     totalDonors,
        available: availableDonors,
      },
      hospitals: {
        total:          totalHospitals,
        pendingApproval,
        approved:       totalHospitals - pendingApproval,
      },
      requests: {
        total:     totalRequests,
        pending:   pendingRequests,
        fulfilled: fulfilledRequests,
      },
      notifications: {
        total:    totalNotifications,
        accepted: acceptedResponses,
        responseRate: totalNotifications > 0
          ? Math.round((acceptedResponses / totalNotifications) * 100)
          : 0,
      },
    }, "Stats retrieved.");
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Hospitals
// ---------------------------------------------------------------------------
const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        province: true,
        district: true,
        _count: {
          select: { bloodRequests: true },
        },
      },
      orderBy: { hospitalId: "desc" },
    });

    // Strip passwords
    const safe = hospitals.map(({ password, ...h }) => h);
    return success(res, safe, "Hospitals retrieved.");
  } catch (err) {
    next(err);
  }
};

const approveHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hospital = await prisma.hospital.findUnique({
      where: { hospitalId: Number(id) },
    });

    if (!hospital) {
      return error(res, "Hospital not found.", 404);
    }

    const updated = await prisma.hospital.update({
      where: { hospitalId: Number(id) },
      data:  { isApproved: true },
    });

    const { password, ...safe } = updated;
    return success(res, safe, `Hospital "${hospital.name}" has been approved.`);
  } catch (err) {
    next(err);
  }
};

const rejectHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hospital = await prisma.hospital.findUnique({
      where: { hospitalId: Number(id) },
    });

    if (!hospital) {
      return error(res, "Hospital not found.", 404);
    }

    await prisma.hospital.delete({ where: { hospitalId: Number(id) } });
    return success(res, null, `Hospital "${hospital.name}" has been rejected and removed.`);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Donors
// ---------------------------------------------------------------------------
const getDonors = async (req, res, next) => {
  try {
    const donors = await prisma.donor.findMany({
      include: {
        bloodType: true,
        _count: { select: { notifications: true } },
      },
      orderBy: { donorId: "desc" },
    });

    const safe = donors.map(({ password, ...d }) => d);
    return success(res, safe, "Donors retrieved.");
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Notifications / SMS log
// ---------------------------------------------------------------------------
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        donor: { select: { fullName: true, phone: true, bloodTypeCode: true } },
        bloodRequest: {
          include: {
            hospital: { select: { name: true } },
          },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 100,
    });

    return success(res, notifications, "Notifications retrieved.");
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// All blood requests (admin view)
// ---------------------------------------------------------------------------
const getAllRequests = async (req, res, next) => {
  try {
    const requests = await prisma.bloodRequest.findMany({
      include: {
        hospital:  { select: { name: true } },
        bloodType: true,
        requestStatus: true,
        _count: { select: { notifications: true } },
      },
      orderBy: { requestId: "desc" },
    });

    return success(res, requests, "All requests retrieved.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getStats,
  getHospitals,
  approveHospital,
  rejectHospital,
  getDonors,
  getNotifications,
  getAllRequests,
};