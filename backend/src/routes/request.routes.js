const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { createRequest, getMyRequests, updateStatus } = require("../controllers/request.controller");

const router = Router();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all blood requests for the logged-in hospital
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Requests retrieved }
 *       401: { description: Unauthorized }
 */
router.get("/", authenticate, authorize("hospital"), getMyRequests);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a blood request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bloodTypeCode, unitsNeeded, urgencyLevel, neededBy]
 *             properties:
 *               bloodTypeCode: { type: string,  example: "O+" }
 *               unitsNeeded:   { type: integer, example: 3 }
 *               urgencyLevel:  { type: string,  example: "high" }
 *               neededBy:      { type: string,  format: date-time }
 *     responses:
 *       201: { description: Blood request created }
 *       400: { description: Validation error }
 */
router.post("/", authenticate, authorize("hospital"), createRequest);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update blood request status (owner only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, fulfilled, cancelled] }
 *     responses:
 *       200: { description: Status updated }
 *       403: { description: Forbidden — not your request }
 *       404: { description: Not found }
 */
router.patch("/:id/status", authenticate, authorize("hospital"), updateStatus);

module.exports = router;