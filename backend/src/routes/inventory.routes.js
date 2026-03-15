const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getInventory, upsertInventory } = require("../controllers/inventory.controller");

const router = Router();

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory rows for the logged-in hospital
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Inventory retrieved }
 *       401: { description: Unauthorized }
 */
router.get("/", authenticate, authorize("hospital"), getInventory);

/**
 * @swagger
 * /api/inventory/{bloodTypeCode}:
 *   put:
 *     summary: Set units available for a blood type (creates or updates)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bloodTypeCode
 *         required: true
 *         schema: { type: string }
 *         example: "O+"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unitsAvailable]
 *             properties:
 *               unitsAvailable: { type: integer, example: 10 }
 *     responses:
 *       200: { description: Inventory updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.put("/:bloodTypeCode", authenticate, authorize("hospital"), upsertInventory);

module.exports = router;
