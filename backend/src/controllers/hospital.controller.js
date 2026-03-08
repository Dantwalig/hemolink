const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

const SALT_ROUNDS = 10;

// Rwanda's geographic bounding box. Any lat/lon submitted must fall within these
// limits. This is a basic sanity check, a hospital in Rwanda cannot be located
// in Nairobi or Paris. Values sourced from Rwanda's official GIS boundaries.
const RWANDA_BOUNDS = {
  latMin: -2.84,
  latMax: -1.05,
  lonMin: 28.86,
  lonMax: 30.90,
};

// Simple email format check. We don't send a verification email yet, but we
// still reject obviously malformed addresses at registration time.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strip password from hospital object before returning in any response
const sanitizeHospital = ({ password, ...hospital }) => hospital;

const register = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,         // optional — unique contact email
      password,
      provinceCode,  // must match a row in the provinces table
      districtCode,  // must match a row in the districts table AND belong to provinceCode
      sector,        // free-text — too many sectors to enumerate in a reference table
      cell,          // free-text
      village,       // free-text
      latitude,      // optional — if given, must be within Rwanda
      longitude,     // optional — if given, must be within Rwanda (both or neither)
    } = req.body;

    // ── 1. Required field presence ───────────────────────────────────────────
    if (!name || !phone || !password || !provinceCode || !districtCode || !sector || !cell || !village) {
      return error(
        res,
        "All fields are required: name, phone, password, provinceCode, districtCode, sector, cell, village.",
        400
      );
    }

    // ── 2. Password strength ─────────────────────────────────────────────────
    if (password.length < 6) {
      return error(res, "Password must be at least 6 characters.", 400);
    }

    // ── 3. Email format (only if provided) ───────────────────────────────────
    if (email && !EMAIL_REGEX.test(email)) {
      return error(res, "Invalid email format.", 400);
    }

    // ── 4. Coordinates — both or neither, and within Rwanda ─────────────────
    // We accept a hospital with no coordinates (address is enough for now).
    // But if one coordinate is provided, both must be provided together.
    const hasLat = latitude != null;
    const hasLon = longitude != null;
    if (hasLat !== hasLon) {
      return error(res, "Provide both latitude and longitude, or neither.", 400);
    }
    if (hasLat && hasLon) {
      const { latMin, latMax, lonMin, lonMax } = RWANDA_BOUNDS;
      if (latitude < latMin || latitude > latMax || longitude < lonMin || longitude > lonMax) {
        return error(
          res,
          `Coordinates are outside Rwanda's geographic boundaries. ` +
          `Latitude must be between ${latMin} and ${latMax}, ` +
          `longitude between ${lonMin} and ${lonMax}.`,
          400
        );
      }
    }

    // ── 5. Duplicate phone check ─────────────────────────────────────────────
    const existingPhone = await prisma.hospital.findUnique({ where: { phone } });
    if (existingPhone) {
      return error(res, "A hospital with this phone number already exists.", 409);
    }

    // ── 6. Duplicate email check (only if provided) ───────────────────────────
    if (email) {
      const existingEmail = await prisma.hospital.findUnique({ where: { email } });
      if (existingEmail) {
        return error(res, "A hospital with this email address already exists.", 409);
      }
    }

    // 7. Validate province against Rwanda's seeded reference table
    // We query the database rather than hard-coding province codes in JavaScript.
    // This way a future admin can add a new province without a code change.
    const province = await prisma.province.findUnique({ where: { provinceCode } });
    if (!province) {
      return error(
        res,
        `Invalid province code "${provinceCode}". Valid codes: KIG, NOR, SOU, EAS, WES.`,
        400
      );
    }

    // 8. Validate district and confirm it belongs to the given province
    // A hospital could submit a real district code but pair it with the wrong
    // province e.g., GASABO (Kigali) under provinceCode "NOR" (Northern).
    // We catch that mismatch here.
    const district = await prisma.district.findUnique({ where: { districtCode } });
    if (!district) {
      return error(res, `Invalid district code "${districtCode}".`, 400);
    }
    if (district.provinceCode !== provinceCode) {
      return error(
        res,
        `District "${district.name}" does not belong to province "${province.name}".`,
        400
      );
    }

    // 9. Hash password — never store plaintext 
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 10. persist
    const hospital = await prisma.hospital.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        provinceCode,
        districtCode,
        sector,
        cell,
        village,
        latitude:  hasLat ? latitude  : null,
        longitude: hasLon ? longitude : null,
      },
    });

    return success(res, sanitizeHospital(hospital), "Hospital registered successfully.", 201);
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

    const hospital = await prisma.hospital.findUnique({ where: { phone } });
    if (!hospital) {
      // Return the same message for "not found" and "wrong password" to prevent
      // attackers from using the login endpoint to discover registered phone numbers
      return error(res, "Invalid phone or password.", 401);
    }

    const valid = await bcrypt.compare(password, hospital.password);
    if (!valid) {
      return error(res, "Invalid phone or password.", 401);
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

module.exports = { register, login };
