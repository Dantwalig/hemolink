const crypto = require("crypto");
const prisma  = require("../config/prisma");

/**
 * Simulate sending an SMS to a donor for a blood request.
 * - Creates a Notification record with a unique token
 * - Logs the SMS content to the console (replace with MTN API later)
 * - Returns the notification record
 *
 * The SMS link format: https://<host>/donor/respond?token=<token>
 */
async function sendMockSms(donor, bloodRequest, hospital) {
  const token = crypto.randomBytes(32).toString("hex");

  // Build the SMS message exactly as it would be sent via MTN
  const respondUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/donor/respond?token=${token}`;

  const message =
    `[HemoLink Rwanda] URGENT: ${hospital.name} needs ${bloodRequest.unitsNeeded} unit(s) of ` +
    `${bloodRequest.bloodTypeCode} blood (${bloodRequest.urgencyLevel} urgency). ` +
    `Can you donate? Reply here: ${respondUrl}`;

  // Save notification record
  const notification = await prisma.notification.create({
    data: {
      requestId:          bloodRequest.requestId,
      donorId:            donor.donorId,
      token,
      sentAt:             new Date(),
      deliveryStatusCode: "sent",
      responseStatus:     "pending",
      // Store the SMS message text for display in the admin panel
      smsMessage:         message,
    },
  });

  // Console log — replace this block with MTN API call when ready
  console.log(`\n📱 [MOCK SMS] To: ${donor.phone}`);
  console.log(`   Message: ${message}\n`);

  return notification;
}

/**
 * Send mock SMS to all matched donors for a request.
 * Returns array of created notification records.
 */
async function notifyMatchedDonors(matchedDonors, bloodRequest, hospital) {
  const results = [];
  for (const donor of matchedDonors) {
    try {
      const notification = await sendMockSms(donor, bloodRequest, hospital);
      results.push({ donorId: donor.donorId, notificationId: notification.notificationId, status: "sent" });
    } catch (err) {
      console.error(`Failed to notify donor ${donor.donorId}:`, err.message);
      results.push({ donorId: donor.donorId, status: "failed", error: err.message });
    }
  }
  return results;
}

module.exports = { sendMockSms, notifyMatchedDonors };