import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import {
  IconDashboard, IconBlood, IconBox, IconList,
  IconLogout, IconWarning, IconCheck,
} from "../../utils/Icons.jsx";

// Admin-specific nav icons
const IconHospitalNav = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="2" y="5" width="12" height="10" rx="1" stroke={color} strokeWidth="1.4"/>
    <path d="M5 15v-4h6v4M6 2h4v3H6zM7 8h2M8 7v2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconUsers = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.4"/>
    <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M11 4a2.5 2.5 0 1 1 0 5M15 14c0-2.414-1.494-4.5-3.5-4.83" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconSms = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.4"/>
    <path d="M4 14l4-2 4 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7h8M4 9.5h5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const NAV = [
  { label: "Dashboard",     path: "/admin/dashboard",     Icon: IconDashboard },
  { label: "Hospitals",     path: "/admin/hospitals",     Icon: IconHospitalNav },
  { label: "Donors",        path: "/admin/donors",        Icon: IconUsers },
  { label: "Blood Requests",path: "/admin/requests",      Icon: IconBlood },
  { label: "SMS Log",       path: "/admin/sms",           Icon: IconSms },
];

export default function AdminShell({ children, title, subtitle }) {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const path             = window.location.pathname;

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <div>
            <div style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span></div>
            <div style={styles.adminBadge}>RBC Admin</div>
          </div>
        </div>
        <div style={styles.adminEmail}>{user?.email || "admin@rbc.gov.rw"}</div>
        <nav style={styles.nav}>
          {NAV.map(({ label, path: navPath, Icon }) => (
            <button key={navPath}
              style={{ ...styles.navItem, ...(path === navPath ? styles.navItemActive : {}) }}
              onClick={() => navigate(navPath)}>
              <Icon size={15} color={path === navPath ? "#fff" : "rgba(255,255,255,0.55)"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <IconLogout size={14} color="rgba(255,255,255,0.4)" />
          <span>Log Out</span>
        </button>
      </aside>

      <main style={styles.main}>
        {(title || subtitle) && (
          <div style={styles.topBar}>
            <div>
              {title    && <h1 style={styles.pageTitle}>{title}</h1>}
              {subtitle && <p  style={styles.pageSub}>{subtitle}</p>}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

const styles = {
  shell:        { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EF" },
  sidebar:      { width: 230, background: "#0F0F1A", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  sidebarLogo:  { display: "flex", alignItems: "center", gap: 10, padding: "0 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoDrop:     { width: 28, height: 28, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoDropText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:     { fontWeight: 800, fontSize: 15, color: "#fff" },
  logoRed:      { color: "#C0392B" },
  adminBadge:   { fontSize: 9, color: "#E87B6E", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginTop: 2 },
  adminEmail:   { fontSize: 11, color: "rgba(255,255,255,0.35)", padding: "10px 20px 4px", textTransform: "uppercase", letterSpacing: 0.4 },
  nav:          { flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px", gap: 2 },
  navItem:      { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 13.5, cursor: "pointer", borderRadius: 8, textAlign: "left" },
  navItemActive:{ background: "rgba(192,57,43,0.28)", color: "#fff", fontWeight: 600 },
  logoutBtn:    { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", padding: "14px 20px" },
  main:         { flex: 1, padding: "32px 40px", overflowY: "auto", height: "100vh" },
  topBar:       { marginBottom: 26 },
  pageTitle:    { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:      { fontSize: 14, color: "#6B6B6B" },
};