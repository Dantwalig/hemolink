const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  login,
  getStats,
  getHospitals,
  approveHospital,
  rejectHospital,
  getDonors,
  getNotifications,
  getAllRequests,
} = require("../controllers/admin.controller");

const router = Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login (RBC staff — @rbc.gov.rw email required)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "admin@rbc.gov.rw" }
 *               password: { type: string, example: "adminpass" }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 *       403: { description: Not an RBC email }
 */
router.post("/login", login);

// All routes below require admin JWT
router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Platform-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Stats object }
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /api/admin/hospitals:
 *   get:
 *     summary: Get all hospitals (approved and pending)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/hospitals", getHospitals);

/**
 * @swagger
 * /api/admin/hospitals/{id}/approve:
 *   patch:
 *     summary: Approve a hospital account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.patch("/hospitals/:id/approve", approveHospital);

/**
 * @swagger
 * /api/admin/hospitals/{id}/reject:
 *   delete:
 *     summary: Reject and remove a hospital account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.delete("/hospitals/:id/reject", rejectHospital);

/**
 * @swagger
 * /api/admin/donors:
 *   get:
 *     summary: Get all registered donors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/donors", getDonors);

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Get SMS notification log (last 100)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/notifications", getNotifications);

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all blood requests across all hospitals
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/requests", getAllRequests);

module.exports = router;