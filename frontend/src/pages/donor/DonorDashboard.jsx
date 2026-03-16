import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import { 
  IconBlood, IconHeartbeat, IconBell, IconUser, IconPhone, 
  IconPower, IconMessage, IconMatch, IconFile, IconCheckCircle, IconAlert 
} from "../../utils/Icons.jsx";

export default function DonorDashboard() {
  const navigate         = useNavigate();
  const { logout }       = useAuth();
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

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p>Loading Dashboard…</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={styles.page}>
        <div style={styles.content}>
          <div style={styles.alertError}><IconAlert size={14} /> {error}</div>
        </div>
      </div>
    );
  }

  const firstName = profile.fullName.split(" ")[0];

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerName}>{profile.fullName}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div style={styles.content}>
        {error && <div style={styles.alertError}><IconAlert size={14} /> {error}</div>}

        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>Welcome back, {firstName}</h1>
          <p style={styles.welcomeSub}>Here is an overview of your donor profile and status.</p>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}><IconBlood size={20} color="#C0392B" /></div>
            <div>
              <div style={styles.statLabel}>BLOOD TYPE</div>
              <div style={styles.statValue}>{profile.bloodTypeCode}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}><IconHeartbeat size={20} color="#C0392B" /></div>
            <div>
              <div style={styles.statLabel}>STATUS</div>
              <div style={styles.statValue}>{profile.available ? "Active" : "Inactive"}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}><IconBell size={20} color="#C0392B" /></div>
            <div>
              <div style={styles.statLabel}>SMS ALERTS</div>
              <div style={styles.statValue}>{profile.consentSms ? "Enabled" : "Disabled"}</div>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* Left Column */}
          <div style={styles.leftCol}>
            
            {/* Personal Info Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Personal Information</h2>
              <div style={styles.infoRow}>
                <div style={styles.infoLabelGroup}>
                  <div style={styles.infoIconBox}><IconUser size={16} color="#6B6B6B" /></div>
                  <div style={styles.infoLabelText}>Full Name</div>
                </div>
                <div style={styles.infoValue}>{profile.fullName}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabelGroup}>
                  <div style={styles.infoIconBox}><IconPhone size={16} color="#6B6B6B" /></div>
                  <div style={styles.infoLabelText}>Phone</div>
                </div>
                <div style={styles.infoValue}>{profile.phone}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabelGroup}>
                  <div style={styles.infoIconBox}><IconBlood size={16} color="#6B6B6B" /></div>
                  <div style={styles.infoLabelText}>Blood Type</div>
                </div>
                <div style={{ ...styles.infoValue, color: "#C0392B", fontWeight: 700 }}>{profile.bloodTypeCode}</div>
              </div>
              <div style={{...styles.infoRow, borderBottom: "none", paddingBottom: 0}}>
                <div style={styles.infoLabelGroup}>
                  <div style={styles.infoIconBox}><IconBell size={16} color="#6B6B6B" /></div>
                  <div style={styles.infoLabelText}>SMS Alerts</div>
                </div>
                <div style={styles.infoValue}>{profile.consentSms ? "Enabled" : "Disabled"}</div>
              </div>
            </div>

            {/* How It Works Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>How It Works</h2>
              <div style={styles.stepsTimeline}>
                <div style={styles.stepItem}>
                  <div style={styles.timelineNode}>
                    <div style={styles.nodeCircle}>1</div>
                    <div style={styles.nodeLine} />
                  </div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>Request submitted</div>
                    <div style={styles.stepDesc}>A hospital near you submits an urgent blood request.</div>
                  </div>
                </div>

                <div style={styles.stepItem}>
                  <div style={styles.timelineNode}>
                    <div style={styles.nodeCircle}>2</div>
                    <div style={styles.nodeLine} />
                  </div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>You get matched</div>
                    <div style={styles.stepDesc}>HemoLink matches you by blood type and location.</div>
                  </div>
                </div>

                <div style={styles.stepItem}>
                  <div style={styles.timelineNode}>
                    <div style={styles.nodeCircle}>3</div>
                    <div style={styles.nodeLine} />
                  </div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>SMS alert sent</div>
                    <div style={styles.stepDesc}>You receive an SMS with a secure confirmation link.</div>
                  </div>
                </div>

                <div style={styles.stepItem}>
                  <div style={styles.timelineNode}>
                    <div style={styles.nodeCircle}>4</div>
                  </div>
                  <div style={{...styles.stepContent, paddingBottom: 0}}>
                    <div style={styles.stepTitle}>Hospital notified</div>
                    <div style={styles.stepDesc}>You confirm or decline — the hospital is notified instantly.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Availability Card */}
          <div style={styles.rightCol}>
            <div style={{ 
              ...styles.availabilityCard, 
              borderTopColor: profile.available ? "#27AE60" : "#E74C3C" 
            }}>
              
              <div style={{ 
                ...styles.bigIconWrap, 
                backgroundColor: profile.available ? "#EAFAF1" : "#FDF2E9" 
              }}>
                <IconPower size={32} color={profile.available ? "#27AE60" : "#E74C3C"} />
              </div>

              <h2 style={styles.availTitle}>
                {profile.available ? "You are available" : "You are unavailable"}
              </h2>
              <p style={styles.availDesc}>
                {profile.available 
                  ? "You are active in the matching pool and may receive SMS alerts from nearby hospitals." 
                  : "You are currently inactive. You will not receive any new SMS alerts until you flip your status."}
              </p>

              <button 
                style={styles.toggleBtn} 
                onClick={toggleAvailability} 
                disabled={toggling}
              >
                {toggling 
                  ? "Changing..." 
                  : profile.available ? "Go Unavailable" : "Go Available"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: "100vh", 
    background: "#FAF8F5", // Very light, pleasant beige/warm white
    fontFamily: "'DM Sans', sans-serif" 
  },
  header: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "16px 48px", 
    background: "#fff", 
    borderBottom: "1px solid #EBE5E0", 
    position: "sticky", 
    top: 0, 
    zIndex: 100 
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoDrop: { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoText: { fontWeight: 800, fontSize: 17, color: "#1C1C1C", letterSpacing: -0.3 },
  logoRed: { color: "#C0392B" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerName: { fontSize: 14, color: "#1C1C1C", fontWeight: 500 },
  logoutBtn: { background: "none", border: "1px solid #EBE5E0", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C", transition: "background 0.2s" },
  
  content: { padding: "48px", maxWidth: 1040, margin: "0 auto" },
  alertError: { display: "flex", alignItems: "center", gap: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 20, fontSize: 13.5 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, color: "#6B6B" },
  spinner: { width: 32, height: 32, border: "3px solid #EBE5E0", borderTopColor: "#C0392B", borderRadius: "50%" },
  
  welcome: { marginBottom: 32 },
  welcomeTitle: { fontSize: 32, fontWeight: 800, color: "#1C1C1C", letterSpacing: -0.5, marginBottom: 8 },
  welcomeSub: { fontSize: 15, color: "#6B6B6B" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 },
  statCard: { 
    background: "#fff", 
    border: "1px solid rgba(235,229,224, 0.6)", 
    borderRadius: 16, 
    padding: "24px", 
    display: "flex", 
    alignItems: "center", 
    gap: 16, 
    boxShadow: "0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  statIconBox: { width: 48, height: 48, borderRadius: 12, background: "#FDEDEC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: 12, fontWeight: 700, color: "#8E8E8E", letterSpacing: 0.8, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: 800, color: "#1C1C1C" },

  mainGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" },
  leftCol: { display: "flex", flexDirection: "column", gap: 28 },
  rightCol: { display: "flex", flexDirection: "column" },

  card: { 
    background: "#fff", 
    border: "1px solid rgba(235,229,224, 0.6)", 
    borderRadius: 16, 
    padding: "32px", 
    boxShadow: "0 6px 24px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02)" 
  },
  cardTitle: { fontSize: 18, fontWeight: 800, color: "#1C1C1C", letterSpacing: -0.3, marginBottom: 28 },

  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #F2EDE8" },
  infoLabelGroup: { display: "flex", alignItems: "center", gap: 12 },
  infoIconBox: { width: 36, height: 36, borderRadius: 8, background: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" },
  infoLabelText: { fontSize: 13, color: "#8E8E8E" },
  infoValue: { fontSize: 14, fontWeight: 600, color: "#1C1C1C" },

  stepsTimeline: { display: "flex", flexDirection: "column" },
  stepItem: { display: "flex", alignItems: "stretch" },
  timelineNode: { display: "flex", flexDirection: "column", alignItems: "center", width: 40, marginRight: 16 },
  nodeCircle: { 
    width: 28, height: 28, borderRadius: "50%", 
    background: "#F7F5F2", border: "1px solid #EBE5E0", color: "#6B6B6B", 
    fontSize: 12, fontWeight: 700, 
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
  },
  nodeLine: { width: 2, flex: 1, background: "#EBE5E0", margin: "8px 0" },
  stepContent: { paddingBottom: 28, paddingTop: 2 },
  stepTitle: { fontSize: 14, fontWeight: 700, color: "#1C1C1C", marginBottom: 4 },
  stepDesc: { fontSize: 13, color: "#6B6B6B", lineHeight: 1.5 },

  availabilityCard: { 
    background: "#fff", 
    border: "1px solid rgba(235,229,224, 0.6)", 
    borderTopWidth: 5,
    borderRadius: 16, 
    padding: "48px 36px", 
    boxShadow: "0 12px 32px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  bigIconWrap: { width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  availTitle: { fontSize: 20, fontWeight: 800, color: "#1C1C1C", letterSpacing: -0.4, marginBottom: 12 },
  availDesc: { fontSize: 14, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 32 },
  toggleBtn: { 
    width: "100%", 
    padding: 14, 
    background: "#F7F5F2", 
    border: "1px solid #EBE5E0", 
    borderRadius: 10, 
    fontSize: 14, 
    fontWeight: 700, 
    color: "#1C1C1C", 
    cursor: "pointer",
    transition: "background 0.2s"
  }
};