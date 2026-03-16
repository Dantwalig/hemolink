import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { IconEmail, IconLock, IconEye, IconEyeOff, IconAlert, IconShield } from "../utils/Icons.jsx";

const validators = {
  email(v) {
    if (!v.trim()) return "Email is required.";
    if (!v.endsWith("@rbc.gov.rw")) return "Admin accounts must use an @rbc.gov.rw email.";
    return "";
  },
  password(v) { return v ? "" : "Password is required."; },
};

function Field({ label, required, error, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}{required && <span style={styles.req}> *</span>}</label>
      {children}
      {error && <span style={styles.errorMsg}><IconAlert size={12} /> {error}</span>}
    </div>
  );
}

function InputField({ icon: Icon, type = "text", value, onChange, onBlur, error, placeholder, autoComplete }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword   = type === "password";
  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;
  const borderColor  = error ? "#C0392B" : value ? "#1E8449" : "#DDD5D0";
  return (
    <div style={styles.inputWrap}>
      {Icon && <span style={styles.inputIcon}><Icon size={14} color="#9B9B9B" /></span>}
      <input type={resolvedType} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{ ...styles.input, borderColor, paddingLeft: Icon ? 38 : 14 }} />
      {isPassword && (
        <button type="button" style={styles.togglePw} onClick={() => setShowPw(s => !s)}>
          {showPw ? <IconEyeOff size={14} color="#9B9B9B" /> : <IconEye size={14} color="#9B9B9B" />}
        </button>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (touched[f]) setErrors(e => ({ ...e, [f]: validators[f]?.(v) ?? "" }));
  };
  const touch = (f) => {
    setTouched(t => ({ ...t, [f]: true }));
    setErrors(e => ({ ...e, [f]: validators[f]?.(form[f]) ?? "" }));
  };
  const validateAll = () => {
    const errs = { email: validators.email(form.email), password: validators.password(form.password) };
    setErrors(errs); setTouched({ email: true, password: true });
    return !Object.values(errs).some(Boolean);
  };

  const handleLogin = async () => {
    if (!validateAll()) return;
    setLoading(true); setServerError("");
    try {
      const res = await api.post("/admin/login", { email: form.email, password: form.password });
      const { admin, token } = res.data.data;
      login({ ...admin, role: "admin" }, token);
      navigate("/admin/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>

        <div style={styles.leftInner}>
          <button style={styles.backLink} onClick={() => navigate("/")}>
            &larr; Back to Home
          </button>
          <div style={styles.logoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoTextWhite}>Hemo<span style={styles.logoAccent}>Link</span> Rwanda</span>
          </div>
          <h1 style={styles.leftTitle}>RBC Admin<br /><em style={styles.leftEm}>Control Panel</em></h1>
          <p style={styles.leftDesc}>
            Restricted access for Rwanda Biomedical Centre staff only.
            Manage hospital approvals, monitor donor activity, and oversee platform operations.
          </p>
          <div style={styles.restrictedBadge}>
            <IconShield size={14} color="#E87B6E" />
            <span>Restricted to @rbc.gov.rw accounts only</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formLogoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
          </div>
          <h2 style={styles.formTitle}>Admin Login</h2>
          <p style={styles.formSub}>Sign in with your RBC staff credentials.</p>

          {serverError && (
            <div style={styles.alertError}><IconAlert size={14} /> {serverError}</div>
          )}

          <Field label="RBC Email" required error={touched.email && errors.email}>
            <InputField icon={IconEmail} type="email" value={form.email}
              placeholder="yourname@rbc.gov.rw"
              onChange={e => set("email", e.target.value)} onBlur={() => touch("email")}
              error={touched.email && errors.email} autoComplete="email" />
          </Field>

          <Field label="Password" required error={touched.password && errors.password}>
            <InputField icon={IconLock} type="password" value={form.password}
              placeholder="Your password"
              onChange={e => set("password", e.target.value)} onBlur={() => touch("password")}
              error={touched.password && errors.password} autoComplete="current-password" />
          </Field>

          <button style={{ ...styles.submitBtn, ...(loading ? styles.submitDisabled : {}) }}
            onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Access Admin Panel"}
          </button>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} />
            <span style={styles.dividerText}>not RBC staff?</span>
            <hr style={styles.dividerLine} />
          </div>
          <p style={styles.switchLink}>
            <button style={styles.linkBtn} onClick={() => navigate("/hospital-login")}>Hospital Login</button>
            &nbsp;&middot;&nbsp;
            <button style={styles.linkBtn} onClick={() => navigate("/login")}>Donor Login</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  leftPanel:     { width: "45vw", flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", overflow: "hidden", background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center" },
  overlay:       {},
  leftInner:     { padding: "28px 40px", width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" },
  backLink:      { background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", marginBottom: 18, padding: 0, textAlign: "left" },
  logoRow:       { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoDrop:      { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoDropText:  { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoTextWhite: { fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -0.3 },
  logoAccent:    { color: "#E87B6E" },
  leftTitle:     { fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 10 },
  leftEm:        { fontStyle: "italic", fontWeight: 400, color: "#E87B6E" },
  leftDesc:      { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 16 },
  restrictedBadge: { display: "flex", alignItems: "center", gap: 8, background: "rgba(232,123,110,0.12)", border: "1px solid rgba(232,123,110,0.3)", borderRadius: 8, padding: "6px 10px", fontSize: 11.5, color: "rgba(255,255,255,0.7)" },
  rightPanel:    { marginLeft: "45vw", flex: 1, background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "60px 48px", overflowY: "auto" },
  formBox:       { width: "100%", maxWidth: 400 },
  formLogoRow:   { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoText:      { fontWeight: 800, fontSize: 17, letterSpacing: -0.3, color: "#1C1C1C" },
  logoRed:       { color: "#C0392B" },
  formTitle:     { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  formSub:       { fontSize: 14, color: "#6B6B6B", marginBottom: 28, lineHeight: 1.5 },
  field:         { display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 },
  label:         { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  req:           { color: "#C0392B" },
  errorMsg:      { fontSize: 12, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 },
  inputWrap:     { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:     { position: "absolute", left: 13, pointerEvents: "none", zIndex: 1, display: "flex" },
  input:         { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  togglePw:      { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" },
  alertError:    { display: "flex", alignItems: "center", gap: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", fontSize: 13.5, marginBottom: 20 },
  submitBtn:     { width: "100%", padding: 13, background: "#1C1C1C", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  submitDisabled:{ background: "#ccc", cursor: "not-allowed" },
  divider:       { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine:   { flex: 1, border: "none", borderTop: "1px solid #DDD5D0" },
  dividerText:   { fontSize: 12, color: "#6B6B6B", whiteSpace: "nowrap" },
  switchLink:    { textAlign: "center", fontSize: 13, color: "#6B6B6B" },
  linkBtn:       { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};