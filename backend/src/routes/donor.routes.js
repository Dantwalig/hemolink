const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateAvailability,
  getDonorLocations,
} = require("../controllers/donor.controller");

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     DonorResponse:
 *       type: object
 *       properties:
 *         donorId:
 *           type: integer
 *         fullName:
 *           type: string
 *         phone:
 *           type: string
 *         bloodTypeCode:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         available:
 *           type: boolean
 *         consentSms:
 *           type: boolean
 */

/**
 * @swagger
 * /api/donors/register:
 *   post:
 *     summary: Register a new donor
 *     tags: [Donors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - password
 *               - bloodTypeCode
 *               - latitude
 *               - longitude
 *               - consentSms
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jean Pierre"
 *               phone:
 *                 type: string
 *                 example: "0788000001"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *               bloodTypeCode:
 *                 type: string
 *                 example: "O+"
 *               latitude:
 *                 type: number
 *                 example: -1.9403
 *               longitude:
 *                 type: number
 *                 example: 29.8739
 *               consentSms:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Donor registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Phone number already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /api/donors/login:
 *   post:
 *     summary: Login a donor
 *     tags: [Donors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0788000001"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Login successful, returns donor profile and JWT token
 *       401:
 *         description: Invalid phone or password
 */
router.post("/login", login);

/**
 * @swagger
 * /api/donors/profile:
 *   get:
 *     summary: Get current donor's profile
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, authorize("donor"), getProfile);

/**
 * @swagger
 * /api/donors/profile:
 *   put:
 *     summary: Update donor profile
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bloodTypeCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               consentSms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: At least one field required
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authenticate, authorize("donor"), updateProfile);

/**
 * @swagger
 * /api/donors/availability:
 *   put:
 *     summary: Update donor availability status
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - available
 *             properties:
 *               available:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Field 'available' must be a boolean
 *       401:
 *         description: Unauthorized
 */
router.put("/availability", authenticate, authorize("donor"), updateAvailability);

/**
 * @swagger
 * /api/donors/locations:
 *   get:
 *     summary: Get available donor locations (hospital use only)
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available donor lat/lng points
 */
router.get("/locations", authenticate, authorize("hospital"), getDonorLocations);

module.exports = router;
