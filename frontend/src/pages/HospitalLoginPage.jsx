import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";

/* Validators */
const validators = {
  hospitalId(value) {
    if (!value.trim()) return "Hospital ID is required.";
    if (value.trim().length < 3) return "Enter a valid Hospital ID.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return "";
  },
  password(value) {
    if (!value) return "Password is required.";
    return "";
  },
};

function Field({ label, required, error, helper, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}{required && <span style={styles.required}> *</span>}</label>
      {children}
      {error && <span style={styles.errorMsg}>⚠ {error}</span>}
      {!error && helper && <span style={styles.helperMsg}>{helper}</span>}
    </div>
  );
}

function InputField({ icon, type = "text", value, onChange, onBlur, error, placeholder, autoComplete }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword   = type === "password";
  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;
  const borderColor  = error ? "#C0392B" : value ? "#1E8449" : "#DDD5D0";
  const bg           = error ? "#fff8f8" : "#fff";
  return (
    <div style={styles.inputWrap}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <input type={resolvedType} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{ ...styles.input, borderColor, background: bg, paddingLeft: icon ? 38 : 14 }}
      />
      {isPassword && (
        <button type="button" style={styles.togglePw} onClick={() => setShowPw((s) => !s)}>
          {showPw ? "" : ""}
        </button>
      )}
    </div>
  );
}

