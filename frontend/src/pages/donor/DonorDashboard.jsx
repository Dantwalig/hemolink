import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";

export default function DonorDashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const [profile,        setProfile]    = useState(null);
  const [loading,        setLoading]    = useState(true);
  const [toggling,       setToggling]   = useState(false);
  const [error,          setError]      = useState("");

  useEffect(() => {
    api.get("/donors/profile")
      .then((res) => setProfile(res.data.data))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const res = await api.put("/donors/availability", { available: !profile.available });
      setProfile(res.data.data);
    } catch {
      setError("Failed to update availability.");
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerName}>{user?.fullName || "Donor"}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div style={styles.content}>
        {error && <div style={styles.alertError}>{error}</div>}

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.spinner} /><p>Loading…</p></div>
        ) : profile ? (
          <>
            <div style={styles.welcome}>
              <h1 style={styles.welcomeTitle}>Welcome back, {profile.fullName.split(" ")[0]}! 👋</h1>
              <p style={styles.welcomeSub}>Thank you for being part of Rwanda's blood donor network.</p>
            </div>

            <div style={styles.grid}>
              {/* Availability card */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Your Availability</div>
                <div style={{ ...styles.availStatus, color: profile.available ? "#1E8449" : "#C0392B" }}>
                  {profile.available ? "✅ Available to Donate" : "⏸ Currently Unavailable"}
                </div>
                <p style={styles.cardSub}>
                  {profile.available
                    ? "You are active in the matching pool. You may receive SMS alerts."
                    : "You won't receive new alerts until you switch back to available."}
                </p>
                <button
                  style={{ ...styles.toggleBtn, background: profile.available ? "#FDEDEC" : "#EAFAF1", color: profile.available ? "#C0392B" : "#1E8449" }}
                  onClick={toggleAvailability} disabled={toggling}>
                  {toggling ? "Updating…" : profile.available ? "Mark as Unavailable" : "Mark as Available"}
                </button>
              </div>

              {/* Profile card */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Your Profile</div>
                <div style={styles.profileRow}><span style={styles.profileLabel}>Full Name</span><span>{profile.fullName}</span></div>
                <div style={styles.profileRow}><span style={styles.profileLabel}>Phone</span><span>{profile.phone}</span></div>
                <div style={styles.profileRow}>
                  <span style={styles.profileLabel}>Blood Type</span>
                  <span style={styles.bloodType}>{profile.bloodTypeCode}</span>
                </div>
                <div style={styles.profileRow}><span style={styles.profileLabel}>SMS Alerts</span><span>{profile.consentSms ? "Enabled ✅" : "Disabled ❌"}</span></div>
              </div>

              {/* Info card */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>How This Works</div>
                <div style={styles.infoList}>
                  {[
                    "A hospital near you submits an urgent blood request.",
                    "HemoLink matches you by blood type and location.",
                    "You receive an SMS with a secure link.",
                    "You confirm or decline — the hospital is notified instantly.",
                  ].map((step, i) => (
                    <div key={i} style={styles.infoStep}>
                      <div style={styles.infoNum}>{i + 1}</div>
                      <div style={styles.infoText}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight: "100vh", background: "#FDF6EE", fontFamily: "'DM Sans', sans-serif" },
  header:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", background: "#fff", borderBottom: "1px solid #DDD5D0", position: "sticky", top: 0, zIndex: 100 },
  logo:         { display: "flex", alignItems: "center", gap: 10 },
  logoDrop:     { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoText:     { fontWeight: 800, fontSize: 17 },
  logoRed:      { color: "#C0392B" },
  headerRight:  { display: "flex", alignItems: "center", gap: 16 },
  headerName:   { fontSize: 14, color: "#6B6B6B" },
  logoutBtn:    { background: "none", border: "1px solid #DDD5D0", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: "#1C1C1C" },
  content:      { padding: "40px 48px", maxWidth: 1000, margin: "0 auto" },
  alertError:   { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 20, fontSize: 13 },
  loadingWrap:  { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinner:      { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  welcome:      { marginBottom: 32 },
  welcomeTitle: { fontSize: 28, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  welcomeSub:   { fontSize: 15, color: "#6B6B6B" },
  grid:         { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 },
  card:         { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 16, padding: "24px" },
  cardTitle:    { fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B6B", marginBottom: 16 },
  cardSub:      { fontSize: 13, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 16 },
  availStatus:  { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  toggleBtn:    { padding: "9px 18px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  profileRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2EDE8", fontSize: 14 },
  profileLabel: { color: "#6B6B6B" },
  bloodType:    { fontWeight: 800, fontSize: 18, color: "#C0392B" },
  infoList:     { display: "flex", flexDirection: "column", gap: 14 },
  infoStep:     { display: "flex", alignItems: "flex-start", gap: 12 },
  infoNum:      { width: 24, height: 24, background: "#C0392B", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 },
  infoText:     { fontSize: 13, color: "#6B6B6B", lineHeight: 1.55 },
};