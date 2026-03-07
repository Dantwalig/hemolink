import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";

/* ── VALIDATORS ── */
const validators = {
  fullName(value) {
    if (!value.trim()) return "Full name is required.";
    if (value.trim().length < 3) return "Name must be at least 3 characters.";
    if (!/^[a-zA-Z\s'\-]+$/.test(value)) return "Name can only contain letters, spaces, hyphens, or apostrophes.";
    return "";
  },
  phone(value) {
    if (!value.trim()) return "Phone number is required.";
    const cleaned = value.replace(/[\s\-]/g, "");
    if (!/^(\+?250|0)[7][2389]\d{7}$/.test(cleaned)) return "Enter a valid Rwanda phone number (e.g. 0788123456).";
    return "";
  },
  email(value) {
    if (!value.trim()) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return "";
  },
  bloodType(value) {
    if (!value) return "Please select your blood type.";
    return "";
  },
  password(value) {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "Include at least one number.";
    return "";
  },
  confirmPassword(value, original) {
    if (!value) return "Please confirm your password.";
    if (value !== original) return "Passwords do not match.";
    return "";
  },
  consent(checked) {
    if (!checked) return "You must agree to receive SMS alerts to register.";
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
          {showPw ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
}

function SelectField({ icon, value, onChange, onBlur, error, children }) {
  const borderColor = error ? "#C0392B" : value ? "#1E8449" : "#DDD5D0";
  const bg          = error ? "#fff8f8" : "#fff";
  return (
    <div style={styles.inputWrap}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <select value={value} onChange={onChange} onBlur={onBlur}
        style={{ ...styles.input, borderColor, background: bg, paddingLeft: icon ? 38 : 14, appearance: "none" }}>
        {children}
      </select>
    </div>
  );
}

export default function DonorRegisterPage() {
  const navigate = useNavigate();

  const [step,        setStep]        = useState(1);
  const [done,        setDone]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", bloodType: "",
    password: "", confirmPassword: "", available: true, consentSms: false,
  });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) {
      let err = "";
      if (field === "confirmPassword") err = validators.confirmPassword(val, form.password);
      else err = validators[field]?.(val) ?? "";
      setErrors((e) => ({ ...e, [field]: err }));
    }
  };

  const touch = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    let err = "";
    if (field === "confirmPassword") err = validators.confirmPassword(form[field], form.password);
    else err = validators[field]?.(form[field]) ?? "";
    setErrors((e) => ({ ...e, [field]: err }));
  };

  const validateStep1 = () => {
    const fields = ["fullName", "phone", "email", "bloodType"];
    const errs   = Object.fromEntries(fields.map((f) => [f, validators[f]?.(form[f]) ?? ""]));
    setErrors((e) => ({ ...e, ...errs }));
    setTouched((t) => ({ ...t, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    return !Object.values(errs).some(Boolean);
  };

  const validateStep2 = () => {
    const errs = {
      password:        validators.password(form.password),
      confirmPassword: validators.confirmPassword(form.confirmPassword, form.password),
      consentSms:      validators.consent(form.consentSms),
    };
    setErrors((e) => ({ ...e, ...errs }));
    setTouched((t) => ({ ...t, password: true, confirmPassword: true, consentSms: true }));
    return !Object.values(errs).some(Boolean);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setServerError("");
    try {
      // api.js handles baseURL ('/api') automatically
      await api.post("/donors/register", {
        full_name:           form.fullName,
        phone:               form.phone,
        email:               form.email,
        blood_type_code:     form.bloodType,
        password:            form.password,
        availability_status: form.available ? "Available" : "Unavailable",
        consent_sms:         form.consentSms,
      });
      setDone(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ ...styles.page, alignItems: "center", justifyContent: "center", background: "#FDF6EE" }}>
      <div style={styles.successBox}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h2 style={styles.successTitle}>You're registered!</h2>
        <p style={styles.successDesc}>
          Welcome, <strong>{form.fullName.split(" ")[0]}</strong>! Your <strong>{form.bloodType}</strong> blood
          type is saved. You'll receive SMS alerts at <strong>{form.phone}</strong> when a nearby hospital needs you.
        </p>
        <button style={styles.btnPrimary} onClick={() => navigate("/login")}>Go to Login →</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <h1 style={styles.leftTitle}>Join the <em style={styles.leftEm}>network</em> that saves lives.</h1>
          <p style={styles.leftDesc}>
            Register as a voluntary blood donor. When an emergency happens near you,
            HemoLink will text you directly — no waiting, no guessing, just action.
          </p>
          <div style={styles.infoList}>
            {[
              { icon: "🩸", text: "All 8 blood types accepted" },
              { icon: "📱", text: "SMS alerts — no app needed" },
              { icon: "📍", text: "Matched by proximity to hospital" },
              { icon: "🔒", text: "Your data is private & secure" },
            ].map((item) => (
              <div key={item.text} style={styles.infoItem}>
                <span style={styles.infoIcon}>{item.icon}</span>
                <span style={styles.infoText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.logoRow}>
            <div style={styles.logoDropSm}><span style={styles.logoDropSmText}>H</span></div>
            <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
          </div>

          <h2 style={styles.formTitle}>Create donor account</h2>
          <p style={styles.formSub}>Join Rwanda's emergency blood donor network.</p>

          {/* Progress bar */}
          <div style={styles.progressBar}>
            <div style={styles.progressStep}>
              <div style={{ ...styles.stepCircle, ...(step > 1 ? styles.stepDone : styles.stepActive) }}>
                {step > 1 ? "✓" : "1"}
              </div>
              <span style={{ ...styles.stepLabel, ...(step === 1 ? styles.stepLabelActive : {}) }}>Personal Info</span>
            </div>
            <div style={{ ...styles.stepLine, ...(step > 1 ? styles.stepLineDone : {}) }} />
            <div style={styles.progressStep}>
              <div style={{ ...styles.stepCircle, ...(step === 2 ? styles.stepActive : {}) }}>2</div>
              <span style={{ ...styles.stepLabel, ...(step === 2 ? styles.stepLabelActive : {}) }}>Security</span>
            </div>
          </div>

          {serverError && <div style={{ ...styles.alert, ...styles.alertError }}>❌ {serverError}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={styles.fieldRow}>
                <Field label="Full Name" required error={touched.fullName && errors.fullName}>
                  <InputField icon="👤" value={form.fullName} placeholder="Jean Claude Niyomugabo"
                    onChange={(e) => set("fullName", e.target.value)} onBlur={() => touch("fullName")}
                    error={touched.fullName && errors.fullName} autoComplete="name" />
                </Field>
                <Field label="Phone Number" required error={touched.phone && errors.phone} helper="e.g. 0788123456">
                  <InputField icon="📞" value={form.phone} placeholder="0788 123 456"
                    onChange={(e) => set("phone", e.target.value)} onBlur={() => touch("phone")}
                    error={touched.phone && errors.phone} autoComplete="tel" />
                </Field>
              </div>
              <div style={styles.fieldRow}>
                <Field label="Email Address" error={touched.email && errors.email} helper="Optional — for account recovery">
                  <InputField icon="✉️" type="email" value={form.email} placeholder="jean@example.com"
                    onChange={(e) => set("email", e.target.value)} onBlur={() => touch("email")}
                    error={touched.email && errors.email} autoComplete="email" />
                </Field>
                <Field label="Blood Type" required error={touched.bloodType && errors.bloodType}>
                  <SelectField icon="🩸" value={form.bloodType}
                    onChange={(e) => set("bloodType", e.target.value)} onBlur={() => touch("bloodType")}
                    error={touched.bloodType && errors.bloodType}>
                    <option value="">Select blood type</option>
                    {bloodTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </SelectField>
                </Field>
              </div>

              <div style={styles.availRow}>
                <div>
                  <div style={styles.availLabel}>Currently available to donate?</div>
                  <div style={styles.availSub}>You can update this anytime from your profile.</div>
                </div>
                <label style={styles.toggleSwitch}>
                  <input type="checkbox" checked={form.available}
                    onChange={(e) => set("available", e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ ...styles.toggleSlider, background: form.available ? "#1E8449" : "#DDD5D0" }}>
                    <span style={{ ...styles.toggleThumb, transform: form.available ? "translateX(20px)" : "translateX(0)" }} />
                  </span>
                </label>
              </div>

              <button style={styles.btnPrimary} onClick={() => { if (validateStep1()) setStep(2); }}>
                Continue →
              </button>
              <p style={styles.switchLink}>Already have an account? <button style={styles.linkBtn} onClick={() => navigate("/login")}>Log in here</button></p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <Field label="Password" required error={touched.password && errors.password}
                helper={!errors.password ? "Min 8 chars · 1 uppercase · 1 number" : ""}>
                <InputField icon="🔒" type="password" value={form.password} placeholder="Create a strong password"
                  onChange={(e) => set("password", e.target.value)} onBlur={() => touch("password")}
                  error={touched.password && errors.password} autoComplete="new-password" />
              </Field>

              <Field label="Confirm Password" required error={touched.confirmPassword && errors.confirmPassword}>
                <InputField icon="🔒" type="password" value={form.confirmPassword} placeholder="Re-enter your password"
                  onChange={(e) => set("confirmPassword", e.target.value)} onBlur={() => touch("confirmPassword")}
                  error={touched.confirmPassword && errors.confirmPassword} autoComplete="new-password" />
              </Field>

              <div style={styles.consentRow}>
                <input type="checkbox" id="consent" checked={form.consentSms}
                  onChange={(e) => { set("consentSms", e.target.checked); touch("consentSms"); }}
                  style={{ accentColor: "#C0392B", width: 16, height: 16, flexShrink: 0, marginTop: 3, cursor: "pointer" }} />
                <label htmlFor="consent" style={styles.consentLabel}>
                  I agree to receive <strong>SMS alerts</strong> when a hospital near me needs blood that matches my type. I can opt out at any time.
                </label>
              </div>
              {touched.consentSms && errors.consentSms && (
                <span style={{ ...styles.errorMsg, display: "block", marginTop: -10, marginBottom: 14 }}>⚠ {errors.consentSms}</span>
              )}

              <div style={styles.btnRow}>
                <button style={styles.btnOutline} onClick={() => setStep(1)}>← Back</button>
                <button style={{ ...styles.btnPrimary, flex: 1, ...(loading ? styles.btnDisabled : {}) }}
                  onClick={handleRegister} disabled={loading}>
                  {loading ? <><span style={styles.spinner} />&nbsp;Registering…</> : "Register as Donor ✓"}
                </button>
              </div>
              <p style={styles.switchLink}>Already have an account? <button style={styles.linkBtn} onClick={() => navigate("/login")}>Log in here</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  leftPanel:      { flex: 1, background: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" },
  leftInner:      { maxWidth: 420 },
  logoDrop:       { width: 48, height: 48, background: "rgba(255,255,255,0.2)", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 18 },
  leftTitle:      { fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 },
  leftEm:         { fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.75)" },
  leftDesc:       { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: 36 },
  infoList:       { display: "flex", flexDirection: "column", gap: 14 },
  infoItem:       { display: "flex", alignItems: "center", gap: 12 },
  infoIcon:       { width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  infoText:       { fontSize: 14, color: "rgba(255,255,255,0.85)" },
  rightPanel:     { flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", overflowY: "auto" },
  formBox:        { width: "100%", maxWidth: 480 },
  logoRow:        { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoDropSm:     { width: 30, height: 30, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropSmText: { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 11 },
  logoText:       { fontWeight: 800, fontSize: 17, letterSpacing: -0.3 },
  logoRed:        { color: "#C0392B" },
  formTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 5 },
  formSub:        { fontSize: 14, color: "#6B6B6B", marginBottom: 24, lineHeight: 1.5 },
  progressBar:    { display: "flex", alignItems: "center", marginBottom: 28 },
  progressStep:   { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
  stepCircle:     { width: 30, height: 30, borderRadius: "50%", border: "2px solid #DDD5D0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#6B6B6B" },
  stepActive:     { background: "#C0392B", borderColor: "#C0392B", color: "#fff" },
  stepDone:       { background: "#1E8449", borderColor: "#1E8449", color: "#fff" },
  stepLine:       { flex: 1, height: 2, background: "#DDD5D0", margin: "0 8px", marginBottom: 18 },
  stepLineDone:   { background: "#1E8449" },
  stepLabel:      { fontSize: 10, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" },
  stepLabelActive:{ color: "#C0392B", fontWeight: 600 },
  fieldRow:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  field:          { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  label:          { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  required:       { color: "#C0392B" },
  errorMsg:       { fontSize: 12, color: "#C0392B" },
  helperMsg:      { fontSize: 12, color: "#6B6B6B" },
  inputWrap:      { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:      { position: "absolute", left: 13, fontSize: 15, pointerEvents: "none", zIndex: 1 },
  input:          { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #DDD5D0", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s" },
  togglePw:       { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 },
  availRow:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#F0E8DF", borderRadius: 10, marginBottom: 16 },
  availLabel:     { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  availSub:       { fontSize: 11, color: "#6B6B6B", marginTop: 2 },
  toggleSwitch:   { position: "relative", display: "inline-block", width: 44, height: 24, flexShrink: 0 },
  toggleSlider:   { position: "absolute", inset: 0, borderRadius: 24, cursor: "pointer", transition: "background 0.25s", display: "flex", alignItems: "center" },
  toggleThumb:    { width: 18, height: 18, background: "#fff", borderRadius: "50%", marginLeft: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.25s" },
  consentRow:     { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  consentLabel:   { fontSize: 13, color: "#6B6B6B", lineHeight: 1.55, cursor: "pointer" },
  alert:          { padding: "12px 16px", borderRadius: 9, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 },
  alertError:     { background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A" },
  btnPrimary:     { width: "100%", padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  btnOutline:     { padding: "13px 24px", background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  btnDisabled:    { background: "#ccc", cursor: "not-allowed" },
  btnRow:         { display: "flex", gap: 12 },
  spinner:        { width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  switchLink:     { textAlign: "center", fontSize: 13, color: "#6B6B6B", marginTop: 18 },
  linkBtn:        { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  successBox:     { textAlign: "center", padding: "60px 40px", maxWidth: 480 },
  successTitle:   { fontSize: 28, fontWeight: 800, color: "#1C1C1C", marginBottom: 12 },
  successDesc:    { fontSize: 15, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 },
};