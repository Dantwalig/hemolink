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
 *         isApproved:
 *           type: boolean
 */

/**
 * @swagger
 * /api/hospitals/register:
 *   post:
 *     summary: Register a new hospital (pending admin approval)
 *     description: |
 *       Registers a hospital in Rwanda. The account will be inactive until an admin
 *       sets isApproved = true. The email address is required and is used for login.
 *       Province and district codes are validated against seeded reference tables.
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
 *               - email
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
 *                 example: "admin@kfh.rw"
 *               password:
 *                 type: string
 *                 example: "secure123"
 *               provinceCode:
 *                 type: string
 *                 example: "KIG"
 *               districtCode:
 *                 type: string
 *                 example: "GASABO"
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
 *               longitude:
 *                 type: number
 *                 example: 30.0619
 *     responses:
 *       201:
 *         description: Hospital registered, pending admin approval
 *       400:
 *         description: Validation error
 *       409:
 *         description: Phone or email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/hospitals/login:
 *   post:
 *     summary: Login a hospital using email + password
 *     tags: [Hospitals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@kfh.rw"
 *               password:
 *                 type: string
 *                 example: "secure123"
 *     responses:
 *       200:
 *         description: Login successful, returns hospital profile and JWT token
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account pending admin approval
 */
router.post("/login", login);

/**
 * @swagger
 * /api/hospitals/profile:
 *   get:
 *     summary: Get the logged-in hospital profile
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospital profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/profile", authenticate, authorize("hospital"), getProfile);

module.exports = router;