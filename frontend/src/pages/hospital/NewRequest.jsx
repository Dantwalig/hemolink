import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";

const NAV = [
  { label: "Dashboard", path: "/hospital/dashboard", icon: "📊" },
  { label: "Requests",  path: "/hospital/requests",  icon: "🩸" },
  { label: "Inventory", path: "/hospital/inventory", icon: "📦" },
];

const BLOOD_TYPES   = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["low", "medium", "high", "critical"];

export default function NewRequest() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    bloodTypeCode: "",
    unitsNeeded:   "",
    urgencyLevel:  "",
    neededBy:      "",
  });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) validate(field, val);
  };

  const validate = (field, val = form[field]) => {
    let err = "";
    if (field === "bloodTypeCode" && !val)     err = "Select a blood type.";
    if (field === "unitsNeeded") {
      const n = parseInt(val, 10);
      if (!val || isNaN(n) || n < 1)           err = "Enter a positive number of units.";
    }
    if (field === "urgencyLevel" && !val)      err = "Select an urgency level.";
    if (field === "neededBy") {
      if (!val)                                err = "Select a date and time.";
      else if (new Date(val) <= new Date())    err = "Needed-by must be in the future.";
    }
    setErrors((e) => ({ ...e, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    const fields  = ["bloodTypeCode", "unitsNeeded", "urgencyLevel", "neededBy"];
    const results = fields.map((f) => validate(f));
    return results.every(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setLoading(true);
    setServerError("");
    try {
      await api.post("/requests", {
        bloodTypeCode: form.bloodTypeCode,
        unitsNeeded:   parseInt(form.unitsNeeded, 10),
        urgencyLevel:  form.urgencyLevel,
        neededBy:      new Date(form.neededBy).toISOString(),
      });
      navigate("/hospital/requests");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/hospital-login"); };

  const urgencyColor = { low: "#1E8449", medium: "#F39C12", high: "#E67E22", critical: "#C0392B" };

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span></span>
        </div>
        <div style={styles.sidebarHospital}>{user?.name || "Hospital"}</div>
        <nav style={styles.nav}>
          {NAV.map((item) => (
            <button key={item.path}
              style={{ ...styles.navItem, ...(window.location.pathname === item.path ? styles.navItemActive : {}) }}
              onClick={() => navigate(item.path)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>← Log Out</button>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <button style={styles.backBtn} onClick={() => navigate("/hospital/requests")}>← Back to Requests</button>
            <h1 style={styles.pageTitle}>New Blood Request</h1>
            <p style={styles.pageSub}>Submit an emergency blood request. Matching donors will be notified by SMS.</p>
          </div>
        </div>

        <div style={styles.formCard}>
          {serverError && <div style={styles.alertError}>{serverError}</div>}

          <div style={styles.fieldGrid}>
            {/* Blood Type */}
            <div style={styles.field}>
              <label style={styles.label}>Blood Type <span style={styles.req}>*</span></label>
              <div style={styles.bloodTypePicker}>
                {BLOOD_TYPES.map((bt) => (
                  <button key={bt} type="button"
                    style={{ ...styles.btOption, ...(form.bloodTypeCode === bt ? styles.btOptionActive : {}) }}
                    onClick={() => set("bloodTypeCode", bt)}>
                    {bt}
                  </button>
                ))}
              </div>
              {errors.bloodTypeCode && <span style={styles.errorMsg}>⚠ {errors.bloodTypeCode}</span>}
            </div>

            {/* Units Needed */}
            <div style={styles.field}>
              <label style={styles.label}>Units Needed <span style={styles.req}>*</span></label>
              <input type="number" min="1" value={form.unitsNeeded}
                onChange={(e) => set("unitsNeeded", e.target.value)}
                onBlur={() => validate("unitsNeeded")}
                placeholder="e.g. 2"
                style={{ ...styles.input, borderColor: errors.unitsNeeded ? "#C0392B" : "#DDD5D0" }} />
              {errors.unitsNeeded && <span style={styles.errorMsg}>⚠ {errors.unitsNeeded}</span>}
            </div>

            {/* Urgency Level */}
            <div style={styles.field}>
              <label style={styles.label}>Urgency Level <span style={styles.req}>*</span></label>
              <div style={styles.urgencyPicker}>
                {URGENCY_LEVELS.map((level) => (
                  <button key={level} type="button"
                    style={{
                      ...styles.urgencyOption,
                      ...(form.urgencyLevel === level ? {
                        background: urgencyColor[level],
                        color: "#fff",
                        borderColor: urgencyColor[level],
                      } : {}),
                    }}
                    onClick={() => set("urgencyLevel", level)}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              {errors.urgencyLevel && <span style={styles.errorMsg}>⚠ {errors.urgencyLevel}</span>}
            </div>

            {/* Needed By */}
            <div style={styles.field}>
              <label style={styles.label}>Needed By <span style={styles.req}>*</span></label>
              <input type="datetime-local" value={form.neededBy}
                onChange={(e) => set("neededBy", e.target.value)}
                onBlur={() => validate("neededBy")}
                style={{ ...styles.input, borderColor: errors.neededBy ? "#C0392B" : "#DDD5D0" }} />
              {errors.neededBy && <span style={styles.errorMsg}>⚠ {errors.neededBy}</span>}
            </div>
          </div>

          {/* Preview */}
          {form.bloodTypeCode && form.unitsNeeded && form.urgencyLevel && (
            <div style={styles.preview}>
              <div style={styles.previewTitle}>Request Preview</div>
              <div style={styles.previewContent}>
                <span>🩸 <strong>{form.bloodTypeCode}</strong></span>
                <span>· {form.unitsNeeded} unit{form.unitsNeeded !== "1" ? "s" : ""}</span>
                <span style={{ color: urgencyColor[form.urgencyLevel], fontWeight: 600 }}>· {form.urgencyLevel} urgency</span>
                {form.neededBy && <span>· by {new Date(form.neededBy).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })}</span>}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={() => navigate("/hospital/requests")}>Cancel</button>
            <button style={{ ...styles.submitBtn, ...(loading ? styles.submitDisabled : {}) }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? <><span style={styles.spinner} />&nbsp;Submitting…</> : "Submit Request →"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell:          { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EF" },
  sidebar:        { width: 220, background: "#1C1C1C", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 },
  sidebarLogo:    { display: "flex", alignItems: "center", gap: 8, padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoDrop:       { width: 28, height: 28, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:       { fontWeight: 800, fontSize: 16, color: "#fff" },
  logoRed:        { color: "#C0392B" },
  sidebarHospital:{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "12px 20px 4px", textTransform: "uppercase", letterSpacing: 0.5 },
  nav:            { flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px", gap: 4 },
  navItem:        { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer", borderRadius: 8, textAlign: "left" },
  navItemActive:  { background: "rgba(192,57,43,0.25)", color: "#fff", fontWeight: 600 },
  logoutBtn:      { background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", padding: "16px 20px", textAlign: "left" },
  main:           { flex: 1, padding: "32px 40px", overflowY: "auto" },
  topBar:         { marginBottom: 24 },
  backBtn:        { background: "none", border: "none", color: "#6B6B6B", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 8, display: "block" },
  pageTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  pageSub:        { fontSize: 14, color: "#6B6B6B" },
  formCard:       { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 16, padding: "32px", maxWidth: 640 },
  alertError:     { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", marginBottom: 20, fontSize: 13 },
  fieldGrid:      { display: "flex", flexDirection: "column", gap: 24 },
  field:          { display: "flex", flexDirection: "column", gap: 8 },
  label:          { fontSize: 13, fontWeight: 600, color: "#1C1C1C" },
  req:            { color: "#C0392B" },
  input:          { padding: "11px 14px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none" },
  errorMsg:       { fontSize: 12, color: "#C0392B" },
  bloodTypePicker:{ display: "flex", gap: 8, flexWrap: "wrap" },
  btOption:       { width: 52, height: 44, border: "2px solid #DDD5D0", borderRadius: 9, background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#1C1C1C" },
  btOptionActive: { background: "#C0392B", color: "#fff", borderColor: "#C0392B" },
  urgencyPicker:  { display: "flex", gap: 8 },
  urgencyOption:  { flex: 1, padding: "10px 0", border: "2px solid #DDD5D0", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C", textTransform: "capitalize" },
  preview:        { background: "#FDF6EE", border: "1px solid #DDD5D0", borderRadius: 10, padding: "14px 18px", marginTop: 24 },
  previewTitle:   { fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  previewContent: { display: "flex", gap: 10, flexWrap: "wrap", fontSize: 14, color: "#1C1C1C" },
  actions:        { display: "flex", gap: 12, marginTop: 28 },
  cancelBtn:      { padding: "12px 24px", background: "transparent", color: "#6B6B6B", border: "1px solid #DDD5D0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  submitBtn:      { flex: 1, padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  submitDisabled: { background: "#ccc", cursor: "not-allowed" },
  spinner:        { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" },
};