export default function HospitalLoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,        setForm]        = useState({ hospitalId: "", email: "", password: "" });
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) {
      const err = validators[field]?.(val) ?? "";
      setErrors((e) => ({ ...e, [field]: err }));
    }
  };

  const touch = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const err = validators[field]?.(form[field]) ?? "";
    setErrors((e) => ({ ...e, [field]: err }));
  };

  const validateAll = () => {
    const errs = {
      hospitalId: validators.hospitalId(form.hospitalId),
      email:      validators.email(form.email),
      password:   validators.password(form.password),
    };
    setErrors(errs);
    setTouched({ hospitalId: true, email: true, password: true });
    return !Object.values(errs).some(Boolean);
  };

  const handleLogin = async () => {
    if (!validateAll()) return;
    setLoading(true);
    setServerError("");
    try {
      // api.js handles baseURL ('/api') and JWT header automatically
      const res = await api.post("/auth/hospital-login", {
        hospital_id: form.hospitalId,
        email:       form.email,
        password:    form.password,
      });
      // AuthContext saves token + user to localStorage
      login(res.data.user, res.data.token);
      navigate("/hospital/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <button style={styles.backLink} onClick={() => navigate("/")}>← Back to Home</button>
          <div style={{ fontSize: 52, marginBottom: 20 }}></div>
          <h1 style={styles.leftTitle}>Hospital <em style={styles.leftEm}>Staff Portal</em></h1>
          <p style={styles.leftDesc}>
            Access your hospital dashboard to submit emergency blood requests,
            track donor responses, and manage your blood inventory in real time.
          </p>
          <div style={styles.featureList}>
            {[
              { icon: ">", text: "Submit urgent blood requests" },
              { icon: ">", text: "Match donors by proximity & blood type" },
              { icon: ">", text: "Monitor inventory levels" },
              { icon: ">", text: "Track donor SMS responses live" },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.logoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
          </div>

          <h2 style={styles.formTitle}>Hospital Login</h2>
          <p style={styles.formSub}>Sign in with your hospital credentials to access the dashboard.</p>

          {serverError && <div style={{ ...styles.alert, ...styles.alertError }}>❌ {serverError}</div>}

          <Field label="Hospital ID" required error={touched.hospitalId && errors.hospitalId}
            helper="Assigned by Rwanda Biomedical Centre">
            <InputField icon="" value={form.hospitalId} placeholder="e.g. CHUK-001"
              onChange={(e) => set("hospitalId", e.target.value)} onBlur={() => touch("hospitalId")}
              error={touched.hospitalId && errors.hospitalId} autoComplete="organization" />
          </Field>

          <Field label="Staff Email" required error={touched.email && errors.email}>
            <InputField icon="" type="email" value={form.email} placeholder="staff@hospital.rw"
              onChange={(e) => set("email", e.target.value)} onBlur={() => touch("email")}
              error={touched.email && errors.email} autoComplete="email" />
          </Field>

          <Field label="Password" required error={touched.password && errors.password}>
            <InputField icon="" type="password" value={form.password} placeholder="Your password"
              onChange={(e) => set("password", e.target.value)} onBlur={() => touch("password")}
              error={touched.password && errors.password} autoComplete="current-password" />
          </Field>

          <button style={{ ...styles.submitBtn, ...(loading ? styles.submitDisabled : {}) }}
            onClick={handleLogin} disabled={loading}>
            {loading ? <><span style={styles.spinner} />&nbsp;Signing in…</> : "Access Hospital Dashboard →"}
          </button>

          <div style={styles.accessNote}>
            <span></span>
            <span>Don't have credentials? <a href="mailto:hemolink@rbc.gov.rw" style={styles.accessLink}>Contact RBC to request access</a></span>
          </div>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} /><span style={styles.dividerText}>not a hospital?</span><hr style={styles.dividerLine} />
          </div>

          <p style={styles.switchLink}>
            <button style={styles.linkBtn} onClick={() => navigate("/login")}>← Donor Login</button>
            &nbsp;·&nbsp;
            <button style={styles.linkBtn} onClick={() => navigate("/register")}>Register as Donor</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  leftPanel:    { flex: 1, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" },
  leftInner:    { maxWidth: 420, width: "100%" },
  backLink:     { background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", marginBottom: 32, display: "block", padding: 0 },
  leftTitle:    { fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 },
  leftEm:       { fontStyle: "italic", fontWeight: 400, color: "#C0392B" },
  leftDesc:     { fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: 36 },
  featureList:  { display: "flex", flexDirection: "column", gap: 14 },
  featureItem:  { display: "flex", alignItems: "center", gap: 12 },
  featureIcon:  { width: 36, height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  featureText:  { fontSize: 14, color: "rgba(255,255,255,0.82)" },
  rightPanel:   { flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" },
  formBox:      { width: "100%", maxWidth: 420 },
  logoRow:      { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoDrop:     { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoText:     { fontWeight: 800, fontSize: 17, letterSpacing: -0.3 },
  logoRed:      { color: "#C0392B" },
  formTitle:    { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  formSub:      { fontSize: 14, color: "#6B6B6B", marginBottom: 28, lineHeight: 1.5 },
  field:        { display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 },
  label:        { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  required:     { color: "#C0392B" },
  errorMsg:     { fontSize: 12, color: "#C0392B" },
  helperMsg:    { fontSize: 12, color: "#6B6B6B" },
  inputWrap:    { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:    { position: "absolute", left: 13, fontSize: 15, pointerEvents: "none", zIndex: 1 },
  input:        { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s" },
  togglePw:     { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 },
  alert:        { padding: "12px 16px", borderRadius: 9, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 },
  alertError:   { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A" },
  submitBtn:    { width: "100%", padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  submitDisabled: { background: "#ccc", cursor: "not-allowed" },
  spinner:      { width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  accessNote:   { display: "flex", alignItems: "flex-start", gap: 8, background: "#F0E8DF", borderRadius: 9, padding: "10px 14px", marginTop: 14, fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.5 },
  accessLink:   { color: "#C0392B", fontWeight: 600 },
  divider:      { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine:  { flex: 1, border: "none", borderTop: "1px solid #DDD5D0" },
  dividerText:  { fontSize: 12, color: "#6B6B6B", whiteSpace: "nowrap" },
  switchLink:   { textAlign: "center", fontSize: 13, color: "#6B6B6B" },
  linkBtn:      { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};