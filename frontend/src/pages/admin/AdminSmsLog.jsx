import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

function ResponsePill({ status }) {
  const map = {
    Accepted: ["#EAFAF1", "#1E8449"],
    Declined: ["#FDEDEC", "#C0392B"],
    pending:  ["#FEF9E7", "#E67E22"],
  };
  const [bg, color] = map[status] || ["#F2F3F4", "#6B6B6B"];
  return (
    <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status || "pending"}
    </span>
  );
}

export default function AdminSmsLog() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [expanded,      setExpanded]      = useState(null);

  useEffect(() => {
    api.get("/admin/notifications")
      .then(res => setNotifications(res.data.data || []))
      .catch(() => setError("Failed to load SMS log."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="SMS Log" subtitle="All mock SMS notifications sent to donors. Replace with MTN API for production.">
      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.mockBanner}>
        <span style={styles.mockDot} />
        <span>Mock SMS mode — no real messages are sent. Each record shows the exact message that would be dispatched via MTN.</span>
      </div>

      {loading ? (
        <div style={styles.loadingWrap}><div style={styles.spinner} /></div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>No notifications yet. Create a blood request with a hospital that has GPS coordinates to trigger matching.</div>
      ) : (
        <div style={styles.list}>
          {notifications.map(n => (
            <div key={n.notificationId} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.donorName}>{n.donor?.fullName}</div>
                  <div style={styles.donorPhone}>{n.donor?.phone} &middot; <span style={styles.bloodType}>{n.donor?.bloodTypeCode}</span></div>
                  <div style={styles.hospitalName}>{n.bloodRequest?.hospital?.name}</div>
                </div>
                <div style={styles.cardRight}>
                  <ResponsePill status={n.responseStatus} />
                  <div style={styles.sentAt}>{new Date(n.sentAt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })}</div>
                  <button style={styles.expandBtn} onClick={() => setExpanded(expanded === n.notificationId ? null : n.notificationId)}>
                    {expanded === n.notificationId ? "Hide message" : "View message"}
                  </button>
                </div>
              </div>
              {expanded === n.notificationId && n.smsMessage && (
                <div style={styles.messageBox}>
                  <div style={styles.messageLabel}>SMS Content</div>
                  <div style={styles.messageText}>{n.smsMessage}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

const styles = {
  alertError:   { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13 },
  mockBanner:   { display: "flex", alignItems: "center", gap: 10, background: "#F0E8DF", border: "1px solid #DDD5D0", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#6B6B6B" },
  mockDot:      { width: 10, height: 10, borderRadius: "50%", background: "#E67E22", flexShrink: 0 },
  loadingWrap:  { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner:      { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  empty:        { textAlign: "center", padding: "48px 24px", color: "#6B6B6B", fontSize: 14, background: "#fff", borderRadius: 12, border: "1px solid #DDD5D0", lineHeight: 1.6 },
  list:         { display: "flex", flexDirection: "column", gap: 10 },
  card:         { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  cardLeft:     { display: "flex", flexDirection: "column", gap: 3 },
  donorName:    { fontSize: 14, fontWeight: 700, color: "#1C1C1C" },
  donorPhone:   { fontSize: 12.5, color: "#6B6B6B" },
  bloodType:    { fontWeight: 700, color: "#C0392B" },
  hospitalName: { fontSize: 12.5, color: "#2980B9", fontWeight: 500 },
  cardRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 },
  sentAt:       { fontSize: 11.5, color: "#9B9B9B" },
  expandBtn:    { background: "none", border: "none", color: "#C0392B", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 },
  messageBox:   { background: "#F7F3EF", border: "1px solid #DDD5D0", borderRadius: 8, padding: "12px 14px" },
  messageLabel: { fontSize: 10, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 },
  messageText:  { fontSize: 13, color: "#1C1C1C", lineHeight: 1.65, wordBreak: "break-word" },
};