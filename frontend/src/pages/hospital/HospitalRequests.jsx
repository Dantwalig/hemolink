import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";

const NAV = [
  { label: "Dashboard", path: "/hospital/dashboard", icon: "📊" },
  { label: "Requests",  path: "/hospital/requests",  icon: "🩸" },
  { label: "Inventory", path: "/hospital/inventory", icon: "📦" },
];

const VALID_STATUSES = ["pending", "fulfilled", "cancelled"];

export default function HospitalRequests() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const [requests,       setRequests]  = useState([]);
  const [loading,        setLoading]   = useState(true);
  const [updating,       setUpdating]  = useState(null); // requestId being updated
  const [filterStatus,   setFilter]    = useState("all");
  const [error,          setError]     = useState("");

  useEffect(() => {
    api.get("/requests")
      .then((res) => setRequests(res.data.data || []))
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdating(requestId);
    try {
      const res = await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      setRequests((prev) => prev.map((r) => r.requestId === requestId ? res.data.data : r));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === "all" ? requests : requests.filter((r) => r.statusCode === filterStatus);

  const handleLogout = () => { logout(); navigate("/hospital-login"); };

  return (
    <div style={styles.shell}>
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

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Blood Requests</h1>
            <p style={styles.pageSub}>Manage your hospital's blood requests.</p>
          </div>
          <button style={styles.newRequestBtn} onClick={() => navigate("/hospital/requests/new")}>
            + New Request
          </button>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        {/* Filter tabs */}
        <div style={styles.tabs}>
          {["all", ...VALID_STATUSES].map((s) => (
            <button key={s} style={{ ...styles.tab, ...(filterStatus === s ? styles.tabActive : {}) }}
              onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={styles.tabCount}>{s === "all" ? requests.length : requests.filter((r) => r.statusCode === s).length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.spinner} /><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            No {filterStatus !== "all" ? filterStatus : ""} requests found.{" "}
            {filterStatus === "all" && <button style={styles.linkBtn} onClick={() => navigate("/hospital/requests/new")}>Create one →</button>}
          </div>
        ) : (
          <div style={styles.cardList}>
            {filtered.map((r) => (
              <div key={r.requestId} style={styles.requestCard}>
                <div style={styles.cardLeft}>
                  <div style={styles.bloodType}>{r.bloodTypeCode}</div>
                  <div style={styles.units}>{r.unitsNeeded} unit{r.unitsNeeded !== 1 ? "s" : ""}</div>
                </div>
                <div style={styles.cardMid}>
                  <div style={styles.cardRow}><span style={styles.cardLabel}>Urgency:</span> <strong>{r.urgencyLevel}</strong></div>
                  <div style={styles.cardRow}><span style={styles.cardLabel}>Needed by:</span> {new Date(r.neededBy).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })}</div>
                  <div style={styles.cardRow}><span style={styles.cardLabel}>Notifications sent:</span> {r.notifications?.length ?? 0}</div>
                </div>
                <div style={styles.cardRight}>
                  <StatusBadge status={r.statusCode} />
                  {r.statusCode === "pending" && (
                    <div style={styles.actionBtns}>
                      <button style={styles.fulfillBtn} disabled={updating === r.requestId}
                        onClick={() => handleStatusChange(r.requestId, "fulfilled")}>
                        {updating === r.requestId ? "…" : "Mark Fulfilled"}
                      </button>
                      <button style={styles.cancelBtn} disabled={updating === r.requestId}
                        onClick={() => handleStatusChange(r.requestId, "cancelled")}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending: ["#FEF9E7","#E67E22"], fulfilled: ["#EAFAF1","#1E8449"], cancelled: ["#FDEDEC","#C0392B"] };
  const [bg, color] = map[status] || ["#F2F3F4","#555"];
  return <span style={{ background: bg, color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
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
  topBar:         { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:        { fontSize: 14, color: "#6B6B6B" },
  newRequestBtn:  { background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  alertError:     { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 16, fontSize: 13 },
  tabs:           { display: "flex", gap: 8, marginBottom: 20 },
  tab:            { padding: "8px 16px", background: "#fff", border: "1px solid #DDD5D0", borderRadius: 20, fontSize: 13, cursor: "pointer", color: "#6B6B6B", display: "flex", alignItems: "center", gap: 6 },
  tabActive:      { background: "#C0392B", color: "#fff", borderColor: "#C0392B" },
  tabCount:       { background: "rgba(0,0,0,0.12)", borderRadius: 10, padding: "1px 6px", fontSize: 11 },
  loadingWrap:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinner:        { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  empty:          { fontSize: 14, color: "#6B6B6B", textAlign: "center", padding: "48px 0", background: "#fff", borderRadius: 14, border: "1px solid #DDD5D0" },
  linkBtn:        { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  cardList:       { display: "flex", flexDirection: "column", gap: 12 },
  requestCard:    { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24 },
  cardLeft:       { textAlign: "center", minWidth: 70 },
  bloodType:      { fontSize: 28, fontWeight: 800, color: "#C0392B" },
  units:          { fontSize: 12, color: "#6B6B6B" },
  cardMid:        { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  cardRow:        { fontSize: 13, color: "#1C1C1C" },
  cardLabel:      { color: "#6B6B6B" },
  cardRight:      { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 },
  actionBtns:     { display: "flex", gap: 8 },
  fulfillBtn:     { padding: "6px 14px", background: "#1E8449", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  cancelBtn:      { padding: "6px 14px", background: "transparent", color: "#C0392B", border: "1px solid #C0392B", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
};