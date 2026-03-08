const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const VALID_STATUSES = ["pending", "fulfilled", "cancelled"];

const createRequest = async (req, res, next) => {
  try {
    const { bloodTypeCode, unitsNeeded, urgencyLevel, neededBy } = req.body;
    // Hospital ID comes from the JWT token set by the authenticate middleware
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
        // New requests start as pending
        statusCode: "pending",
        neededBy: new Date(neededBy),
      },
    });

    return success(res, bloodRequest, "Blood request created successfully.", 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return error(res, "Field 'status' is required.", 400);
    }

    if (!VALID_STATUSES.includes(status)) {
      return error(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.`, 400);
    }

    // Confirm the request exists before attempting to update
    const existing = await prisma.bloodRequest.findUnique({
      where: { requestId: Number(id) },
    });

    if (!existing) {
      return error(res, "Blood request not found.", 404);
    }

    const updated = await prisma.bloodRequest.update({
      where: { requestId: Number(id) },
      data: { statusCode: status },
    });

    return success(res, updated, "Blood request status updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, updateStatus };
