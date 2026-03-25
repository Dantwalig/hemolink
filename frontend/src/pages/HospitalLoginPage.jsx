import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { useLang } from "../utils/LangContext.jsx";
import LanguageSwitcher from "../utils/LanguageSwitcher.jsx";
import { LogoDrop, AuthLayout, inputStyle, LABEL, ERR_MSG, INPUT_ICON } from "../utils/HLComponents.jsx";

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="#9B7B77" strokeWidth="1.3"/>
    <path d="M1 5l7 5 7-5" stroke="#9B7B77" strokeWidth="1.3"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#9B7B77" strokeWidth="1.3"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="#9B7B77" strokeWidth="1.3"/>
    <circle cx="8" cy="11" r="1" fill="#9B7B77"/>
  </svg>
);
const HospitalIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="14" width="36" height="30" rx="3" stroke="rgba(255,255,255,.7)" strokeWidth="2"/>
    <path d="M14 44V30h20v14M18 6h12v8H18zM20 22h8M24 18v8" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function HospitalLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const validate = {
    email: (v) => { if (!v.trim()) return "Email is required."; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email."; return ""; },
    password: (v) => v ? "" : "Password is required.",
  };
  const set = (f, v) => { setForm(x => ({ ...x, [f]: v })); if (touched[f]) setErrors(e => ({ ...e, [f]: validate[f]?.(v) || "" })); };
  const touch = (f) => { setTouched(t => ({ ...t, [f]: true })); setErrors(e => ({ ...e, [f]: validate[f]?.(form[f]) || "" })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = { email: validate.email(form.email), password: validate.password(form.password) };
    setErrors(errs); setTouched({ email: true, password: true });
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true); setServerError("");
    try {
      const res = await api.post("/hospitals/login", { email: form.email, password: form.password });
      login(res.data.data.hospital, res.data.data.token);
      navigate("/hospital/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      panelTitle={t("hospitalLogin.title")}
      panelSub={t("hospitalLogin.subtitle")}
      panelStats={[["130K+","Units needed yearly"],["24/7","Emergency ready"],["Live","Blood matching"]]}
    >
      {/* Form side */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px", background:"rgba(255,255,255,.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid #F0E0DC" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <LogoDrop size={30}/>
            <span style={{ fontWeight:800, fontSize:16, color:"#1a0a07" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LanguageSwitcher />
            <button className="hl-back" onClick={() => navigate("/")}>{t("login.backHome")}</button>
          </div>
        </div>

        {/* Hospital indicator strip */}
        <div style={{ background:"linear-gradient(90deg,rgba(192,57,43,.06),transparent)", padding:"12px 48px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid #F8EDEB" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="10" rx="1" stroke="#C0392B" strokeWidth="1.3"/><path d="M5 15v-4h6v4M6 2h4v3H6zM7 8h2M8 7v2" stroke="#C0392B" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span style={{ fontSize:12, color:"#C0392B", fontWeight:600, letterSpacing:.3 }}>HOSPITAL PORTAL</span>
        </div>

        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 48px" }}>
          <div style={{ maxWidth:420, width:"100%", animation:"fadeInUp .6s ease both" }}>
            <div style={{ marginBottom:32 }}>
              <h1 style={{ fontSize:28, fontWeight:800, color:"#1a0a07", marginBottom:8, letterSpacing:-.5 }}>{t("hospitalLogin.title")}</h1>
              <p style={{ fontSize:15, color:"#7A4A45" }}>{t("hospitalLogin.subtitle")}</p>
            </div>

            {serverError && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.4"/><path d="M8 5v3M8 10.5v.5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Email */}
              <div>
                <label style={LABEL}>{t("hospitalLogin.email")} <span style={{ color:"#C0392B" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={INPUT_ICON}><EmailIcon/></span>
                  <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} onBlur={()=>touch("email")}
                    placeholder={t("hospitalLogin.emailPlaceholder")} autoComplete="email"
                    style={inputStyle(errors.email && touched.email, form.email)}/>
                </div>
                {errors.email && touched.email && <span style={ERR_MSG}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div>
                <label style={LABEL}>{t("hospitalLogin.password")} <span style={{ color:"#C0392B" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={INPUT_ICON}><LockIcon/></span>
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e=>set("password",e.target.value)} onBlur={()=>touch("password")}
                    placeholder={t("hospitalLogin.passwordPlaceholder")} autoComplete="current-password"
                    style={{ ...inputStyle(errors.password && touched.password, form.password), paddingRight:44 }}/>
                  <button type="button" style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }} onClick={()=>setShowPw(p=>!p)} tabIndex={-1}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d={showPw ? "M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" : "M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z"} stroke="#9B7B77" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" stroke="#9B7B77" strokeWidth="1.4"/>{!showPw && <path d="M2 2l14 14" stroke="#9B7B77" strokeWidth="1.4" strokeLinecap="round"/>}</svg>
                  </button>
                </div>
                {errors.password && touched.password && <span style={ERR_MSG}>{errors.password}</span>}
              </div>

              <button type="submit" className="hl-submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? t("hospitalLogin.signingIn") : t("hospitalLogin.submit")}
              </button>
            </form>

            <div style={{ textAlign:"center", marginTop:24, fontSize:13, color:"#7A4A45" }}>
              {t("hospitalLogin.noAccount")}{" "}
              <button className="hl-link" onClick={()=>navigate("/hospital/register")}>{t("hospitalLogin.register")}</button>
            </div>
            <div style={{ borderTop:"1px solid #F0E0DC", margin:"22px 0 18px" }}/>
            <div style={{ textAlign:"center", fontSize:13, color:"#7A4A45" }}>
              <button className="hl-link" style={{ color:"#9B7B77" }} onClick={()=>navigate("/login")}>
                {t("nav.donorLogin")} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
