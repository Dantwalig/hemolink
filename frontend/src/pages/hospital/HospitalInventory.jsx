import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import { IconDashboard, IconBlood, IconBox, IconLogout, IconWarning } from "../../utils/Icons.jsx";

const NAV = [
  { label: "Dashboard", path: "/hospital/dashboard", Icon: IconDashboard },
  { label: "Requests",  path: "/hospital/requests",  Icon: IconBlood },
  { label: "Inventory", path: "/hospital/inventory", Icon: IconBox },
];

const ALL_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HospitalInventory() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState({});
  const [editing,   setEditing]   = useState({});
  const [saving,    setSaving]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saved,     setSaved]     = useState(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    api.get("/inventory")
      .then(res => {
        const map = {};
        (res.data.data || []).forEach(item => { map[item.bloodTypeCode] = item.unitsAvailable; });
        setInventory(map);
        setEditing({ ...map });
      })
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (bloodTypeCode) => {
    const units = parseInt(editing[bloodTypeCode], 10);
    if (isNaN(units) || units < 0) { setError("Units must be a non-negative number."); return; }
    setSaving(bloodTypeCode);
    setError("");
    try {
      await api.put(`/inventory/${bloodTypeCode}`, { unitsAvailable: units });
      setInventory(prev => ({ ...prev, [bloodTypeCode]: units }));
      setSaved(bloodTypeCode);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/hospital-login"); };

  return (
    <div style={styles.shell}>
      {/* Global reset for double-scroll fix */}
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; overflow: hidden; height: 100vh; width: 100vw; background: #F7F3EF; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #bbb; }
      `}</style>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span></span>
        </div>
        <div style={styles.sidebarHospital}>{user?.name || "Hospital"}</div>
        <nav style={styles.nav}>
          {NAV.map(({ label, path, Icon }) => (
            <button key={path}
              style={{ ...styles.navItem, ...(window.location.pathname === path ? styles.navItemActive : {}) }}
              onClick={() => navigate(path)}>
              <Icon size={16} color={window.location.pathname === path ? "#fff" : "rgba(255,255,255,0.6)"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <IconLogout size={14} color="rgba(255,255,255,0.4)" /><span>Log Out</span>
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Blood Inventory</h1>
            <p style={styles.pageSub}>Track and update your hospital's blood stock levels.</p>
          </div>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.spinner} /><p>Loading…</p></div>
        ) : (
          <div style={styles.grid}>
            {ALL_BLOOD_TYPES.map(bt => {
              const units   = inventory[bt] ?? 0;
              const editVal = editing[bt] !== undefined ? editing[bt] : units;
              const isLow   = units < 5;
              const isSaved = saved === bt;
              const isSaving= saving === bt;
              return (
                <div key={bt} style={{ ...styles.card, borderColor: isLow ? "#C0392B" : "#DDD5D0" }}>
                  <div style={styles.cardTop}>
                    <div style={{ ...styles.bloodType, color: isLow ? "#C0392B" : "#1C1C1C" }}>{bt}</div>
                    {isLow && (
                      <span style={styles.lowBadge}>
                        <IconWarning size={11} color="#C0392B" /> Low
                      </span>
                    )}
                  </div>
                  <div style={{ ...styles.unitDisplay, color: isLow ? "#C0392B" : "#1E8449" }}>
                    {units}<span style={styles.unitLabel}> units</span>
                  </div>
                  <div style={styles.editRow}>
                    <input type="number" min="0" value={editVal}
                      onChange={e => setEditing(prev => ({ ...prev, [bt]: e.target.value }))}
                      style={styles.unitInput} />
                    <button
                      style={{ ...styles.saveBtn, ...(isSaved ? styles.savedBtn : {}), ...(isSaving ? styles.savingBtn : {}) }}
                      onClick={() => handleSave(bt)}
                      disabled={isSaving || String(editVal) === String(units)}>
                      {isSaving ? "…" : isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.legend}>
          <IconWarning size={13} color="#C0392B" />
          <span>Red border indicates fewer than 5 units available (low stock)</span>
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell:          { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EF" },
  sidebar:        { width: 220, background: "#1C1C1C", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 },
  sidebarLogo:    { display: "flex", alignItems: "center", gap: 8, padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoDrop:       { width: 28, height: 28, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:       { fontWeight: 800, fontSize: 16, color: "#fff" },
  logoRed:        { color: "#C0392B" },
  sidebarHospital:{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "12px 20px 4px", textTransform: "uppercase", letterSpacing: 0.5 },
  nav:            { flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px", gap: 2, overflowY: "auto" },
  navItem:        { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", borderRadius: 8, textAlign: "left" },
  navItemActive:  { background: "rgba(192,57,43,0.25)", color: "#fff", fontWeight: 600 },
  logoutBtn:      { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: "16px 20px", textAlign: "left", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)" },
  main:           { flex: 1, padding: "40px 40px 32px", marginLeft: 220, overflowY: "auto", height: "100vh", display: "flex", flexDirection: "column" },
  topBar:         { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  pageTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:        { fontSize: 14, color: "#6B6B6B" },
  alertError:     { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 16, fontSize: 13 },
  loadingWrap:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#6B6B6B" },
  spinner:        { width: 32, height: 32, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%" },
  grid:           { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  card:           { background: "#fff", border: "2px solid #DDD5D0", borderRadius: 14, padding: "18px", display: "flex", flexDirection: "column", gap: 10 },
  cardTop:        { display: "flex", justifyContent: "space-between", alignItems: "center" },
  bloodType:      { fontSize: 24, fontWeight: 800 },
  lowBadge:       { display: "flex", alignItems: "center", gap: 3, fontSize: 11, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 10, padding: "2px 7px", fontWeight: 600 },
  unitDisplay:    { fontSize: 32, fontWeight: 800 },
  unitLabel:      { fontSize: 13, color: "#6B6B6B", fontWeight: 400 },
  editRow:        { display: "flex", gap: 8 },
  unitInput:      { flex: 1, padding: "7px 10px", border: "1.5px solid #DDD5D0", borderRadius: 7, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#1C1C1C", outline: "none" },
  saveBtn:        { padding: "7px 14px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  savedBtn:       { background: "#1E8449" },
  savingBtn:      { background: "#ccc", cursor: "not-allowed" },
  legend:         { marginTop: 20, fontSize: 12, color: "#6B6B6B", display: "flex", alignItems: "center", gap: 6 },
};