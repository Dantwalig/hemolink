import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";
import { IconCheckCircle, IconWarning, IconAlert } from "../../utils/Icons.jsx";

function StatusPill({ approved }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: approved ? "#EAFAF1" : "#FEF3C7",
      color:      approved ? "#1E8449" : "#92400E",
    }}>
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("all");
  const [acting,    setActing]    = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    api.get("/admin/hospitals")
      .then(res => setHospitals(res.data.data || []))
      .catch(() => setError("Failed to load hospitals."))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await api.patch(`/admin/hospitals/${id}/approve`);
      setHospitals(prev => prev.map(h => h.hospitalId === id ? { ...h, isApproved: true } : h));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve.");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Remove "${name}"? This cannot be undone.`)) return;
    setActing(id);
    try {
      await api.delete(`/admin/hospitals/${id}/reject`);
      setHospitals(prev => prev.filter(h => h.hospitalId !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject.");
    } finally {
      setActing(null);
    }
  };

  const filtered = filter === "all" ? hospitals
    : filter === "pending"  ? hospitals.filter(h => !h.isApproved)
    : hospitals.filter(h => h.isApproved);

  const pendingCount  = hospitals.filter(h => !h.isApproved).length;
  const approvedCount = hospitals.filter(h =>  h.isApproved).length;

  return (
    <AdminShell title="Hospitals" subtitle="Manage hospital accounts and approvals.">
      {error && <div style={styles.alertError}><IconAlert size={13} /> {error}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: "all",      label: "All",      count: hospitals.length },
          { key: "pending",  label: "Pending",  count: pendingCount },
          { key: "approved", label: "Approved", count: approvedCount },
        ].map(t => (
          <button key={t.key}
            style={{ ...styles.tab, ...(filter === t.key ? styles.tabActive : {}) }}
            onClick={() => setFilter(t.key)}>
            {t.label} <span style={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingWrap}><div style={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No {filter !== "all" ? filter : ""} hospitals found.</div>
      ) : (
        <div style={styles.list}>
          {filtered.map(h => (
            <div key={h.hospitalId} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.hospitalName}>{h.name}</div>
                <div style={styles.hospitalMeta}>{h.email} &middot; {h.phone}</div>
                <div style={styles.hospitalMeta}>
                  {h.district?.name}, {h.province?.name} &middot; {h.sector}
                </div>
                <div style={styles.hospitalMeta}>
                  {h._count?.bloodRequests ?? 0} blood request{h._count?.bloodRequests !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={styles.cardRight}>
                <StatusPill approved={h.isApproved} />
                {!h.isApproved && (
                  <div style={styles.actionRow}>
                    <button style={styles.approveBtn}
                      disabled={acting === h.hospitalId}
                      onClick={() => handleApprove(h.hospitalId)}>
                      <IconCheckCircle size={13} color="#fff" />
                      {acting === h.hospitalId ? "…" : "Approve"}
                    </button>
                    <button style={styles.rejectBtn}
                      disabled={acting === h.hospitalId}
                      onClick={() => handleReject(h.hospitalId, h.name)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

const styles = {
  alertError:   { display: "flex", alignItems: "center", gap: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13 },
  tabs:         { display: "flex", gap: 8, marginBottom: 20 },
  tab:          { padding: "7px 16px", background: "#fff", border: "1px solid #DDD5D0", borderRadius: 20, fontSize: 13, cursor: "pointer", color: "#6B6B6B", display: "flex", alignItems: "center", gap: 6 },
  tabActive:    { background: "#0F0F1A", color: "#fff", borderColor: "#0F0F1A" },
  tabCount:     { background: "rgba(0,0,0,0.1)", borderRadius: 10, padding: "1px 6px", fontSize: 11 },
  loadingWrap:  { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner:      { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  empty:        { textAlign: "center", padding: "48px 0", color: "#6B6B6B", fontSize: 14, background: "#fff", borderRadius: 12, border: "1px solid #DDD5D0" },
  list:         { display: "flex", flexDirection: "column", gap: 10 },
  card:         { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 },
  cardLeft:     { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  hospitalName: { fontSize: 15, fontWeight: 700, color: "#1C1C1C" },
  hospitalMeta: { fontSize: 12.5, color: "#6B6B6B" },
  cardRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 },
  actionRow:    { display: "flex", gap: 8 },
  approveBtn:   { display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "#1E8449", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  rejectBtn:    { padding: "7px 14px", background: "transparent", color: "#C0392B", border: "1px solid #C0392B", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
};