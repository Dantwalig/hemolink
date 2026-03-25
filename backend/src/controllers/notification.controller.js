const crypto = require("crypto");
const prisma  = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

// GET /api/notifications/token/:token
// Called by DonorRespondPage when a donor opens the SMS link.
// Returns enough info for the donor to see what they're responding to.
const getByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { token },
      include: {
        bloodRequest: {
          include: {
            hospital:  { select: { name: true, sector: true, districtCode: true, latitude: true, longitude: true } },
            bloodType: true,
          },
        },
        donor: { select: { donorId: true, latitude: true, longitude: true } },
      },
    });

    if (!notification) {
      return error(res, "Invalid or expired token.", 404);
    }

    // If request is already fulfilled/cancelled, treat as expired
    if (["fulfilled", "cancelled"].includes(notification.bloodRequest.statusCode)) {
      return res.status(410).json({ success: false, message: "This request has been fulfilled or cancelled." });
    }

    // If donor already responded, also treat as expired
    if (notification.responseStatus && notification.responseStatus !== "pending") {
      return res.status(410).json({ success: false, message: "You have already responded to this request." });
    }

    // Haversine distance (km) between donor and hospital
    const hospital = notification.bloodRequest.hospital;
    let distance = null;
    if (
      notification.donor.latitude != null &&
      notification.donor.longitude != null &&
      hospital.latitude != null &&
      hospital.longitude != null
    ) {
      const R    = 6371;
      const dLat = ((hospital.latitude  - notification.donor.latitude)  * Math.PI) / 180;
      const dLon = ((hospital.longitude - notification.donor.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((notification.donor.latitude  * Math.PI) / 180) *
        Math.cos((hospital.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
      distance = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
    }

    return success(res, {
      notification_id:  notification.notificationId,
      hospital_name:    notification.bloodRequest.hospital.name,
      hospital_sector:  notification.bloodRequest.hospital.sector,
      blood_type_code:  notification.bloodRequest.bloodTypeCode,
      units_needed:     notification.bloodRequest.unitsNeeded,
      urgency_level:    notification.bloodRequest.urgencyLevel,
      needed_by:        notification.bloodRequest.neededBy,
      distance_km:      distance,
    }, "Request details retrieved.");
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/respond
// Donor submits their response (Accepted / Declined) via the SMS link page.
const respond = async (req, res, next) => {
  try {
    const { token, response_status } = req.body;

    if (!token || !response_status) {
      return error(res, "token and response_status are required.", 400);
    }

    const VALID = ["Accepted", "Declined"];
    if (!VALID.includes(response_status)) {
      return error(res, `response_status must be one of: ${VALID.join(", ")}.`, 400);
    }

    const notification = await prisma.notification.findUnique({ where: { token } });

    if (!notification) {
      return error(res, "Invalid token.", 404);
    }

    if (notification.responseStatus && notification.responseStatus !== "pending") {
      return res.status(410).json({ success: false, message: "Already responded." });
    }

    const updated = await prisma.notification.update({
      where: { token },
      data:  { responseStatus: response_status },
    });

    return success(res, updated, "Response recorded successfully.");
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/generate-token  (internal / admin use)
// Creates a notification record and returns a secure one-time token.
const generateToken = async (req, res, next) => {
  try {
    const { requestId, donorId } = req.body;

    if (!requestId || !donorId) {
      return error(res, "requestId and donorId are required.", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");

    const notification = await prisma.notification.create({
      data: {
        requestId,
        donorId,
        token,
        sentAt:             new Date(),
        deliveryStatusCode: "sent",
        responseStatus:     "pending",
      },
    });

    return success(res, { token, notificationId: notification.notificationId }, "Token generated.", 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getByToken, respond, generateToken };