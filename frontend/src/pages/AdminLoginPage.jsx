import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";
import LanguageSwitcher from "../utils/LanguageSwitcher.jsx";
import { LogoDrop, LABEL, ERR_MSG, INPUT_ICON, SORA_FONT, SHARED_BTN_CSS } from "../utils/HLComponents.jsx";

const ShieldIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path d="M30 5L8 15v16c0 13.255 9.425 25.646 22 29 12.575-3.354 22-15.745 22-29V15L30 5z" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M20 30l7 7 13-14" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const validate = {
    email: (v) => { if (!v.trim()) return "Email is required."; if (!v.endsWith("@rbc.gov.rw")) return "Must be an @rbc.gov.rw email address."; return ""; },
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
      const res = await api.post("/admin/login", { email: form.email, password: form.password });
      login(res.data.data.admin, res.data.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed.");
    } finally { setLoading(false); }
  };

  const inp = (f) => ({
    width:"100%", padding:"13px 14px 13px 40px",
    border:`1.5px solid ${errors[f]&&touched[f] ? "#C0392B" : form[f] ? "#1E8449" : "#E8D5D0"}`,
    borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif",
    background: errors[f]&&touched[f] ? "#fff8f8" : "#fff",
    color:"#1a0a07", transition:"border-color .18s",
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Sora',sans-serif" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>

      {/* Dark left panel */}
      <div style={{ width:340, background:"linear-gradient(160deg,#1a0505 0%,#0a0000 100%)", position:"relative", overflow:"hidden", flexShrink:0, display:"flex", flexDirection:"column" }}>
        <div style={{ position:"absolute", inset:0, background:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle fill='%23ffffff' fill-opacity='0.02' cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1, padding:"48px 36px", display:"flex", flexDirection:"column", justifyContent:"center", height:"100%", gap:28 }}>
          <div>
            <div style={{ marginBottom:24 }}><ShieldIcon/></div>
            <div style={{ fontSize:10, color:"#E87B6E", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:10 }}>Rwanda Biomedical Centre</div>
            <h2 style={{ fontSize:24, fontWeight:800, color:"#fff", marginBottom:10, lineHeight:1.2 }}>RBC Staff Access</h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.75 }}>Restricted to @rbc.gov.rw email accounts. Unauthorized access is logged and prosecuted.</p>
          </div>
          <div style={{ padding:"16px 18px", background:"rgba(192,57,43,.15)", borderRadius:12, border:"1px solid rgba(192,57,43,.3)" }}>
            <div style={{ fontSize:11, color:"#E87B6E", fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Access Level</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.65)", lineHeight:1.6 }}>Platform-wide administration: donors, hospitals, blood requests, SMS logs.</div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div style={{ flex:1, background:"#FDF4F2", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px", background:"rgba(255,255,255,.95)", borderBottom:"1px solid #F0E0DC" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <LogoDrop size={30}/>
            <span style={{ fontWeight:800, fontSize:16, color:"#1a0a07" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LanguageSwitcher/>
            <button className="hl-back" onClick={()=>navigate("/")}>← Back</button>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 48px" }}>
          <div style={{ maxWidth:420, width:"100%", animation:"fadeInUp .6s ease both" }}>
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(192,57,43,.08)", border:"1px solid rgba(192,57,43,.2)", borderRadius:20, padding:"6px 14px", marginBottom:16, fontSize:11, fontWeight:700, color:"#C0392B", letterSpacing:.5, textTransform:"uppercase" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v5c0 4.418 2.686 8.548 6 10 3.314-1.452 6-5.582 6-10V4L8 1z" stroke="#C0392B" strokeWidth="1.5"/></svg>
                Secure Login
              </div>
              <h1 style={{ fontSize:28, fontWeight:800, color:"#1a0a07", marginBottom:8, letterSpacing:-.5 }}>RBC Staff Login</h1>
              <p style={{ fontSize:15, color:"#7A4A45" }}>Admin portal for Rwanda Biomedical Centre staff.</p>
            </div>

            {serverError && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.4"/><path d="M8 5v3M8 10.5v.5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <label style={LABEL}>RBC Email Address <span style={{ color:"#C0392B" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={INPUT_ICON}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="#9B7B77" strokeWidth="1.3"/><path d="M1 5l7 5 7-5" stroke="#9B7B77" strokeWidth="1.3"/></svg></span>
                  <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} onBlur={()=>touch("email")}
                    placeholder="staff@rbc.gov.rw" autoComplete="email" style={inp("email")}/>
                </div>
                {errors.email && touched.email && <span style={ERR_MSG}>{errors.email}</span>}
                <span style={{ display:"block", fontSize:12, color:"#9B7B77", marginTop:6 }}>Only @rbc.gov.rw accounts are permitted.</span>
              </div>

              <div>
                <label style={LABEL}>Password <span style={{ color:"#C0392B" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={INPUT_ICON}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#9B7B77" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="#9B7B77" strokeWidth="1.3"/><circle cx="8" cy="11" r="1" fill="#9B7B77"/></svg></span>
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e=>set("password",e.target.value)} onBlur={()=>touch("password")}
                    placeholder="Your password" autoComplete="current-password"
                    style={{ ...inp("password"), paddingRight:44 }}/>
                  <button type="button" style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }} onClick={()=>setShowPw(p=>!p)} tabIndex={-1}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" stroke="#9B7B77" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" stroke="#9B7B77" strokeWidth="1.4"/>{!showPw && <path d="M2 2l14 14" stroke="#9B7B77" strokeWidth="1.4" strokeLinecap="round"/>}</svg>
                  </button>
                </div>
                {errors.password && touched.password && <span style={ERR_MSG}>{errors.password}</span>}
              </div>

              <button type="submit" className="hl-submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? "Authenticating…" : "Sign In to Admin Portal"}
              </button>
            </form>

            <div style={{ borderTop:"1px solid #F0E0DC", margin:"22px 0 18px" }}/>
            <div style={{ textAlign:"center", fontSize:12, color:"#9B7B77", lineHeight:1.6 }}>
              This is a restricted system. All access attempts are logged. Contact your RBC system administrator if you need credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
