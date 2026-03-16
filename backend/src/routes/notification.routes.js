const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getByToken, respond, generateToken } = require("../controllers/notification.controller");

const router = Router();

/**
 * @swagger
 * /api/notifications/token/{token}:
 *   get:
 *     summary: Get blood request details by SMS token (public — no auth)
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Request details retrieved }
 *       404: { description: Invalid or expired token }
 *       410: { description: Request already fulfilled or donor already responded }
 */
router.get("/token/:token", getByToken);

/**
 * @swagger
 * /api/notifications/respond:
 *   post:
 *     summary: Donor submits their response via SMS link (public — no auth)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, response_status]
 *             properties:
 *               token:           { type: string }
 *               response_status: { type: string, enum: [Accepted, Declined] }
 *     responses:
 *       200: { description: Response recorded }
 *       400: { description: Validation error }
 *       404: { description: Invalid token }
 *       410: { description: Already responded }
 */
router.post("/respond", respond);

/**
 * @swagger
 * /api/notifications/generate-token:
 *   post:
 *     summary: Generate a one-time SMS response token (hospital only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, donorId]
 *             properties:
 *               requestId: { type: integer }
 *               donorId:   { type: integer }
 *     responses:
 *       201: { description: Token generated }
 *       400: { description: Validation error }
 */
router.post("/generate-token", authenticate, authorize("hospital"), generateToken);

module.exports = router;
