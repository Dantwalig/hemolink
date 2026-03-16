const prisma                          = require("../config/prisma");
const { success, error }              = require("../utils/apiResponse");
const { findMatchingDonors }          = require("../services/matching.service");
const { notifyMatchedDonors }         = require("../services/sms.service");

const VALID_STATUSES = ["pending", "fulfilled", "cancelled"];

const createRequest = async (req, res, next) => {
  try {
    const { bloodTypeCode, unitsNeeded, urgencyLevel, neededBy, radiusKm } = req.body;
    const hospitalId = req.user.id;

    if (!bloodTypeCode || unitsNeeded == null || !urgencyLevel || !neededBy) {
      return error(res, "All fields are required: bloodTypeCode, unitsNeeded, urgencyLevel, neededBy.", 400);
    }

    if (!Number.isInteger(unitsNeeded) || unitsNeeded < 1) {
      return error(res, "unitsNeeded must be a positive integer.", 400);
    }

    // radiusKm is optional — null means search all donors city-wide
    const radius = radiusKm != null ? parseFloat(radiusKm) : null;
    if (radius !== null && (isNaN(radius) || radius <= 0)) {
      return error(res, "radiusKm must be a positive number.", 400);
    }

    // Create the blood request
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId,
        bloodTypeCode,
        unitsNeeded,
        urgencyLevel,
        statusCode: "pending",
        neededBy:   new Date(neededBy),
        radiusKm:   radius,
      },
      include: {
        hospital:  true,
        bloodType: true,
      },
    });

    // --- Matching engine ---
    // Only run if the hospital has GPS coordinates
    let matchedDonors  = [];
    let notifications  = [];

    const hospital = bloodRequest.hospital;

    if (hospital.latitude != null && hospital.longitude != null) {
      matchedDonors = await findMatchingDonors(
        bloodTypeCode,
        hospital.latitude,
        hospital.longitude,
        radius
      );

      if (matchedDonors.length > 0) {
        notifications = await notifyMatchedDonors(matchedDonors, bloodRequest, hospital);
      }
    } else {
      console.warn(`Hospital ${hospitalId} has no GPS coordinates — skipping donor matching.`);
    }

    return success(res, {
      request:        bloodRequest,
      matchedDonors:  matchedDonors.length,
      notified:       notifications.filter(n => n.status === "sent").length,
      donorList:      matchedDonors.map(d => ({
        donorId:     d.donorId,
        fullName:    d.fullName,
        bloodType:   d.bloodTypeCode,
        distanceKm:  d.distanceKm,
      })),
    }, "Blood request created and donors notified.", 201);
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
        notifications: {
          select: {
            notificationId: true,
            responseStatus: true,
            sentAt:         true,
            donor: {
              select: { fullName: true, phone: true, bloodTypeCode: true },
            },
          },
        },
      },
      orderBy: { neededBy: "asc" },
    });

    return success(res, requests, "Requests retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    const hospitalId  = req.user.id;

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