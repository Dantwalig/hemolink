const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const SALT_ROUNDS = 10;

// Strip password from donor object before returning
const sanitizeDonor = ({ password, ...donor }) => donor;

const register = async (req, res, next) => {
  try {
    const { fullName, phone, password, bloodTypeCode, latitude, longitude, consentSms } = req.body;

    if (!fullName || !phone || !password || !bloodTypeCode || latitude == null || longitude == null || consentSms == null) {
      return error(res, "All fields are required: fullName, phone, password, bloodTypeCode, latitude, longitude, consentSms.", 400);
    }

    if (password.length < 6) {
      return error(res, "Password must be at least 6 characters.", 400);
    }

    const existing = await prisma.donor.findUnique({ where: { phone } });
    if (existing) {
      return error(res, "A donor with this phone number already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const donor = await prisma.donor.create({
      data: {
        fullName,
        phone,
        password: hashedPassword,
        bloodTypeCode,
        latitude,
        longitude,
        consentSms,
      },
    });

    return success(res, sanitizeDonor(donor), "Donor registered successfully.", 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return error(res, "Phone and password are required.", 400);
    }

    const donor = await prisma.donor.findUnique({ where: { phone } });
    if (!donor) {
      return error(res, "Invalid phone or password.", 401);
    }

    const valid = await bcrypt.compare(password, donor.password);
    if (!valid) {
      return error(res, "Invalid phone or password.", 401);
    }

    const token = jwt.sign(
      { id: donor.donorId, role: "donor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return success(res, { donor: sanitizeDonor(donor), token }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const donor = await prisma.donor.findUnique({
      where: { donorId: req.user.id },
    });

    if (!donor) {
      return error(res, "Donor not found.", 404);
    }

    return success(res, sanitizeDonor(donor), "Profile retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bloodTypeCode, latitude, longitude, consentSms } = req.body;

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (bloodTypeCode !== undefined) data.bloodTypeCode = bloodTypeCode;
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;
    if (consentSms !== undefined) data.consentSms = consentSms;

    if (Object.keys(data).length === 0) {
      return error(res, "At least one field is required to update.", 400);
    }

    const donor = await prisma.donor.update({
      where: { donorId: req.user.id },
      data,
    });

    return success(res, sanitizeDonor(donor), "Profile updated successfully.");
  } catch (err) {
    next(err);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return error(res, "Field 'available' must be a boolean.", 400);
    }

    const donor = await prisma.donor.update({
      where: { donorId: req.user.id },
      data: { available },
    });

    return success(res, sanitizeDonor(donor), "Availability updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, updateAvailability };
