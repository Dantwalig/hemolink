const prisma = require("../config/prisma");
const { success, error } = require("../utils/apiResponse");

// GET /api/inventory — returns all inventory rows for the logged-in hospital
const getInventory = async (req, res, next) => {
  try {
    const hospitalId = req.user.id;

    const inventory = await prisma.inventory.findMany({
      where:   { hospitalId },
      include: { bloodType: true },
      orderBy: { bloodTypeCode: "asc" },
    });

    return success(res, inventory, "Inventory retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/:bloodTypeCode — upsert units for a blood type
const upsertInventory = async (req, res, next) => {
  try {
    const hospitalId    = req.user.id;
    const { bloodTypeCode } = req.params;
    const { unitsAvailable } = req.body;

    if (unitsAvailable == null || !Number.isInteger(unitsAvailable) || unitsAvailable < 0) {
      return error(res, "unitsAvailable must be a non-negative integer.", 400);
    }

    const record = await prisma.inventory.upsert({
      where:  { hospitalId_bloodTypeCode: { hospitalId, bloodTypeCode } },
      update: { unitsAvailable },
      create: { hospitalId, bloodTypeCode, unitsAvailable },
    });

    return success(res, record, "Inventory updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { getInventory, upsertInventory };
