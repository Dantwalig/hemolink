import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";
import { IconWarning, IconCheckCircle, IconBlood, IconClock, IconList } from "../../utils/Icons.jsx";

const IconHospital = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <rect x="3" y="7" width="16" height="13" rx="1.5" stroke={color} strokeWidth="1.5"/>
    <path d="M7 20v-5h8v5M8 3h6v4H8zM9 11h4M11 9v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconUsers = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <circle cx="8" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/>
    <path d="M1 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 6a3.5 3.5 0 1 1 0 7M21 20c0-3.35-2.09-6.25-5-7.22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const [stats,     setStats]   = useState(null);
  const [loading,   setLoading] = useState(true);
  const [error,     setError]   = useState("");

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data.data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Donors",       value: stats.donors.total,           sub: `${stats.donors.available} available`,         color: "#2980B9", Icon: IconUsers },
    { label: "Total Hospitals",    value: stats.hospitals.total,        sub: `${stats.hospitals.approved} approved`,         color: "#1E8449", Icon: IconHospital },
    { label: "Pending Approval",   value: stats.hospitals.pendingApproval, sub: "hospitals awaiting review",                color: stats.hospitals.pendingApproval > 0 ? "#C0392B" : "#6B6B6B", Icon: IconWarning },
    { label: "Blood Requests",     value: stats.requests.total,         sub: `${stats.requests.pending} pending`,            color: "#E67E22", Icon: IconBlood },
    { label: "SMS Notifications",  value: stats.notifications.total,    sub: `${stats.notifications.accepted} accepted`,    color: "#8E44AD", Icon: IconList },
    { label: "Response Rate",      value: `${stats.notifications.responseRate}%`, sub: "donor acceptance rate",             color: "#C0392B", Icon: IconCheckCircle },
  ] : [];

  return (
    <AdminShell title="Admin Dashboard" subtitle="Platform-wide overview for RBC staff.">
      {error && <div style={styles.alertError}>{error}</div>}

      {loading ? (
        <div style={styles.loadingWrap}><div style={styles.spinner} /><p>Loading…</p></div>
      ) : (
        <>
          {/* Pending approval alert */}
          {stats?.hospitals?.pendingApproval > 0 && (
            <div style={styles.pendingAlert}>
              <IconWarning size={18} color="#92400E" />
              <span>
                <strong>{stats.hospitals.pendingApproval} hospital{stats.hospitals.pendingApproval > 1 ? "s" : ""}</strong> pending approval.{" "}
                <button style={styles.alertLink} onClick={() => navigate("/admin/hospitals")}>
                  Review now
                </button>
              </span>
            </div>
          )}

          {/* Stats grid */}
          <div style={styles.grid}>
            {cards.map(({ label, value, sub, color, Icon }) => (
              <div key={label} style={styles.card}>
                <div style={{ ...styles.iconWrap, background: color + "18" }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ ...styles.value, color }}>{value}</div>
                <div style={styles.cardLabel}>{label}</div>
                <div style={styles.cardSub}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={styles.quickRow}>
            {[
              { label: "Manage Hospitals", path: "/admin/hospitals", color: "#1E8449" },
              { label: "View All Donors",  path: "/admin/donors",    color: "#2980B9" },
              { label: "SMS Log",          path: "/admin/sms",       color: "#8E44AD" },
              { label: "Blood Requests",   path: "/admin/requests",  color: "#E67E22" },
            ].map(q => (
              <button key={q.path} style={{ ...styles.quickBtn, borderColor: q.color, color: q.color }}
                onClick={() => navigate(q.path)}>
                {q.label}
              </button>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}

const styles = {
  alertError:   { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 20, fontSize: 13 },
  loadingWrap:  { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinner:      { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  pendingAlert: { display: "flex", alignItems: "center", gap: 10, background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 14, color: "#92400E" },
  alertLink:    { background: "none", border: "none", color: "#C0392B", fontWeight: 700, cursor: "pointer", fontSize: 14, padding: 0 },
  grid:         { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 },
  card:         { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 4 },
  iconWrap:     { width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  value:        { fontSize: 30, fontWeight: 800 },
  cardLabel:    { fontSize: 13, fontWeight: 600, color: "#1C1C1C" },
  cardSub:      { fontSize: 12, color: "#6B6B6B" },
  quickRow:     { display: "flex", gap: 12, flexWrap: "wrap" },
  quickBtn:     { padding: "9px 20px", background: "#fff", border: "2px solid", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" },
};