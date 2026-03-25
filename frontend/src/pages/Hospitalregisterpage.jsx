import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import LanguageSwitcher from "../utils/LanguageSwitcher.jsx";
import {
  IconEmail, IconLock, IconEye, IconEyeOff, IconAlert, IconCheck,
  IconPhone, IconBuilding, IconPin, IconSuccess,
} from "../utils/Icons.jsx";

const PROVINCES = [
  { code: "KIG", name: "Kigali" },
  { code: "NOR", name: "Northern" },
  { code: "SOU", name: "Southern" },
  { code: "EAS", name: "Eastern" },
  { code: "WES", name: "Western" },
];

const DISTRICTS = {
  KIG: ["GASABO", "KICUKIRO", "NYARUGENGE"],
  NOR: ["BURERA", "GAKENKE", "GICUMBI", "MUSANZE", "RULINDO"],
  SOU: ["GISAGARA", "HUYE", "KAMONYI", "MUHANGA", "NYAMAGABE", "NYANZA", "NYARUGURU", "RUHANGO"],
  EAS: ["BUGESERA", "GATSIBO", "KAYONZA", "KIREHE", "NGOMA", "NYAGATARE", "RWAMAGANA"],
  WES: ["KARONGI", "NGORORERO", "NYABIHU", "NYAMASHEKE", "RUBAVU", "RUTSIRO", "RUSIZI"],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  name(v)         { return v.trim().length < 3 ? "Hospital name must be at least 3 characters." : ""; },
  phone(v)        { const c = v.replace(/[\s\-]/g,""); return /^(\+?250|0)[7][2389]\d{7}$/.test(c) ? "" : "Enter a valid Rwanda phone number (e.g. 0788123456)."; },
  email(v)        { return EMAIL_REGEX.test(v) ? "" : "Enter a valid email address."; },
  password(v)     { return v.length < 6 ? "Password must be at least 6 characters." : ""; },
  confirmPassword(v, orig) { return v !== orig ? "Passwords do not match." : ""; },
  provinceCode(v) { return v ? "" : "Select a province."; },
  districtCode(v) { return v ? "" : "Select a district."; },
  sector(v)       { return v.trim() ? "" : "Sector is required."; },
  cell(v)         { return v.trim() ? "" : "Cell is required."; },
  village(v)      { return v.trim() ? "" : "Village is required."; },
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
      {Icon && <span style={styles.inputIcon}><Icon size={14} color="#9B9B9B" /></span>}
      <input type={resolvedType} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{ ...styles.input, borderColor, background: bg, paddingLeft: Icon ? 36 : 12 }} />
      {isPassword && (
        <button type="button" style={styles.togglePw} onClick={() => setShowPw(s => !s)}>
          {showPw ? <IconEyeOff size={14} color="#9B9B9B" /> : <IconEye size={14} color="#9B9B9B" />}
        </button>
      )}
    </div>
  );
}

function SelectField({ icon: Icon, value, onChange, onBlur, error, children, disabled }) {
  const borderColor = error ? "#C0392B" : value ? "#1E8449" : "#DDD5D0";
  const bg          = error ? "#fff8f8" : disabled ? "#F7F3EF" : "#fff";
  return (
    <div style={styles.inputWrap}>
      {Icon && <span style={styles.inputIcon}><Icon size={14} color="#9B9B9B" /></span>}
      <select value={value} onChange={onChange} onBlur={onBlur} disabled={disabled}
        style={{ ...styles.input, borderColor, background: bg, paddingLeft: Icon ? 36 : 12, appearance: "none", cursor: disabled ? "not-allowed" : "pointer" }}>
        {children}
      </select>
    </div>
  );
}

