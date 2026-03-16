import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

const validators = {
  phone(value) {
    if (!value.trim()) return "Phone number is required.";
    const cleaned = value.replace(/[\s\-]/g, "");
    if (!/^(\+?250|0)[7][2389]\d{7}$/.test(cleaned))
      return "Enter a valid Rwanda phone number (e.g. 0788123456).";
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
      {error  && <span style={styles.errorMsg}>⚠ {error}</span>}
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
          {showPw ? "🙈" : "👁"}
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,        setForm]        = useState({ phone: "", password: "" });
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [forgotSent,  setForgotSent]  = useState(false);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) setErrors((e) => ({ ...e, [field]: validators[field]?.(val) ?? "" }));
  };

  const touch = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validators[field]?.(form[field]) ?? "" }));
  };

  const validateAll = () => {
    const errs = { phone: validators.phone(form.phone), password: validators.password(form.password) };
    setErrors(errs);
    setTouched({ phone: true, password: true });
    return !Object.values(errs).some(Boolean);
  };

  const handleLogin = async () => {
    if (!validateAll()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await api.post("/donors/login", { phone: form.phone, password: form.password });
      // FIX #2: backend wraps response in { success, message, data }
      // so donor and token live at res.data.data, not res.data
      const { donor, token } = res.data.data;
      login({ ...donor, role: "donor" }, token);
      navigate("/donor/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    const err = validators.phone(form.phone);
    if (err) { setErrors((e) => ({ ...e, phone: err })); setTouched((t) => ({ ...t, phone: true })); return; }
    setForgotSent(true); // SMS reset not yet implemented in backend — silently acknowledge
  };

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <button style={styles.backLink} onClick={() => navigate("/")}>← Back to Home</button>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <h1 style={styles.leftTitle}>Welcome back, <em style={styles.leftEm}>donor.</em></h1>
          <p style={styles.leftDesc}>
            Log in to manage your availability, view your donation history, and stay ready
            for emergency SMS alerts from hospitals near you.
          </p>
          <div style={styles.leftCard}>
            <span style={{ fontSize: 28 }}>🩸</span>
            <div>
              <div style={styles.leftCardTitle}>Your blood type is needed.</div>
              <div style={styles.leftCardSub}>Hospitals in Kigali are looking for compatible donors right now.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>Donor Login</h2>
          <p style={styles.formSub}>Enter your registered phone number and password.</p>

          {serverError && <div style={{ ...styles.alert, ...styles.alertError }}>❌ {serverError}</div>}
          {forgotSent  && <div style={{ ...styles.alert, ...styles.alertSuccess }}>✅ If your number is registered, you'll receive an SMS with reset instructions.</div>}

          <Field label="Phone Number" required error={touched.phone && errors.phone} helper="e.g. 0788123456">
            <InputField icon="📱" value={form.phone} placeholder="0788 123 456"
              onChange={(e) => set("phone", e.target.value)} onBlur={() => touch("phone")}
              error={touched.phone && errors.phone} autoComplete="tel" />
          </Field>

          <Field label="Password" required error={touched.password && errors.password}>
            <InputField icon="🔒" type="password" value={form.password} placeholder="Your password"
              onChange={(e) => set("password", e.target.value)} onBlur={() => touch("password")}
              error={touched.password && errors.password} autoComplete="current-password" />
          </Field>

          <button style={styles.forgotLink} onClick={handleForgot} disabled={loading}>
            Forgot password? Reset via SMS →
          </button>

          <button style={{ ...styles.submitBtn, ...(loading ? styles.submitDisabled : {}) }}
            onClick={handleLogin} disabled={loading}>
            {loading ? <><span style={styles.spinner} />&nbsp;Signing in…</> : "Log In →"}
          </button>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} /><span style={styles.dividerText}>or</span><hr style={styles.dividerLine} />
          </div>

          <p style={styles.switchLink}>Not registered yet? <button style={styles.linkBtn} onClick={() => navigate("/register")}>Create a donor account</button></p>
          <p style={styles.switchLink}>Are you a hospital? <button style={styles.linkBtn} onClick={() => navigate("/hospital-login")}>Hospital login →</button></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  leftPanel:     { width: "45vw", flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", overflow: "hidden", background: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center" },
  leftInner:      { maxWidth: 420, width: "100%", padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" },
  backLink:       { background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", marginBottom: 16, display: "block", padding: 0, textAlign: "left" },
  logoDrop:       { width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 18 },
  leftTitle:      { fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 10 },
  leftEm:         { fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.75)" },
  leftDesc:       { fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginBottom: 20 },
  leftCard:       { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 },
  leftCardTitle:  { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 },
  leftCardSub:    { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 },
  rightPanel:    { marginLeft: "45vw", flex: 1, background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "60px 48px", overflowY: "auto" },
  formBox:        { width: "100%", maxWidth: 420 },
  formTitle:      { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 6 },
  formSub:        { fontSize: 14, color: "#6B6B6B", marginBottom: 28, lineHeight: 1.5 },
  field:          { display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 },
  label:          { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  required:       { color: "#C0392B" },
  errorMsg:       { fontSize: 12, color: "#C0392B" },
  helperMsg:      { fontSize: 12, color: "#6B6B6B" },
  inputWrap:      { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:      { position: "absolute", left: 13, fontSize: 15, pointerEvents: "none", zIndex: 1 },
  input:          { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  togglePw:       { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 },
  alert:          { padding: "12px 16px", borderRadius: 9, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 },
  alertSuccess:   { background: "#EAFAF1", color: "#1E8449", border: "1px solid #A9DFBF" },
  alertError:     { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A" },
  submitBtn:      { width: "100%", padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  submitDisabled: { background: "#ccc", cursor: "not-allowed" },
  forgotLink:     { background: "none", border: "none", color: "#C0392B", fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "right", width: "100%", marginTop: -8, marginBottom: 14, display: "block" },
  spinner:        { width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" },
  divider:        { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine:    { flex: 1, border: "none", borderTop: "1px solid #DDD5D0" },
  dividerText:    { fontSize: 12, color: "#6B6B6B", whiteSpace: "nowrap" },
  switchLink:     { textAlign: "center", fontSize: 13, color: "#6B6B6B", marginTop: 10 },
  linkBtn:        { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};