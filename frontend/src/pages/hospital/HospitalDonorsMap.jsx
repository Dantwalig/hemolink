import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const BLOOD_COLORS = {
  "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F",
  "B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483",
};

function LiveDonorMap({ hospitalLat, hospitalLng, hospitalName, donors, selectedType }) {
  const mapRef  = useRef(null);
  const mapObj  = useRef(null);
  const initRef = useRef(false);
  const markersRef = useRef([]);
  const heatRef = useRef(null);

  // Initial map setup
  useEffect(() => {
    if (!mapRef.current || initRef.current || !hospitalLat || !hospitalLng) return;
    initRef.current = true;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current, {
        center: [hospitalLat, hospitalLng],
        zoom: 12,
        zoomControl: true,
      });
      mapObj.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap",
      }).addTo(map);

      // Hospital marker
      const hospIcon = L.divIcon({
        className: "",
        html: `<div style="width:48px;height:48px;background:linear-gradient(135deg,#C0392B,#8B1A1A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(192,57,43,.6);border:3px solid white"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:17px;font-family:Sora,sans-serif">H</span></div>`,
        iconSize: [48, 48], iconAnchor: [24, 48],
      });
      L.marker([hospitalLat, hospitalLng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(`<div style="font-family:Sora,sans-serif;padding:2px"><strong style="font-size:14px">${hospitalName}</strong><br/><span style="font-size:11px;color:#C0392B">🏥 Your hospital</span></div>`)
        .openPopup();

      // 10 km search ring
      L.circle([hospitalLat, hospitalLng], {
        radius: 10000, color: "#C0392B", weight: 1.5,
        opacity: 0.35, fillColor: "#C0392B", fillOpacity: 0.03, dashArray: "6 5",
      }).addTo(map).bindTooltip("10 km search radius", { permanent: false });
    };

    init().catch(console.error);
  }, [hospitalLat, hospitalLng, hospitalName]);

  // Update donor markers when donors or filter changes
  useEffect(() => {
    if (!mapObj.current || !donors.length) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (heatRef.current) { heatRef.current.remove(); heatRef.current = null; }

      const filtered = selectedType === "all"
        ? donors
        : donors.filter(d => d.bloodTypeCode === selectedType);

      const validDonors = filtered.filter(d => d.latitude && d.longitude);

      // Heatmap layer
      if (validDonors.length > 0) {
        try {
          await import("leaflet.heat");
          const L2 = (await import("leaflet")).default;
          if (L2.heatLayer) {
            const heat = L2.heatLayer(
              validDonors.map(d => [d.latitude, d.longitude, 0.9]),
              { radius: 40, blur: 28, maxZoom: 15,
                gradient: { 0.2: "#3B82F6", 0.5: "#F59E0B", 0.8: "#EF4444", 1.0: "#7F1D1D" } }
            ).addTo(mapObj.current);
            heatRef.current = heat;
          }
        } catch (_) {}
      }

      // Individual donor dots
      validDonors.forEach(d => {
        const bc = BLOOD_COLORS[d.bloodTypeCode] || "#C0392B";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:32px;height:32px;border-radius:50%;background:${bc};border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.3);font-family:Sora,sans-serif;font-size:8px;font-weight:900;color:white;line-height:1">${d.bloodTypeCode}</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16],
        });
        const marker = L.marker([d.latitude, d.longitude], { icon })
          .addTo(mapObj.current)
          .bindPopup(`
            <div style="font-family:Sora,sans-serif;padding:4px;min-width:130px">
              <div style="font-size:20px;font-weight:900;color:${bc};font-family:Georgia,serif;margin-bottom:4px">${d.bloodTypeCode}</div>
              <div style="font-size:11px;color:#1E8449;font-weight:600">✓ Available donor</div>
            </div>
          `);
        markersRef.current.push(marker);
      });
    };

    updateMarkers().catch(console.error);
  }, [donors, selectedType]);

  if (!hospitalLat || !hospitalLng) {
    return (
      <div style={{ height: "100%", minHeight: 500, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        background: "rgba(192,57,43,.03)", border: "1.5px dashed #E8D5D0", borderRadius: 16 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 5a12 12 0 0 1 12 12c0 9-12 18-12 18S8 26 8 17A12 12 0 0 1 20 5z" stroke="#BBA0A0" strokeWidth="2"/>
          <circle cx="20" cy="17" r="4" stroke="#BBA0A0" strokeWidth="2"/>
        </svg>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#7A4A45", marginBottom: 6 }}>No GPS coordinates set</p>
          <p style={{ fontSize: 13, color: "#9B7B77" }}>Ask your admin to add your hospital's location to enable the donor map.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ height: "100%", minHeight: 500, borderRadius: 16,
    overflow: "hidden", border: "1.5px solid #F0E0DC", boxShadow: "0 4px 20px rgba(140,20,20,.07)" }} />;
}

export default function HospitalDonorsMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donors,      setDonors]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing,  setRefreshing]  = useState(false);
  const [hospProfile, setHospProfile] = useState(null);

  // Parse coordinates as numbers (localStorage may store strings)
  const hospitalLat = hospProfile?.latitude != null ? parseFloat(hospProfile.latitude) : null;
  const hospitalLng = hospProfile?.longitude != null ? parseFloat(hospProfile.longitude) : null;
  const hospitalName = hospProfile?.name || user?.name || "Your Hospital";

  const fetchDonors = async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await api.get("/donors/locations");
      setDonors(res.data.data || []);
      setLastRefresh(new Date());
    } catch { setError("Failed to load donor locations."); }
    finally  { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    // Fetch hospital profile to get fresh coordinates
    api.get("/hospitals/profile")
      .then(res => setHospProfile(res.data.data))
      .catch(() => setHospProfile(user)); // fallback to cached auth user
    fetchDonors(false);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => fetchDonors(false), 60000);
    return () => clearInterval(t);
  }, []);

  const bloodTypes = [...new Set(donors.map(d => d.bloodTypeCode).filter(Boolean))].sort();
  const filtered   = selectedType === "all" ? donors : donors.filter(d => d.bloodTypeCode === selectedType);
  const withGps    = filtered.filter(d => d.latitude && d.longitude);

  // Blood type breakdown
  const breakdown = {};
  donors.forEach(d => { breakdown[d.bloodTypeCode] = (breakdown[d.bloodTypeCode] || 0) + 1; });
  const sortedBreakdown = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(breakdown), 1);

  return (
    <HospitalShell title="Donor Map" subtitle="Live locations of available donors near your hospital.">
      {error && (
        <div style={{ background: "#fff2f2", border: "1.5px solid rgba(192,57,43,.25)", borderRadius: 10,
          padding: "12px 16px", fontSize: 13, color: "#C0392B", marginBottom: 20, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, height: "calc(100vh - 180px)", minHeight: 600 }}>

        {/* ── LEFT: Map ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Blood type filter pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
              <button onClick={() => setSelectedType("all")}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${selectedType==="all"?"#C0392B":"#E8D5D0"}`,
                  background: selectedType==="all"?"rgba(192,57,43,.1)":"#fff",
                  color: selectedType==="all"?"#C0392B":"#7A4A45",
                  fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                All Types ({donors.length})
              </button>
              {bloodTypes.map(bt => {
                const bc = BLOOD_COLORS[bt] || "#C0392B";
                const count = breakdown[bt] || 0;
                const active = selectedType === bt;
                return (
                  <button key={bt} onClick={() => setSelectedType(active ? "all" : bt)}
                    style={{ padding: "6px 14px", borderRadius: 20,
                      border: `1.5px solid ${active ? bc : "#E8D5D0"}`,
                      background: active ? `${bc}18` : "#fff",
                      color: active ? bc : "#7A4A45",
                      fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all .15s" }}>
                    {bt} ({count})
                  </button>
                );
              })}
            </div>

            {/* Refresh */}
            <button onClick={() => fetchDonors(true)} disabled={refreshing}
              style={{ display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20, border: "1.5px solid #E8D5D0",
                background: "#fff", color: "#7A4A45",
                fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ animation: refreshing ? "hl-spin .8s linear infinite" : "none" }}>
                <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" stroke="#7A4A45" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M6 1.5L7.5 3 6 4.5" stroke="#7A4A45" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <div style={{ height: "100%", minHeight: 500, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 14, background: "rgba(192,57,43,.02)",
                borderRadius: 16, border: "1.5px solid #F0E0DC" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #F0E0DC", borderTopColor: "#C0392B",
                  borderRadius: "50%", animation: "hl-spin .75s linear infinite" }} />
                <span style={{ color: "#7A4A45" }}>Loading donor locations…</span>
              </div>
            ) : (
              <LiveDonorMap
                hospitalLat={hospitalLat}
                hospitalLng={hospitalLng}
                hospitalName={hospitalName}
                donors={donors}
                selectedType={selectedType}
              />
            )}

            {/* Live badge */}
            {!loading && (
              <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000,
                background: "rgba(255,255,255,.97)", backdropFilter: "blur(8px)",
                borderRadius: 10, padding: "7px 13px", border: "1px solid #F0E0DC",
                boxShadow: "0 2px 10px rgba(0,0,0,.08)",
                display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1E8449",
                  boxShadow: "0 0 0 3px rgba(30,132,73,.2)", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1a0a07", fontFamily: "Sora,sans-serif" }}>
                  {withGps.length} donor{withGps.length !== 1 ? "s" : ""} on map
                </span>
              </div>
            )}

            {/* Heatmap legend */}
            {!loading && withGps.length > 0 && (
              <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 1000,
                background: "rgba(255,255,255,.97)", backdropFilter: "blur(8px)",
                borderRadius: 10, padding: "8px 13px", border: "1px solid #F0E0DC",
                boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#9B7B77", textTransform: "uppercase",
                  letterSpacing: .8, marginBottom: 5, fontFamily: "Sora,sans-serif" }}>Density</div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {["#3B82F6","#F59E0B","#EF4444","#7F1D1D"].map((c, i) => (
                    <div key={i} style={{ width: 16, height: 10, background: c, opacity: .85,
                      borderRadius: i===0?"3px 0 0 3px":i===3?"0 3px 3px 0":"0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 8, color: "#9B7B77", fontFamily: "Sora,sans-serif" }}>Low</span>
                  <span style={{ fontSize: 8, color: "#9B7B77", fontFamily: "Sora,sans-serif" }}>High</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, color: "#9B7B77", textAlign: "right" }}>
            Last updated: {lastRefresh.toLocaleTimeString("en-RW", { timeStyle: "short" })} · auto-refreshes every 60s
          </div>
        </div>

        {/* ── RIGHT: Sidebar ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

          {/* Summary card */}
          <div style={{ background: "linear-gradient(135deg,#C0392B,#8B1A1A)", borderRadius: 18,
            padding: "20px 22px", color: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: 1, color: "rgba(255,255,255,.6)", marginBottom: 10 }}>
              Available Donors
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, fontFamily: "'Lora',serif",
              letterSpacing: -2, lineHeight: 1 }}>
              {donors.length}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 8 }}>
              {withGps.length} with GPS · {donors.length - withGps.length} without
            </div>
            <div style={{ marginTop: 14, paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,.15)" }}>
              <button onClick={() => navigate("/hospital/requests/new")}
                style={{ width: "100%", padding: "10px", borderRadius: 10,
                  background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
                  color: "#fff", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "all .18s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.25)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.15)"}>
                + New Blood Request
              </button>
            </div>
          </div>

          {/* Blood type breakdown */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E0DC", borderRadius: 18,
            padding: "20px 22px", boxShadow: "0 4px 16px rgba(140,20,20,.05)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a0a07", marginBottom: 16, letterSpacing: -.1 }}>
              By Blood Type
            </h3>
            {sortedBreakdown.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9B7B77", textAlign: "center", padding: "20px 0" }}>
                No donors available
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sortedBreakdown.map(([type, count]) => {
                  const bc = BLOOD_COLORS[type] || "#C0392B";
                  const pct = Math.round((count / maxCount) * 100);
                  const isSelected = selectedType === type;
                  return (
                    <button key={type} onClick={() => setSelectedType(isSelected ? "all" : type)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        borderRadius: 10, border: `1.5px solid ${isSelected ? bc : "transparent"}`,
                        background: isSelected ? `${bc}08` : "transparent",
                        cursor: "pointer", textAlign: "left", transition: "all .15s", width: "100%" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${bc}18`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: bc, fontFamily: "'Lora',serif" }}>{type}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a0a07" }}>{type}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: bc }}>{count}</span>
                        </div>
                        <div style={{ background: "#F0E0DC", borderRadius: 4, height: 5, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: bc,
                            borderRadius: 4, transition: "width .6s ease" }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{ background: "rgba(192,57,43,.03)", border: "1px solid rgba(192,57,43,.1)",
            borderRadius: 14, padding: "16px 18px" }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#1a0a07", marginBottom: 12 }}>How to use</h4>
            {[
              "Dots on the map are available donors — click one to see their blood type",
              "The heatmap shows donor density — red areas have the most donors",
              "Filter by blood type using the pills above the map",
              "Create a blood request to automatically SMS matching donors",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 3 ? 10 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(192,57,43,.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#C0392B" }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 12, color: "#7A4A45", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HospitalShell>
  );
}
