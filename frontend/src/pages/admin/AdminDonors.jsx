import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

export default function AdminDonors() {
  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    api.get("/admin/donors")
      .then(res => setDonors(res.data.data || []))
      .catch(() => setError("Failed to load donors."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = donors
    .filter(d => filter === "all" ? true : filter === "available" ? d.available : !d.available)
    .filter(d =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.bloodTypeCode.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminShell title="Donors" subtitle="All registered blood donors on the platform.">
      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.toolbar}>
        <input style={styles.search} placeholder="Search by name, phone, or blood type…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={styles.tabs}>
          {[
            { key: "all",         label: "All",         count: donors.length },
            { key: "available",   label: "Available",   count: donors.filter(d => d.available).length },
            { key: "unavailable", label: "Unavailable", count: donors.filter(d => !d.available).length },
          ].map(t => (
            <button key={t.key}
              style={{ ...styles.tab, ...(filter === t.key ? styles.tabActive : {}) }}
              onClick={() => setFilter(t.key)}>
              {t.label} <span style={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingWrap}><div style={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No donors found.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Phone", "Blood Type", "Status", "SMS Consent", "Notifications", "Coordinates"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.donorId} style={styles.tr}>
                  <td style={styles.td}><span style={styles.donorName}>{d.fullName}</span></td>
                  <td style={styles.td}>{d.phone}</td>
                  <td style={styles.td}>
                    <span style={styles.bloodTypeBadge}>{d.bloodTypeCode}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.pill, background: d.available ? "#EAFAF1" : "#F2F3F4", color: d.available ? "#1E8449" : "#6B6B6B" }}>
                      {d.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.pill, background: d.consentSms ? "#EBF5FB" : "#FDEDEC", color: d.consentSms ? "#2980B9" : "#C0392B" }}>
                      {d.consentSms ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={styles.td}>{d._count?.notifications ?? 0}</td>
                  <td style={styles.td}>
                    <span style={styles.coords}>{d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}</span>
                  </td>
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
  alertError:    { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13 },
  toolbar:       { display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" },
  search:        { flex: 1, minWidth: 220, padding: "9px 14px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, outline: "none" },
  tabs:          { display: "flex", gap: 6 },
  tab:           { padding: "7px 14px", background: "#fff", border: "1px solid #DDD5D0", borderRadius: 20, fontSize: 12.5, cursor: "pointer", color: "#6B6B6B", display: "flex", alignItems: "center", gap: 5 },
  tabActive:     { background: "#0F0F1A", color: "#fff", borderColor: "#0F0F1A" },
  tabCount:      { background: "rgba(0,0,0,0.1)", borderRadius: 10, padding: "1px 5px", fontSize: 11 },
  loadingWrap:   { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner:       { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  empty:         { textAlign: "center", padding: "48px 0", color: "#6B6B6B", fontSize: 14, background: "#fff", borderRadius: 12, border: "1px solid #DDD5D0" },
  tableWrap:     { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 14, overflow: "hidden" },
  table:         { width: "100%", borderCollapse: "collapse" },
  th:            { textAlign: "left", fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", borderBottom: "1px solid #DDD5D0", background: "#FAFAFA" },
  tr:            { borderBottom: "1px solid #F2EDE8" },
  td:            { padding: "11px 14px", fontSize: 13.5, color: "#1C1C1C" },
  donorName:     { fontWeight: 600 },
  bloodTypeBadge:{ background: "#FDEDEC", color: "#C0392B", fontWeight: 800, fontSize: 13, padding: "2px 8px", borderRadius: 6 },
  pill:          { padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  coords:        { fontSize: 11.5, color: "#9B9B9B", fontFamily: "monospace" },
};