export default function HospitalRegisterPage() {
  const navigate = useNavigate();
  const [done,           setDone]           = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [serverError,    setServerError]    = useState("");
  const [errors,         setErrors]         = useState({});
  const [touched,        setTouched]        = useState({});
  const [locationStatus, setLocationStatus] = useState("idle");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
    provinceCode: "", districtCode: "", sector: "", cell: "", village: "",
    latitude: null, longitude: null,
  });

  const getLocation = () => {
    if (!navigator.geolocation) { setLocationStatus("denied"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocationStatus("granted");
        setErrors((e) => ({ ...e, location: "" }));
      },
      () => setLocationStatus("denied")
    );
  };

  const set = (field, val) => {
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === "provinceCode") next.districtCode = "";
      return next;
    });
    if (touched[field]) {
      const err = field === "confirmPassword"
        ? validators.confirmPassword(val, form.password)
        : validators[field]?.(val) ?? "";
      setErrors(e => ({ ...e, [field]: err }));
    }
  };

  const touch = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    const err = field === "confirmPassword"
      ? validators.confirmPassword(form[field], form.password)
      : validators[field]?.(form[field]) ?? "";
    setErrors(e => ({ ...e, [field]: err }));
  };

  const validateAll = () => {
    const fields = ["name","phone","email","password","confirmPassword","provinceCode","districtCode","sector","cell","village"];
    const errs = {};
    fields.forEach(f => { errs[f] = f === "confirmPassword" ? validators.confirmPassword(form[f], form.password) : validators[f]?.(form[f]) ?? ""; });
    if (locationStatus !== "granted") errs.location = "Please share your GPS location to continue.";
    setErrors(errs);
    setTouched({ ...Object.fromEntries(fields.map(f => [f, true])), location: true });
    return !Object.values(errs).some(Boolean);
  };

  const handleRegister = async () => {
    if (!validateAll()) return;
    setLoading(true);
    setServerError("");
    try {
      const payload = {
        name: form.name, phone: form.phone, email: form.email, password: form.password,
        provinceCode: form.provinceCode, districtCode: form.districtCode,
        sector: form.sector, cell: form.cell, village: form.village,
        latitude: form.latitude, longitude: form.longitude,
      };
      await api.post("/hospitals/register", payload);
      setDone(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={styles.centeredPage}>
      <div style={styles.successBox}>
        <IconSuccess size={56} color="#1E8449" />
        <h2 style={styles.successTitle}>Registration submitted!</h2>
        <p style={styles.successDesc}>
          <strong>{form.name}</strong> has been registered and is pending admin approval.
          You will be notified at <strong>{form.email}</strong> once your account is activated.
        </p>
        <button style={styles.btnPrimary} onClick={() => navigate("/hospital-login")}>
          Go to Hospital Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Left panel — image */}
      <div style={styles.leftPanel}>

        <div style={styles.leftInner}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <button style={styles.backLink} onClick={() => navigate("/hospital-login")}>&larr; Back to Login</button>
            <LanguageSwitcher variant="light"/>
          </div>
          <div style={styles.logoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoTextWhite}>Hemo<span style={styles.logoAccent}>Link</span> Rwanda</span>
          </div>
          <h1 style={styles.leftTitle}>Register your<br /><em style={styles.leftEm}>hospital</em></h1>
          <p style={styles.leftDesc}>
            Join the HemoLink network. Once your registration is reviewed and approved,
            you'll be able to log in and start submitting blood requests.
          </p>
          <div style={styles.featureList}>
            {[
              "Submit urgent blood requests",
              "Reach nearby donors in under 60s",
              "Track inventory in real time",
              "All data secured and compliant",
            ].map(text => (
              <div key={text} style={styles.featureItem}>
                <span style={styles.featureIcon}><IconCheck size={12} color="#fff" /></span>
                <span style={styles.featureText}>{text}</span>
              </div>
            ))}
          </div>
          <div style={styles.approvalNote}>
            <div style={styles.approvalDot} />
            <span>Accounts require admin approval before login is enabled.</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formLogoRow}>
            <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
            <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
          </div>
          <h2 style={styles.formTitle}>Hospital Registration</h2>
          <p style={styles.formSub}>All fields marked * are required.</p>

          {serverError && (
            <div style={styles.alertError}><IconAlert size={14} /> {serverError}</div>
          )}

          <div style={styles.sectionLabel}>Basic Information</div>

          <Field label="Hospital Name" required error={touched.name && errors.name}>
            <InputField icon={IconBuilding} value={form.name} placeholder="e.g. King Faisal Hospital"
              onChange={e => set("name", e.target.value)} onBlur={() => touch("name")}
              error={touched.name && errors.name} autoComplete="organization" />
          </Field>

          <div style={styles.fieldRow}>
            <Field label="Phone Number" required error={touched.phone && errors.phone} helper="e.g. 0788123456">
              <InputField icon={IconPhone} value={form.phone} placeholder="0788 123 456"
                onChange={e => set("phone", e.target.value)} onBlur={() => touch("phone")}
                error={touched.phone && errors.phone} autoComplete="tel" />
            </Field>
            <Field label="Email Address" required error={touched.email && errors.email} helper="Used for login">
              <InputField icon={IconEmail} type="email" value={form.email} placeholder="admin@hospital.rw"
                onChange={e => set("email", e.target.value)} onBlur={() => touch("email")}
                error={touched.email && errors.email} autoComplete="email" />
            </Field>
          </div>

          <div style={styles.sectionLabel}>Location</div>

          <div style={styles.fieldRow}>
            <Field label="Province" required error={touched.provinceCode && errors.provinceCode}>
              <SelectField icon={IconPin} value={form.provinceCode}
                onChange={e => set("provinceCode", e.target.value)} onBlur={() => touch("provinceCode")}
                error={touched.provinceCode && errors.provinceCode}>
                <option value="">Select province</option>
                {PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </SelectField>
            </Field>
            <Field label="District" required error={touched.districtCode && errors.districtCode}>
              <SelectField icon={IconPin} value={form.districtCode}
                onChange={e => set("districtCode", e.target.value)} onBlur={() => touch("districtCode")}
                error={touched.districtCode && errors.districtCode} disabled={!form.provinceCode}>
                <option value="">Select district</option>
                {(DISTRICTS[form.provinceCode] || []).map(d => <option key={d} value={d}>{d}</option>)}
              </SelectField>
            </Field>
          </div>

          <div style={styles.fieldRow}>
            <Field label="Sector" required error={touched.sector && errors.sector}>
              <InputField icon={IconPin} value={form.sector} placeholder="e.g. Remera"
                onChange={e => set("sector", e.target.value)} onBlur={() => touch("sector")}
                error={touched.sector && errors.sector} />
            </Field>
            <Field label="Cell" required error={touched.cell && errors.cell}>
              <InputField icon={IconPin} value={form.cell} placeholder="e.g. Nyabisindu"
                onChange={e => set("cell", e.target.value)} onBlur={() => touch("cell")}
                error={touched.cell && errors.cell} />
            </Field>
          </div>

          <Field label="Village" required error={touched.village && errors.village}>
            <InputField icon={IconPin} value={form.village} placeholder="e.g. Gisimenti"
              onChange={e => set("village", e.target.value)} onBlur={() => touch("village")}
              error={touched.village && errors.village} />
          </Field>

          <div style={styles.sectionLabel}>GPS Location <span style={{ color: "#C0392B" }}>*</span></div>
          <div style={{ ...styles.locationRow, ...(touched.location && errors.location ? { borderLeft: "3px solid #C0392B", background: "#fff8f8" } : {}) }}>
            <div>
              <div style={styles.locationLabel}>
                Share hospital location
              </div>
              <div style={styles.locationSub}>
                {locationStatus === "idle"    && "Required to appear on the donor map."}
                {locationStatus === "loading" && "Getting location…"}
                {locationStatus === "granted" && `Location saved (${form.latitude?.toFixed(4)}, ${form.longitude?.toFixed(4)})`}
                {locationStatus === "denied"  && "Location denied. Please enable browser location access."}
              </div>
              {touched.location && errors.location && (
                <span style={{ fontSize: 12, color: "#C0392B", display: "block", marginTop: 4 }}>{errors.location}</span>
              )}
            </div>
            {locationStatus !== "granted" && (
              <button type="button"
                style={{ ...styles.submitBtn, marginTop: 0, padding: "8px 18px", fontSize: 13, width: "auto", flexShrink: 0 }}
                onClick={getLocation} disabled={locationStatus === "loading"}>
                {locationStatus === "loading" ? "Locating…" : "Detect Location"}
              </button>
            )}
          </div>

          <div style={styles.sectionLabel}>Set Password</div>
          <div style={styles.fieldRow}>
            <Field label="Password" required error={touched.password && errors.password} helper="Min 6 characters">
              <InputField icon={IconLock} type="password" value={form.password} placeholder="Create a password"
                onChange={e => set("password", e.target.value)} onBlur={() => touch("password")}
                error={touched.password && errors.password} autoComplete="new-password" />
            </Field>
            <Field label="Confirm Password" required error={touched.confirmPassword && errors.confirmPassword}>
              <InputField icon={IconLock} type="password" value={form.confirmPassword} placeholder="Re-enter password"
                onChange={e => set("confirmPassword", e.target.value)} onBlur={() => touch("confirmPassword")}
                error={touched.confirmPassword && errors.confirmPassword} autoComplete="new-password" />
            </Field>
          </div>

          <button style={{ ...styles.submitBtn, ...(loading ? styles.submitDisabled : {}) }}
            onClick={handleRegister} disabled={loading}>
            {loading ? "Submitting…" : "Submit Registration"}
          </button>

          <p style={styles.switchLink}>
            Already have an account?{" "}
            <button style={styles.linkBtn} onClick={() => navigate("/hospital-login")}>Sign in here</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { display: "flex", minHeight: "100vh", fontFamily: "'Sora', sans-serif" },
  leftPanel:     { width: "35vw", flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", overflow: "hidden", background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center" },
  overlay:       {},
  leftInner:     { padding: "24px 28px", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" },
  backLink:      { background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 11.5, cursor: "pointer", marginBottom: 14, display: "block", padding: 0, textAlign: "left" },
  logoRow:       { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  logoDrop:      { width: 26, height: 26, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoDropText:  { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 10 },
  logoTextWhite: { fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: -0.3 },
  logoAccent:    { color: "#E87B6E" },
  leftTitle:     { fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8 },
  leftEm:        { fontStyle: "italic", fontWeight: 400, color: "#E87B6E" },
  leftDesc:      { fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, marginBottom: 14 },
  featureList:   { display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 },
  featureItem:   { display: "flex", alignItems: "center", gap: 8 },
  featureIcon:   { width: 18, height: 18, background: "rgba(255,255,255,0.1)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureText:   { fontSize: 11.5, color: "rgba(255,255,255,0.82)" },
  approvalNote:  { display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 },
  approvalDot:   { width: 6, height: 6, borderRadius: "50%", background: "#E87B6E", flexShrink: 0, marginTop: 3 },
  rightPanel:    { marginLeft: "35vw", flex: 1, background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "60px 48px", overflowY: "auto" },
  formBox:       { width: "100%", maxWidth: 560 },
  formLogoRow:   { display: "flex", alignItems: "center", gap: 10, marginBottom: 22 },
  logoText:      { fontWeight: 800, fontSize: 17, letterSpacing: -0.3, color: "#1C1C1C" },
  logoRed:       { color: "#C0392B" },
  formTitle:     { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 4 },
  formSub:       { fontSize: 14, color: "#6B6B6B", marginBottom: 22, lineHeight: 1.5 },
  sectionLabel:  { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#9B9B9B", marginBottom: 12, marginTop: 6, paddingBottom: 6, borderBottom: "1px solid #F2EDE8" },
  fieldRow:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  locationRow:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#F0E8DF", borderRadius: 10, marginBottom: 16, gap: 12 },
  locationLabel: { fontSize: 13, fontWeight: 500, color: "#1C1C1C", marginBottom: 2 },
  locationSub:   { fontSize: 11, color: "#6B6B6B" },
  field:         { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 },
  label:         { fontSize: 13, fontWeight: 500, color: "#1C1C1C" },
  required:      { color: "#C0392B" },
  errorMsg:      { fontSize: 12, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 },
  helperMsg:     { fontSize: 12, color: "#6B6B6B" },
  inputWrap:     { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:     { position: "absolute", left: 11, pointerEvents: "none", zIndex: 1, display: "flex" },
  input:         { width: "100%", padding: "9px 12px 9px 34px", border: "1.5px solid #DDD5D0", borderRadius: 8, fontFamily: "'Sora', sans-serif", fontSize: 13.5, color: "#1C1C1C", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  togglePw:      { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" },
  alertError:    { display: "flex", alignItems: "center", gap: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #F1948A", borderRadius: 9, padding: "12px 16px", fontSize: 13.5, marginBottom: 18 },
  submitBtn:     { width: "100%", padding: 13, background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10 },
  submitDisabled:{ background: "#ccc", cursor: "not-allowed" },
  switchLink:    { textAlign: "center", fontSize: 13, color: "#6B6B6B", marginTop: 14 },
  linkBtn:       { background: "none", border: "none", color: "#C0392B", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  centeredPage:  { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Sora', sans-serif", background: "#FDF4F2" },
  successBox:    { textAlign: "center", padding: "60px 40px", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  successTitle:  { fontSize: 26, fontWeight: 800, color: "#1C1C1C", margin: 0 },
  successDesc:   { fontSize: 15, color: "#6B6B6B", lineHeight: 1.7, margin: 0 },
  btnPrimary:    { padding: "13px 32px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
};