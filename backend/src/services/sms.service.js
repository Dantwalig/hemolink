const crypto = require("crypto");
const prisma  = require("../config/prisma");

// ---------------------------------------------------------------------------
// SMS Provider: Africa's Talking (primary for Rwanda)
// Set in .env:  AT_API_KEY, AT_USERNAME, AT_SENDER_ID
// If not configured, falls back to console mock so dev still works.
// ---------------------------------------------------------------------------

/**
 * Normalise a Rwandan phone number to E.164 format (+250XXXXXXXXX).
 * Accepts: 07XXXXXXXX | 2507XXXXXXXX | +2507XXXXXXXX
 */
function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250")) return `+${digits}`;
  if (digits.startsWith("0"))   return `+250${digits.slice(1)}`;
  return `+${digits}`;
}

async function sendViaSmsProvider(phoneNumber, message) {
  const apiKey   = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  const senderId = process.env.AT_SENDER_ID || "HemoLink";
  const normalised = normalisePhone(phoneNumber);

  if (!apiKey || !username) {
    // MOCK fallback — dev mode
    console.log(`\n📱 [MOCK SMS] To: ${normalised}`);
    console.log(`   Message: ${message}`);
    console.log("   ℹ️  Set AT_API_KEY and AT_USERNAME in .env to send real SMS.\n");
    return { status: "mock", recipient: normalised };
  }

  // Real Africa's Talking call
  const body = new URLSearchParams({ username, to: normalised, message, from: senderId }).toString();

  const response = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = await response.json();
  if (!response.ok) throw new Error(`Africa's Talking error: ${JSON.stringify(json)}`);

  const recipient = json?.SMSMessageData?.Recipients?.[0];
  if (!recipient) throw new Error(`Unexpected AT response: ${JSON.stringify(json)}`);
  if (recipient.status !== "Success") throw new Error(`SMS failed to ${normalised}: ${recipient.status}`);

  console.log(`✅ [SMS SENT] To: ${normalised} | AT messageId: ${recipient.messageId}`);
  return { status: "sent", recipient: normalised, messageId: recipient.messageId };
}

async function sendMockSms(donor, bloodRequest, hospital) {
  const token = crypto.randomBytes(32).toString("hex");
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const respondUrl  = `${frontendUrl}/donor/respond?token=${token}`;

  const message =
    `[HemoLink Rwanda] URGENT: ${hospital.name} needs ${bloodRequest.unitsNeeded} unit(s) of ` +
    `${bloodRequest.bloodTypeCode} blood (${bloodRequest.urgencyLevel} urgency). ` +
    `Can you donate? Reply here: ${respondUrl}`;

  let deliveryStatusCode = "sent";
  try {
    await sendViaSmsProvider(donor.phone, message);
  } catch (err) {
    console.error(`[SMS] Delivery failed for donor ${donor.donorId}:`, err.message);
    deliveryStatusCode = "failed";
  }

  const notification = await prisma.notification.create({
    data: {
      requestId:          bloodRequest.requestId,
      donorId:            donor.donorId,
      token,
      sentAt:             new Date(),
      deliveryStatusCode,
      responseStatus:     "pending",
      smsMessage:         message,
    },
  });

  return notification;
}

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

module.exports = { sendMockSms, notifyMatchedDonors, normalisePhone };
