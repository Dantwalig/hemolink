import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";

const NAV = [
  { label: "Dashboard",  path: "/hospital/dashboard",        icon: "📊" },
  { label: "Requests",   path: "/hospital/requests",         icon: "🩸" },
  { label: "Inventory",  path: "/hospital/inventory",        icon: "📦" },
];

export default function HospitalDashboard() {
  const navigate      = useNavigate();
  const { user, logout } = useAuth();
  const [requests,    setRequests]    = useState([]);
  const [inventory,   setInventory]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/requests"),
      api.get("/inventory"),
    ]).then(([reqRes, invRes]) => {
      setRequests(reqRes.data.data   || []);
      setInventory(invRes.data.data  || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending   = requests.filter((r) => r.statusCode === "pending").length;
  const fulfilled = requests.filter((r) => r.statusCode === "fulfilled").length;
  const lowStock  = inventory.filter((i) => i.unitsAvailable < 5).length;

  const handleLogout = () => { logout(); navigate("/hospital-login"); };

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
          {NAV.map((item) => (
            <button key={item.path}
              style={{ ...styles.navItem, ...(window.location.pathname === item.path ? styles.navItemActive : {}) }}
              onClick={() => navigate(item.path)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>← Log Out</button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSub}>Overview of your hospital's blood request activity.</p>
          </div>
          <button style={styles.newRequestBtn} onClick={() => navigate("/hospital/requests/new")}>
            + New Blood Request
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.spinner} /><p>Loading…</p></div>
        ) : (
          <>
            {/* Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Pending Requests",   value: pending,              color: "#E67E22", icon: "⏳" },
                { label: "Fulfilled Requests",  value: fulfilled,            color: "#1E8449", icon: "✅" },
                { label: "Total Requests",      value: requests.length,      color: "#2980B9", icon: "📋" },
                { label: "Low Stock Blood Types", value: lowStock,           color: "#C0392B", icon: "⚠️" },
              ].map((s) => (
                <div key={s.label} style={styles.statCard}>
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent requests */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Blood Requests</h2>
                <button style={styles.seeAllBtn} onClick={() => navigate("/hospital/requests")}>See All →</button>
              </div>
              {requests.length === 0 ? (
                <div style={styles.empty}>No blood requests yet. <button style={styles.linkBtn} onClick={() => navigate("/hospital/requests/new")}>Create your first request →</button></div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Blood Type", "Units", "Urgency", "Status", "Needed By"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map((r) => (
                      <tr key={r.requestId} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: "#C0392B" }}>{r.bloodTypeCode}</td>
                        <td style={styles.td}>{r.unitsNeeded}</td>
                        <td style={styles.td}>{r.urgencyLevel}</td>
                        <td style={styles.td}><StatusBadge status={r.statusCode} /></td>
                        <td style={styles.td}>{new Date(r.neededBy).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Inventory summary */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Inventory Snapshot</h2>
                <button style={styles.seeAllBtn} onClick={() => navigate("/hospital/inventory")}>Manage →</button>
              </div>
              {inventory.length === 0 ? (
                <div style={styles.empty}>No inventory recorded yet. <button style={styles.linkBtn} onClick={() => navigate("/hospital/inventory")}>Update inventory →</button></div>
              ) : (
                <div style={styles.inventoryGrid}>
                  {inventory.map((item) => (
                    <div key={item.bloodTypeCode} style={{ ...styles.inventoryCard, borderColor: item.unitsAvailable < 5 ? "#C0392B" : "#DDD5D0" }}>
                      <div style={styles.inventoryType}>{item.bloodTypeCode}</div>
                      <div style={{ ...styles.inventoryUnits, color: item.unitsAvailable < 5 ? "#C0392B" : "#1E8449" }}>
                        {item.unitsAvailable}
                      </div>
                      <div style={styles.inventoryLabel}>units</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending: ["#FEF9E7","#E67E22"], fulfilled: ["#EAFAF1","#1E8449"], cancelled: ["#FDEDEC","#C0392B"] };
  const [bg, color] = map[status] || ["#F2F3F4","#555"];
  return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
}

const styles = {
  shell:          { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EF" },
  sidebar:        { width: 220, background: "#1C1C1C", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 },
  sidebarLogo:    { display: "flex", alignItems: "center", gap: 8, padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoDrop:       { width: 28, height: 28, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:       { fontWeight: 800, fontSize: 16, color: "#fff" },
  logoRed:        { color: "#C0392B" },
  sidebarHospital:{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "12px 20px 4px", textTransform: "uppercase", letterSpacing: 0.5 },
  nav:            { flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px", gap: 4 },
  navItem:        { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer", borderRadius: 8, textAlign: "left" },
  navItemActive:  { background: "rgba(192,57,43,0.25)", color: "#fff", fontWeight: 600 },
  logoutBtn:      { background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", padding: "16px 20px", textAlign: "left" },
  main:           { flex: 1, padding: "32px 40px", overflowY: "auto" },
  topBar:         { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  pageTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:        { fontSize: 14, color: "#6B6B6B" },
  newRequestBtn:  { background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  loadingWrap:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinner:        { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  statsGrid:      { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard:       { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, padding: "20px", textAlign: "center" },
  statIcon:       { fontSize: 28, marginBottom: 8 },
  statNum:        { fontSize: 32, fontWeight: 800, marginBottom: 4 },
  statLabel:      { fontSize: 12, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5 },
  section:        { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, padding: "24px", marginBottom: 24 },
  sectionHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle:   { fontSize: 16, fontWeight: 700, color: "#1C1C1C" },
  seeAllBtn:      { background: "none", border: "none", color: "#C0392B", fontWeight: 600, fontSize: 13, cursor: "pointer" },
  table:          { width: "100%", borderCollapse: "collapse" },
  th:             { textAlign: "left", fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 12px", borderBottom: "1px solid #DDD5D0" },
  tr:             { borderBottom: "1px solid #F2EDE8" },
  td:             { padding: "12px 12px", fontSize: 14, color: "#1C1C1C" },
  empty:          { fontSize: 14, color: "#6B6B6B", textAlign: "center", padding: "32px 0" },
  linkBtn:        { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  inventoryGrid:  { display: "flex", gap: 12, flexWrap: "wrap" },
  inventoryCard:  { border: "2px solid #DDD5D0", borderRadius: 12, padding: "16px 20px", textAlign: "center", minWidth: 80 },
  inventoryType:  { fontSize: 20, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  inventoryUnits: { fontSize: 28, fontWeight: 800 },
  inventoryLabel: { fontSize: 11, color: "#6B6B6B", textTransform: "uppercase" },
};
