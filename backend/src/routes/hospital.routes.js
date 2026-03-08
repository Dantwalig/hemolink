const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { register, login, getProfile } = require("../controllers/hospital.controller");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HospitalResponse:
 *       type: object
 *       properties:
 *         hospitalId:
 *           type: integer
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         provinceCode:
 *           type: string
 *           example: "KIG"
 *         districtCode:
 *           type: string
 *           example: "GASABO"
 *         sector:
 *           type: string
 *         cell:
 *           type: string
 *         village:
 *           type: string
 *         latitude:
 *           type: number
 *           nullable: true
 *         longitude:
 *           type: number
 *           nullable: true
 */

/**
 * @swagger
 * /api/hospitals/register:
 *   post:
 *     summary: Register a new hospital
 *     description: |
 *       Registers a hospital in Rwanda. The address must use Rwanda's official
 *       administrative hierarchy: Province → District → Sector → Cell → Village.
 *       Province and district codes are validated against seeded reference tables.
 *       Latitude and longitude are optional; if provided, both must be given and
 *       must fall within Rwanda's geographic boundaries.
 *     tags: [Hospitals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - password
 *               - provinceCode
 *               - districtCode
 *               - sector
 *               - cell
 *               - village
 *             properties:
 *               name:
 *                 type: string
 *                 example: "King Faisal Hospital"
 *               phone:
 *                 type: string
 *                 example: "0788100021"
 *               email:
 *                 type: string
 *                 example: "kfh@hemolink.rw"
 *                 description: "Optional. Must be unique if provided."
 *               password:
 *                 type: string
 *                 example: "secure123"
 *               provinceCode:
 *                 type: string
 *                 example: "KIG"
 *                 description: "One of: KIG, NOR, SOU, EAS, WES"
 *               districtCode:
 *                 type: string
 *                 example: "GASABO"
 *                 description: "Must belong to the submitted provinceCode"
 *               sector:
 *                 type: string
 *                 example: "Remera"
 *               cell:
 *                 type: string
 *                 example: "Nyabisindu"
 *               village:
 *                 type: string
 *                 example: "Gisimenti"
 *               latitude:
 *                 type: number
 *                 example: -1.9441
 *                 description: "Optional. Must be between -2.84 and -1.05"
 *               longitude:
 *                 type: number
 *                 example: 30.0619
 *                 description: "Optional. Must be between 28.86 and 30.90"
 *     responses:
 *       201:
 *         description: Hospital registered successfully
 *       400:
 *         description: Validation error (missing fields, invalid province/district, out-of-bounds coordinates)
 *       409:
 *         description: Phone number or email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/hospitals/login:
 *   post:
 *     summary: Login a hospital
 *     tags: [Hospitals]
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
 *                 example: "0788100001"
 *               password:
 *                 type: string
 *                 example: "secure123"
 *     responses:
 *       200:
 *         description: Login successful, returns hospital profile and JWT token
 *       401:
 *         description: Invalid phone or password
 */
router.post("/login", login);

/**
 * @swagger
 * /api/hospitals/profile:
 *   get:
 *     summary: Get the logged-in hospital profile
 *     description: |
 *       Returns the profile of the currently authenticated hospital.
 *       This route is protected and requires a valid JWT token.
 *       Access is restricted to users with the hospital role.
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospital profile retrieved successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - user is not authorized as a hospital
 */
router.get("/profile", authenticate, authorize("hospital"), getProfile);

module.exports = router;