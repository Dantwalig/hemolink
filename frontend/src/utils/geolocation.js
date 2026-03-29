/**
 * Attempts to get user coordinates.
 * Strategy: browser geolocation first → IP geolocation fallback.
 * Returns: { latitude, longitude, source: "gps"|"ip" }
 * Throws: only if both methods fail.
 */
export async function getCoordinates() {
  try {
    return await browserGeolocation();
  } catch (browserErr) {
    // If user explicitly denied permission, don't fall back — respect the denial
    if (browserErr.code === 1) throw browserErr;
    // POSITION_UNAVAILABLE or TIMEOUT — try IP fallback
    return await ipGeolocation();
  }
}

function browserGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 2, message: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        source: "gps",
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

async function ipGeolocation() {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("IP geolocation failed");
  const data = await res.json();
  if (data.latitude == null || data.longitude == null) {
    throw new Error("IP geolocation returned no coordinates");
  }
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    source: "ip",
  };
}
