import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

function StatusBadge({ status }) {
  const map = { pending: ["#FEF9E7","#E67E22"], fulfilled: ["#EAFAF1","#1E8449"], cancelled: ["#FDEDEC","#C0392B"] };
  const [bg, color] = map[status] || ["#F2F3F4","#555"];
  return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    api.get("/admin/requests")
      .then(res => setRequests(res.data.data || []))
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? requests : requests.filter(r => r.statusCode === filter);

  return (
    <AdminShell title="Blood Requests" subtitle="All requests submitted across every hospital.">
      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.tabs}>
        {["all", "pending", "fulfilled", "cancelled"].map(s => (
          <button key={s}
            style={{ ...styles.tab, ...(filter === s ? styles.tabActive : {}) }}
            onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={styles.tabCount}>
              {s === "all" ? requests.length : requests.filter(r => r.statusCode === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingWrap}><div style={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No requests found.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Hospital","Blood Type","Units","Urgency","Status","Donors Notified","Needed By"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.requestId} style={styles.tr}>
                  <td style={styles.td}><span style={styles.hospitalName}>{r.hospital?.name}</span></td>
                  <td style={styles.td}><span style={styles.bloodType}>{r.bloodTypeCode}</span></td>
                  <td style={styles.td}>{r.unitsNeeded}</td>
                  <td style={styles.td}>{r.urgencyLevel}</td>
                  <td style={styles.td}><StatusBadge status={r.statusCode} /></td>
                  <td style={styles.td}>{r._count?.notifications ?? 0}</td>
                  <td style={styles.td}>{new Date(r.neededBy).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const styles = {
  alertError:   { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13 },
  tabs:         { display: "flex", gap: 8, marginBottom: 18 },
  tab:          { padding: "7px 14px", background: "#fff", border: "1px solid #DDD5D0", borderRadius: 20, fontSize: 13, cursor: "pointer", color: "#6B6B6B", display: "flex", alignItems: "center", gap: 6 },
  tabActive:    { background: "#0F0F1A", color: "#fff", borderColor: "#0F0F1A" },
  tabCount:     { background: "rgba(0,0,0,0.1)", borderRadius: 10, padding: "1px 6px", fontSize: 11 },
  loadingWrap:  { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner:      { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  empty:        { textAlign: "center", padding: "48px 0", color: "#6B6B6B", fontSize: 14, background: "#fff", borderRadius: 12, border: "1px solid #DDD5D0" },
  tableWrap:    { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, overflow: "hidden" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { textAlign: "left", fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", borderBottom: "1px solid #DDD5D0", background: "#FAFAFA" },
  tr:           { borderBottom: "1px solid #F2EDE8" },
  td:           { padding: "11px 14px", fontSize: 13.5, color: "#1C1C1C" },
  hospitalName: { fontWeight: 600 },
  bloodType:    { background: "#FDEDEC", color: "#C0392B", fontWeight: 800, fontSize: 13, padding: "2px 8px", borderRadius: 6 },
};