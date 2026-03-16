const prisma = require("../config/prisma");

/**
 * Haversine formula — returns distance in km between two lat/lon points.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find all available, consenting donors with the right blood type,
 * attach their distance from the hospital, and sort closest-first.
 *
 * @param {string} bloodTypeCode  — e.g. "O+"
 * @param {number} hospitalLat
 * @param {number} hospitalLon
 * @param {number} radiusKm       — optional cap; if null search all donors
 * @returns {Array}               — donors sorted by distanceKm asc
 */
async function findMatchingDonors(bloodTypeCode, hospitalLat, hospitalLon, radiusKm = null) {
  const donors = await prisma.donor.findMany({
    where: {
      bloodTypeCode,
      available:  true,
      consentSms: true,
    },
    select: {
      donorId:       true,
      fullName:      true,
      phone:         true,
      bloodTypeCode: true,
      latitude:      true,
      longitude:     true,
    },
  });

  // Attach distance to each donor
  const withDistance = donors.map((d) => ({
    ...d,
    distanceKm: parseFloat(
      haversineKm(hospitalLat, hospitalLon, d.latitude, d.longitude).toFixed(2)
    ),
  }));

  // Filter by radius if provided, then sort closest first
  const filtered = radiusKm
    ? withDistance.filter((d) => d.distanceKm <= radiusKm)
    : withDistance;

  return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = { findMatchingDonors, haversineKm };