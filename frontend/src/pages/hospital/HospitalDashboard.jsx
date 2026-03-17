import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import {
  IconDashboard, IconBlood, IconBox, IconLogout,
  IconClock, IconCheckCircle, IconList, IconWarning, IconPlus
} from "../../utils/Icons.jsx";

// Leaflet + heat — loaded lazily to avoid SSR issues
let leafletLoaded = false;

const NAV = [
  { label: "Dashboard", path: "/hospital/dashboard", Icon: IconDashboard },
  { label: "Requests",  path: "/hospital/requests",  Icon: IconBlood },
  { label: "Inventory", path: "/hospital/inventory", Icon: IconBox },
];

function StatusBadge({ status }) {
  const map = { pending: ["#FEF9E7","#E67E22"], fulfilled: ["#EAFAF1","#1E8449"], cancelled: ["#FDEDEC","#C0392B"] };
  const [bg, color] = map[status] || ["#F2F3F4","#555"];
  return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
}

// Blood type color scale for inventory cards
function stockColor(units) {
  if (units === 0) return "#C0392B";
  if (units < 5)  return "#E67E22";
  if (units < 15) return "#F1C40F";
  return "#1E8449";
}
function stockBg(units) {
  if (units === 0) return "#FDEDEC";
  if (units < 5)  return "#FEF9E7";
  if (units < 15) return "#FDFBE7";
  return "#EAFAF1";
}

