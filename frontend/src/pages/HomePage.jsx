import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate("/login")}>Donor Login</button>
          <button style={styles.navBtn} onClick={() => navigate("/hospital-login")}>Hospital Login</button>
          <button style={styles.navBtnPrimary} onClick={() => navigate("/register")}>Register as Donor</button>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.pulseDot}></span>
            <span>Emergency Blood Matching — Live</span>
          </div>
          <h1 style={styles.heroTitle}>
            Your blood could <em style={styles.heroEm}>save a life</em> today.
          </h1>
          <p style={styles.heroSubtitle}>
            HemoLink Rwanda connects voluntary donors directly to hospitals in real time.
            When an emergency matches your blood type and location, you get an SMS instantly.
            Register once. Answer when it matters.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.btnPrimary} onClick={() => navigate("/register")}>
              Register as Donor →
            </button>
            <button style={styles.btnOutline} onClick={() => navigate("/hospital-login")}>
              Hospital Portal
            </button>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.bloodDrop}>🩸</div>
          <div style={styles.heroCard}>
            <div style={styles.heroCardLabel}>Blood needed urgently</div>
            <div style={styles.heroCardType}>O+</div>
            <div style={styles.heroCardLocation}>📍 Kigali University Hospital</div>
            <div style={styles.heroCardTime}>Alert sent &lt;60 seconds ago</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.stats}>
        {[
          { num: "86K",   label: "Units collected per year" },
          { num: "130K",  label: "Units needed per year" },
          { num: "58K+",  label: "Registered donors (RBC)" },
          { num: "<60s",  label: "Target alert dispatch time" },
        ].map((s) => (
          <div key={s.num} style={styles.statCard}>
            <span style={styles.statNum}>{s.num}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How HemoLink Works</h2>
        <p style={styles.sectionSub}>Three steps from emergency request to donor response.</p>
        <div style={styles.steps}>
          {[
            { icon: "🏥", step: "1", title: "Hospital Requests Blood", desc: "A hospital submits an urgent blood request through their dashboard, specifying blood type, units needed, and urgency level." },
            { icon: "📡", step: "2", title: "System Matches Donors",   desc: "HemoLink's geospatial engine finds compatible donors nearby using the Haversine formula and filters by availability." },
            { icon: "📱", step: "3", title: "Donors Get SMS Alerts",   desc: "Matched donors receive an SMS within 60 seconds. They confirm or decline. The hospital tracks responses in real time." },
          ].map((s) => (
            <div key={s.step} style={styles.stepCard}>
              <div style={styles.stepIcon}>{s.icon}</div>
              <div style={styles.stepNum}>Step {s.step}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to save lives?</h2>
        <p style={styles.ctaSub}>Join Rwanda's emergency blood donor network today.</p>
        <button style={styles.btnPrimaryLarge} onClick={() => navigate("/register")}>
          Register as a Donor — it's free →
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>© 2026 HemoLink Rwanda · Built for Rwanda Biomedical Centre</span>
        <span>Kigali, Rwanda</span>
      </footer>
    </div>
  );
}

/* Styles */
const styles = {
  page:       { fontFamily: "'DM Sans', sans-serif", background: "#FDF6EE", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#1C1C1C" },

  // Header
  header:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", background: "#fff", borderBottom: "1px solid #DDD5D0", position: "sticky", top: 0, zIndex: 100 },
  logo:       { display: "flex", alignItems: "center", gap: 10 },
  logoDrop:   { width: 34, height: 34, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 13 },
  logoText:   { fontWeight: 800, fontSize: 18, letterSpacing: -0.3 },
  logoRed:    { color: "#C0392B" },
  nav:        { display: "flex", gap: 10, alignItems: "center" },
  navBtn:     { background: "none", border: "1px solid #DDD5D0", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" },
  navBtnPrimary: { background: "#C0392B", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff" },

  // Hero
  hero:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "80px 48px", gap: 48, flex: 1 },
  heroContent:{ flex: 1, maxWidth: 560 },
  badge:      { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 20, padding: "6px 14px", marginBottom: 20, fontSize: 12, fontWeight: 500, color: "#C0392B" },
  pulseDot:   { width: 7, height: 7, borderRadius: "50%", background: "#C0392B", display: "inline-block", animation: "pulse 1.5s infinite" },
  heroTitle:  { fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 },
  heroEm:     { fontStyle: "italic", fontWeight: 400, color: "#C0392B" },
  heroSubtitle: { fontSize: 16, color: "#6B6B6B", lineHeight: 1.75, marginBottom: 36 },
  heroBtns:   { display: "flex", gap: 14 },
  btnPrimary: { background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnOutline: { background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  heroVisual: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 },
  bloodDrop:  { fontSize: 80 },
  heroCard:   { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 16, padding: "20px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center", minWidth: 260 },
  heroCardLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#6B6B6B", marginBottom: 6 },
  heroCardType:  { fontSize: 48, fontWeight: 800, color: "#C0392B", fontFamily: "serif" },
  heroCardLocation: { fontSize: 13, color: "#1C1C1C", margin: "8px 0 4px" },
  heroCardTime:  { fontSize: 11, color: "#1E8449", fontWeight: 500 },

  // Stats
  stats:      { display: "flex", justifyContent: "center", gap: 20, padding: "40px 48px", background: "#C0392B", flexWrap: "wrap" },
  statCard:   { textAlign: "center", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "20px 32px" },
  statNum:    { display: "block", fontSize: 30, fontWeight: 800, color: "#fff" },
  statLabel:  { display: "block", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },

  // How it works
  section:    { padding: "72px 48px", textAlign: "center" },
  sectionTitle: { fontSize: 32, fontWeight: 800, marginBottom: 10 },
  sectionSub: { fontSize: 15, color: "#6B6B6B", marginBottom: 48 },
  steps:      { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" },
  stepCard:   { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 16, padding: "32px 28px", flex: 1, minWidth: 240, maxWidth: 300, textAlign: "left" },
  stepIcon:   { fontSize: 36, marginBottom: 12 },
  stepNum:    { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#C0392B", marginBottom: 6 },
  stepTitle:  { fontSize: 17, fontWeight: 700, marginBottom: 10 },
  stepDesc:   { fontSize: 14, color: "#6B6B6B", lineHeight: 1.65 },

  // CTA
  cta:        { background: "#1C1C1C", padding: "72px 48px", textAlign: "center" },
  ctaTitle:   { fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 10 },
  ctaSub:     { fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 32 },
  btnPrimaryLarge: { background: "#C0392B", color: "#fff", border: "none", borderRadius: 12, padding: "15px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer" },

  // Footer
  footer:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", background: "#fff", borderTop: "1px solid #DDD5D0", fontSize: 12, color: "#6B6B6B" },
};