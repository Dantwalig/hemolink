const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const VALID_STATUSES = ["pending", "fulfilled", "cancelled"];

const createRequest = async (req, res, next) => {
  try {
    const { bloodTypeCode, unitsNeeded, urgencyLevel, neededBy } = req.body;
    const hospitalId = req.user.id;

    if (!bloodTypeCode || unitsNeeded == null || !urgencyLevel || !neededBy) {
      return error(res, "All fields are required: bloodTypeCode, unitsNeeded, urgencyLevel, neededBy.", 400);
    }

    if (!Number.isInteger(unitsNeeded) || unitsNeeded < 1) {
      return error(res, "unitsNeeded must be a positive integer.", 400);
    }

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId,
        bloodTypeCode,
        unitsNeeded,
        urgencyLevel,
        statusCode: "pending",
        neededBy: new Date(neededBy),
      },
      include: {
        hospital:  { select: { name: true } },
        bloodType: true,
      },
    });

    return success(res, bloodRequest, "Blood request created successfully.", 201);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const hospitalId = req.user.id;

    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId },
      include: {
        bloodType:     true,
        requestStatus: true,
        notifications: { select: { responseStatus: true } },
      },
      orderBy: { neededBy: "asc" },
    });

    return success(res, requests, "Requests retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// FIX #9: ownership check — a hospital can only update its own requests
const updateStatus = async (req, res, next) => {
  try {
    const { id }    = req.params;
    const { status } = req.body;
    const hospitalId = req.user.id;

    if (!status) {
      return error(res, "Field 'status' is required.", 400);
    }

    if (!VALID_STATUSES.includes(status)) {
      return error(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.`, 400);
    }

    const existing = await prisma.bloodRequest.findUnique({
      where: { requestId: Number(id) },
    });

    if (!existing) {
      return error(res, "Blood request not found.", 404);
    }

    // FIX #9: only the owning hospital may change status
    if (existing.hospitalId !== hospitalId) {
      return error(res, "Forbidden. You do not own this blood request.", 403);
    }

    const updated = await prisma.bloodRequest.update({
      where: { requestId: Number(id) },
      data:  { statusCode: status },
    });

    return success(res, updated, "Blood request status updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, getMyRequests, updateStatus };