// Leaflet donor map — bright light tiles + pin markers
function DonorHeatmap({ donorLocations, hospitalName = "Your Hospital", hospitalLat, hospitalLng }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const hasAutoFitted = useRef(false);

  const hasLocation = hospitalLat != null && hospitalLng != null;

  // Small random offset so markers at same spot don't hide each other
  const jitter = (n) => n + (Math.random() - 0.5) * 0.0001;

  // 1. Initialize Map (Once)
  useEffect(() => {
    if (!mapRef.current || !hasLocation || instanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (instanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [hospitalLat, hospitalLng],
        zoom: 16, 
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 20, // Allow extreme closeups
      }).addTo(map);

      // Hospital pin — Red Pin
      const hospitalIcon = L.divIcon({
        className: "",
        html: `
          <svg width="34" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0Z" fill="#C0392B"/>
            <circle cx="12" cy="8" r="3" fill="white"/>
          </svg>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44]
      });
      L.marker([hospitalLat, hospitalLng], { 
        icon: hospitalIcon,
        zIndexOffset: 0 
      })
        .addTo(map)
        .bindPopup(`<strong style='color:#C0392B'> ${hospitalName}</strong>`)
        .openPopup();

      markerLayerRef.current = L.layerGroup().addTo(map);
      instanceRef.current = map;
    };

    initMap().catch(console.error);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [hasLocation, hospitalLat, hospitalLng, hospitalName]);

  // 2. Update Markers (When donorLocations change)
  useEffect(() => {
    const updateMarkers = async () => {
      if (!instanceRef.current || !markerLayerRef.current) return;

      const L = (await import("leaflet")).default;
      const map = instanceRef.current;
      const layer = markerLayerRef.current;

      layer.clearLayers();
      const boundsPoints = [[hospitalLat, hospitalLng]];

      donorLocations.forEach(d => {
        // Apply jitter so stacked donors are clickable
        const latlng = [jitter(d.latitude), jitter(d.longitude)];
        boundsPoints.push(latlng);

        const donorIcon = L.divIcon({
          className: "",
          html: `
            <svg width="30" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
              <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0Z" fill="#3498db"/>
              <circle cx="12" cy="8" r="3" fill="white"/>
            </svg>
          `,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -40]
        });

        L.marker(latlng, { 
          icon: donorIcon,
          zIndexOffset: 1000 
        })
          .addTo(layer)
          .bindPopup(`Donor: ${d.bloodTypeCode || "Unknown"}`);
      });

      // Only auto-position ONCE to prevent "snapping"
      if (!hasAutoFitted.current && donorLocations.length > 0) {
        if (boundsPoints.length > 1) {
          const bounds = L.latLngBounds(boundsPoints);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        } else {
          map.setView([hospitalLat, hospitalLng], 16);
        }
        hasAutoFitted.current = true;
      }
    };

    updateMarkers().catch(console.error);
  }, [donorLocations, hospitalLat, hospitalLng]);

  if (!hasLocation) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F7F3EF", borderRadius: 12, gap: 8 }}>
        <p style={{ fontSize: 14, color: "#6B6B6B", textAlign: "center", margin: 0 }}>
          No GPS coordinates on record for this hospital.<br />
          <span style={{ fontSize: 12, color: "#9B9B9B" }}>Contact your administrator to update your location.</span>
        </p>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

export default function HospitalDashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const [requests,       setRequests]       = useState([]);
  const [inventory,      setInventory]      = useState([]);
  const [donorLocations, setDonorLocations] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/requests"),
      api.get("/inventory"),
      api.get("/donors/locations").catch(() => ({ data: { data: [] } })),
    ])
      .then(([reqRes, invRes, locRes]) => {
        setRequests(reqRes.data.data  || []);
        setInventory(invRes.data.data || []);
        setDonorLocations(locRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending   = requests.filter(r => r.statusCode === "pending").length;
  const fulfilled = requests.filter(r => r.statusCode === "fulfilled").length;
  const lowStock  = inventory.filter(i => i.unitsAvailable < 5).length;

  const handleLogout = () => { logout(); navigate("/hospital-login"); };

  const stats = [
    { label: "Pending Requests",   value: pending,         color: "#E67E22", Icon: IconClock },
    { label: "Fulfilled",          value: fulfilled,       color: "#1E8449", Icon: IconCheckCircle },
    { label: "Total Requests",     value: requests.length, color: "#2980B9", Icon: IconList },
    { label: "Low Stock Alerts",   value: lowStock,        color: "#C0392B", Icon: IconWarning },
  ];

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span></span>
        </div>
        <div style={styles.sidebarHospital}>{user?.name || "Hospital"}</div>
        <nav style={styles.nav}>
          {NAV.map(({ label, path, Icon }) => (
            <button key={path}
              style={{ ...styles.navItem, ...(window.location.pathname === path ? styles.navItemActive : {}) }}
              onClick={() => navigate(path)}>
              <Icon size={16} color={window.location.pathname === path ? "#fff" : "rgba(255,255,255,0.6)"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <IconLogout size={14} color="rgba(255,255,255,0.4)" />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSub}>Overview of your hospital's blood supply and request activity.</p>
          </div>
          <button style={styles.newRequestBtn} onClick={() => navigate("/hospital/requests/new")}>
            <IconPlus size={14} color="#fff" /> New Blood Request
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.spinnerEl} /><p>Loading…</p></div>
        ) : (
          <>
            {/* Stats Row */}
            <div style={styles.statsGrid}>
              {stats.map(s => (
                <div key={s.label} style={styles.statCard}>
                  <div style={{ ...styles.statIconWrap, background: s.color + "18" }}>
                    <s.Icon size={22} color={s.color} />
                  </div>
                  <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── BLOOD STOCK — full width, most important ─────────── */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Blood Stock</h2>
                  <p style={styles.sectionSub}>Current inventory levels across all blood types</p>
                </div>
                <button style={styles.seeAllBtn} onClick={() => navigate("/hospital/inventory")}>Manage Inventory</button>
              </div>
              {inventory.length === 0 ? (
                <div style={styles.empty}>
                  No inventory recorded yet.{" "}
                  <button style={styles.linkBtn} onClick={() => navigate("/hospital/inventory")}>Update inventory</button>
                </div>
              ) : (
                <div style={styles.inventoryGrid}>
                  {inventory.map(item => (
                    <div key={item.bloodTypeCode} style={{
                      ...styles.inventoryCard,
                      background: stockBg(item.unitsAvailable),
                      borderColor: stockColor(item.unitsAvailable),
                    }}>
                      <div style={styles.inventoryType}>{item.bloodTypeCode}</div>
                      <div style={{ ...styles.inventoryUnits, color: stockColor(item.unitsAvailable) }}>
                        {item.unitsAvailable}
                      </div>
                      <div style={styles.inventoryLabel}>units</div>
                      {item.unitsAvailable < 5 && <div style={styles.lowBadge}>LOW</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── DONOR MAP — full width ────────────────────────────── */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Donor Proximity Map</h2>
                  <p style={styles.sectionSub}>
                    <strong style={{ color: "#C0392B" }}>{donorLocations.length}</strong> available donors near your hospital
                  </p>
                </div>
                <div style={styles.legendRow}>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: "#C0392B" }} />
                    <span style={styles.legendLabel}>Your hospital</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: "#2980B9" }} />
                    <span style={styles.legendLabel}>Available donor</span>
                  </div>
                </div>
              </div>
              <div style={styles.mapWrap}>
                <DonorHeatmap
                  donorLocations={donorLocations}
                  hospitalName={user?.name}
                  hospitalLat={user?.latitude}
                  hospitalLng={user?.longitude}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  shell:           { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EF" },
  sidebar:         { width: 220, background: "#1C1C1C", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  sidebarLogo:     { display: "flex", alignItems: "center", gap: 8, padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoDrop:        { width: 28, height: 28, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText:    { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:        { fontWeight: 800, fontSize: 16, color: "#fff" },
  logoRed:         { color: "#C0392B" },
  sidebarHospital: { fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "12px 20px 4px", textTransform: "uppercase", letterSpacing: 0.5 },
  nav:             { flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px", gap: 2 },
  navItem:         { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", borderRadius: 8, textAlign: "left" },
  navItemActive:   { background: "rgba(192,57,43,0.25)", color: "#fff", fontWeight: 600 },
  logoutBtn:       { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: "16px 20px", textAlign: "left" },
  main:            { flex: 1, padding: "32px 40px", overflowY: "auto", height: "100vh" },
  topBar:          { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  pageTitle:       { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:         { fontSize: 14, color: "#6B6B6B" },
  newRequestBtn:   { display: "flex", alignItems: "center", gap: 6, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  loadingWrap:     { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinnerEl:       { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  statsGrid:       { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard:        { background: "#fff", border: "1px solid #EBE5E0", borderRadius: 14, padding: "20px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
  statIconWrap:    { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" },
  statNum:         { fontSize: 30, fontWeight: 800, marginBottom: 4 },
  statLabel:       { fontSize: 12, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.4 },
  section:         { background: "#fff", border: "1px solid #EBE5E0", borderRadius: 14, padding: "24px", marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
  sectionHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  sectionTitle:    { fontSize: 17, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  sectionSub:      { fontSize: 13, color: "#8E8E8E" },
  seeAllBtn:       { background: "none", border: "none", color: "#C0392B", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  table:           { width: "100%", borderCollapse: "collapse" },
  th:              { textAlign: "left", fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 12px", borderBottom: "1px solid #EBE5E0" },
  tr:              { borderBottom: "1px solid #F2EDE8" },
  td:              { padding: "12px", fontSize: 14, color: "#1C1C1C" },
  empty:           { fontSize: 14, color: "#6B6B6B", textAlign: "center", padding: "32px 0" },
  linkBtn:         { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  inventoryGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 12 },
  inventoryCard:   { border: "2px solid", borderRadius: 12, padding: "16px 12px", textAlign: "center", position: "relative" },
  inventoryType:   { fontSize: 20, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  inventoryUnits:  { fontSize: 30, fontWeight: 800, lineHeight: 1 },
  inventoryLabel:  { fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", marginTop: 4 },
  lowBadge:        { position: "absolute", top: 6, right: 6, background: "#C0392B", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 4, padding: "2px 5px", letterSpacing: 0.5 },
  mapWrap:         { height: 460, borderRadius: 12, overflow: "hidden", border: "1px solid #EBE5E0" },
  legendRow:       { display: "flex", alignItems: "center", gap: 14 },
  legendItem:      { display: "flex", alignItems: "center", gap: 6 },
  legendDot:       { width: 10, height: 10, borderRadius: "50%" },
  legendLabel:     { fontSize: 12, color: "#6B6B6B" },
  twoColRow:       { display: "flex", gap: 20, marginBottom: 20, alignItems: "stretch", minHeight: 420 },
  bottomRow:       { display: "flex", gap: 20, alignItems: "stretch" },
};