import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { IconEmail, IconLock, IconEye, IconEyeOff, IconAlert, IconShield, IconCheck } from "../utils/Icons.jsx";

const validators = {
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
      {error  && <span style={styles.errorMsg}><IconAlert size={12} /> {error}</span>}
      {!error && helper && <span style={styles.helperMsg}>{helper}</span>}
    </div>
  );
}

function InputField({ icon: Icon, type = "text", value, onChange, onBlur, error, placeholder, autoComplete }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword   = type === "password";
  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;
  const borderColor  = error ? "#C0392B" : value ? "#1E8449" : "#DDD5D0";
  const bg           = error ? "#fff8f8" : "#fff";
  return (
    <div style={styles.inputWrap}>
      {Icon && <span style={styles.inputIcon}><Icon size={15} color="#9B9B9B" /></span>}
      <input
        type={resolvedType} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{ ...styles.input, borderColor, background: bg, paddingLeft: Icon ? 38 : 14 }}
      />
      {isPassword && (
        <button type="button" style={styles.togglePw} onClick={() => setShowPw(s => !s)}>
          {showPw ? <IconEyeOff size={15} color="#9B9B9B" /> : <IconEye size={15} color="#9B9B9B" />}
        </button>
      )}
    </div>
  );
}

export default function HospitalLoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (touched[field]) setErrors(e => ({ ...e, [field]: validators[field]?.(val) ?? "" }));
  };
  const touch = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validators[field]?.(form[field]) ?? "" }));
  };
  const validateAll = () => {
    const errs = { email: validators.email(form.email), password: validators.password(form.password) };
    setErrors(errs);
    setTouched({ email: true, password: true });
    return !Object.values(errs).some(Boolean);
  };

  const handleLogin = async () => {
    if (!validateAll()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await api.post("/hospitals/login", { email: form.email, password: form.password });
      const { hospital, token } = res.data.data;
      login({ ...hospital, role: "hospital" }, token);
      navigate("/hospital/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Left — full bleed hospital photo */}
      <div style={styles.leftPanel}>
        <div style={styles.overlay} />
        <div style={styles.leftInner}>
          <button style={styles.backLink} onClick={() => navigate("/")}>
            &larr; Back to Home
          </button>
          <div style={styles.logoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoTextWhite}>Hemo<span style={styles.logoAccent}>Link</span> Rwanda</span>
          </div>
          <h1 style={styles.leftTitle}>Hospital<br /><em style={styles.leftEm}>Staff Portal</em></h1>
          <p style={styles.leftDesc}>
            Access your dashboard to submit emergency blood requests,
            track donor responses, and manage your blood inventory in real time.
          </p>
          <div style={styles.featureList}>
            {[
              "Submit urgent blood requests",
              "Match donors by proximity & blood type",
              "Monitor inventory levels",
              "Track donor responses live",
            ].map(text => (
              <div key={text} style={styles.featureItem}>
                <span style={styles.featureIcon}><IconCheck size={12} color="#fff" /></span>
                <span style={styles.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formLogoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
          </div>

          <h2 style={styles.formTitle}>Hospital Login</h2>
          <p style={styles.formSub}>Sign in with your hospital email to access the dashboard.</p>

          {serverError && (
            <div style={styles.alertError}>
              <IconAlert size={14} /> {serverError}
            </div>
          )}

          <Field label="Hospital Email" required error={touched.email && errors.email}>
            <InputField icon={IconEmail} type="email" value={form.email}
              placeholder="admin@hospital.rw"
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
            {loading ? "Signing in…" : "Access Hospital Dashboard"}
          </button>

          <div style={styles.accessNote}>
            <IconShield size={14} color="#9B6B4B" />
            <span>
              Don't have an account?{" "}
              <button style={styles.inlineBtn} onClick={() => navigate("/hospital/register")}>
                Register your hospital
              </button>
              {" "}— admin approval required.
            </span>
          </div>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} />
            <span style={styles.dividerText}>not a hospital?</span>
            <hr style={styles.dividerLine} />
          </div>

          <p style={styles.switchLink}>
            <button style={styles.linkBtn} onClick={() => navigate("/login")}>Donor Login</button>
            &nbsp;&middot;&nbsp;
            <button style={styles.linkBtn} onClick={() => navigate("/register")}>Register as Donor</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
  leftPanel:     {
    flex: 1, position: "sticky", top: 0, height: "100vh", overflow: "hidden",
    backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80')",
    backgroundSize: "cover", backgroundPosition: "center",
  },
  overlay:       { position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(14,14,14,0.90) 0%, rgba(140,30,20,0.60) 100%)" },
  leftInner:     { position: "relative", zIndex: 1, padding: "60px 48px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 460 },
  backLink:      { background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 13, cursor: "pointer", marginBottom: 40, display: "block", padding: 0, textAlign: "left" },
  logoRow:       { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoDrop:      { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoDropText:  { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoTextWhite: { fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -0.3 },
  logoAccent:    { color: "#E87B6E" },
  leftTitle:     { fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 },
  leftEm:        { fontStyle: "italic", fontWeight: 400, color: "#E87B6E" },
  leftDesc:      { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: 32 },
  featureList:   { display: "flex", flexDirection: "column", gap: 12 },
  featureItem:   { display: "flex", alignItems: "center", gap: 12 },
  featureIcon:   { width: 24, height: 24, background: "rgba(255,255,255,0.12)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureText:   { fontSize: 13.5, color: "rgba(255,255,255,0.85)" },
  rightPanel:    { flex: 1, background: "#fff", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" },
  formBox:       { width: "100%", maxWidth: 420 },
  formLogoRow:   { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoText:      { fontWeight: 800, fontSize: 17, letterSpacing: -0.3, color: "#1C1C1C" },
  logoRed:       { color: "#C0392B" },
  formTitle:     { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  formSub:       { fontSize: 14, color: "#6B6B6B", marginBottom: 28, lineHeight: 1.5 },
  field:         { display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 },
  label:         { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  required:      { color: "#C0392B" },
  errorMsg:      { fontSize: 12, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 },
  helperMsg:     { fontSize: 12, color: "#6B6B6B" },
  inputWrap:     { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:     { position: "absolute", left: 13, pointerEvents: "none", zIndex: 1, display: "flex" },
  input:         { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  togglePw:      { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" },
  alertError:    { display: "flex", alignItems: "center", gap: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", fontSize: 13.5, marginBottom: 20 },
  submitBtn:     { width: "100%", padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  submitDisabled:{ background: "#ccc", cursor: "not-allowed" },
  accessNote:    { display: "flex", alignItems: "flex-start", gap: 8, background: "#F5EDE4", borderRadius: 9, padding: "10px 14px", marginTop: 14, fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.6 },
  inlineBtn:     { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 12.5, padding: 0 },
  divider:       { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine:   { flex: 1, border: "none", borderTop: "1px solid #DDD5D0" },
  dividerText:   { fontSize: 12, color: "#6B6B6B", whiteSpace: "nowrap" },
  switchLink:    { textAlign: "center", fontSize: 13, color: "#6B6B6B" },
  linkBtn:       { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};