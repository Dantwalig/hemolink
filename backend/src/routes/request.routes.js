const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { createRequest, updateStatus } = require("../controllers/request.controller");

const router = Router();

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
 *             required:
 *               - bloodTypeCode
 *               - unitsNeeded
 *               - urgencyLevel
 *               - neededBy
 *             properties:
 *               bloodTypeCode:
 *                 type: string
 *                 example: "O+"
 *               unitsNeeded:
 *                 type: integer
 *                 example: 3
 *               urgencyLevel:
 *                 type: string
 *                 example: "high"
 *               neededBy:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-10T08:00:00.000Z"
 *     responses:
 *       201:
 *         description: Blood request created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, authorize("hospital"), createRequest);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update blood request status
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blood request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, fulfilled, cancelled]
 *                 example: "fulfilled"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid or missing status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blood request not found
 */
router.patch("/:id/status", authenticate, authorize("hospital"), updateStatus);

module.exports = router;
