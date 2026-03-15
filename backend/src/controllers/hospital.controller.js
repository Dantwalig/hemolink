const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const SALT_ROUNDS = 10;

const RWANDA_BOUNDS = {
  latMin: -2.84,
  latMax: -1.05,
  lonMin: 28.86,
  lonMax: 30.90,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeHospital = ({ password, ...hospital }) => hospital;

const register = async (req, res, next) => {
  try {
    const {
      name, phone, email, password,
      provinceCode, districtCode, sector, cell, village,
      latitude, longitude,
    } = req.body;

    // email is now required for login
    if (!name || !phone || !email || !password || !provinceCode || !districtCode || !sector || !cell || !village) {
      return error(res, "All fields are required: name, phone, email, password, provinceCode, districtCode, sector, cell, village.", 400);
    }

    if (password.length < 6) {
      return error(res, "Password must be at least 6 characters.", 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      return error(res, "Invalid email format.", 400);
    }

    const hasLat = latitude != null;
    const hasLon = longitude != null;
    if (hasLat !== hasLon) {
      return error(res, "Provide both latitude and longitude, or neither.", 400);
    }
    if (hasLat && hasLon) {
      const { latMin, latMax, lonMin, lonMax } = RWANDA_BOUNDS;
      if (latitude < latMin || latitude > latMax || longitude < lonMin || longitude > lonMax) {
        return error(res,
          `Coordinates are outside Rwanda's geographic boundaries. ` +
          `Latitude must be between ${latMin} and ${latMax}, longitude between ${lonMin} and ${lonMax}.`,
          400
        );
      }
    }

    const existingPhone = await prisma.hospital.findUnique({ where: { phone } });
    if (existingPhone) {
      return error(res, "A hospital with this phone number already exists.", 409);
    }

    const existingEmail = await prisma.hospital.findUnique({ where: { email } });
    if (existingEmail) {
      return error(res, "A hospital with this email address already exists.", 409);
    }

    const province = await prisma.province.findUnique({ where: { provinceCode } });
    if (!province) {
      return error(res, `Invalid province code "${provinceCode}". Valid codes: KIG, NOR, SOU, EAS, WES.`, 400);
    }

    const district = await prisma.district.findUnique({ where: { districtCode } });
    if (!district) {
      return error(res, `Invalid district code "${districtCode}".`, 400);
    }
    if (district.provinceCode !== provinceCode) {
      return error(res, `District "${district.name}" does not belong to province "${province.name}".`, 400);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const hospital = await prisma.hospital.create({
      data: {
        name, phone, email,
        password: hashedPassword,
        provinceCode, districtCode,
        sector, cell, village,
        latitude:  hasLat ? latitude  : null,
        longitude: hasLon ? longitude : null,
        isApproved: false, // pending admin approval
      },
    });

    return success(
      res,
      sanitizeHospital(hospital),
      "Hospital registered successfully. Your account is pending admin approval before you can log in.",
      201
    );
  } catch (err) {
    next(err);
  }
};

// Login uses email + password. Blocked until admin sets isApproved = true.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password are required.", 400);
    }

    const hospital = await prisma.hospital.findUnique({ where: { email } });
    if (!hospital) {
      return error(res, "Invalid email or password.", 401);
    }

    const valid = await bcrypt.compare(password, hospital.password);
    if (!valid) {
      return error(res, "Invalid email or password.", 401);
    }

    if (!hospital.isApproved) {
      return error(res, "Your account is pending approval. Please contact RBC to activate your account.", 403);
    }

    const token = jwt.sign(
      { id: hospital.hospitalId, role: "hospital" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return success(res, { hospital: sanitizeHospital(hospital), token }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { hospitalId: req.user.id },
      include: { province: true, district: true },
    });

    if (!hospital) {
      return error(res, "Hospital not found.", 404);
    }

    return success(res, sanitizeHospital(hospital), "Profile retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };