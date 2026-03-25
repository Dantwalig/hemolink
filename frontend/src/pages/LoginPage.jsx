import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { useLang } from "../utils/LangContext.jsx";
import LanguageSwitcher from "../utils/LanguageSwitcher.jsx";

function LogoDrop({ size = 34 }) {
  return (
    <div style={{width:size,height:size,background:"linear-gradient(135deg,#C0392B,#8B1A1A)",borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(192,57,43,.38)",flexShrink:0}}>
      <span style={{transform:"rotate(45deg)",color:"#fff",fontWeight:900,fontSize:size*.38,fontFamily:"'Sora',sans-serif",lineHeight:1}}>H</span>
    </div>
  );
}

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {open ? (
      <>
        <path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" stroke="#9B7B77" strokeWidth="1.4"/>
        <circle cx="9" cy="9" r="2.5" stroke="#9B7B77" strokeWidth="1.4"/>
      </>
    ) : (
      <>
        <path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" stroke="#9B7B77" strokeWidth="1.4"/>
        <circle cx="9" cy="9" r="2.5" stroke="#9B7B77" strokeWidth="1.4"/>
        <path d="M2 2l14 14" stroke="#9B7B77" strokeWidth="1.4" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="1" width="10" height="14" rx="2" stroke="#9B7B77" strokeWidth="1.3"/>
    <circle cx="8" cy="12" r="1" fill="#9B7B77"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#9B7B77" strokeWidth="1.3"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="#9B7B77" strokeWidth="1.3"/>
    <circle cx="8" cy="11" r="1" fill="#9B7B77"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const validate = {
    phone: (v) => {
      if (!v.trim()) return t("login.errorPhone");
      const c = v.replace(/[\s\-]/g,"");
      if (!/^(\+?250|0)[7][2389]\d{7}$/.test(c)) return t("login.errorPhone");
      return "";
    },
    password: (v) => v ? "" : t("login.errorPassword"),
  };

  const set = (f, v) => {
    setForm(x=>({...x,[f]:v}));
    if (touched[f]) setErrors(e=>({...e,[f]:validate[f]?.(v)||""}));
  };
  const touch = (f) => {
    setTouched(t=>({...t,[f]:true}));
    setErrors(e=>({...e,[f]:validate[f]?.(form[f])||""}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = { phone: validate.phone(form.phone), password: validate.password(form.password) };
    setErrors(errs);
    setTouched({ phone:true, password:true });
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await api.post("/donors/login", { phone: form.phone.replace(/[\s\-]/g,""), password: form.password });
      login(res.data.data.donor, res.data.data.token);
      navigate("/donor/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = (hasErr, val) => ({
    width:"100%", padding:"13px 14px 13px 40px",
    border:`1.5px solid ${hasErr ? "#C0392B" : val ? "#1E8449" : "#E8D5D0"}`,
    borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif",
    background: hasErr ? "#fff8f8" : "#fff",
    color:"#1a0a07", outline:"none",
    transition:"border-color .18s",
  });

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes bloodFall{0%{transform:translateY(-40px);opacity:0;}8%{opacity:.5;}90%{opacity:.25;}100%{transform:translateY(100vh);opacity:0;}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .hl-submit{width:100%;padding:14px;background:linear-gradient(135deg,#C0392B,#8B1A1A);color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 6px 20px rgba(192,57,43,.38);transition:all .2s;margin-top:4px;}
        .hl-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(192,57,43,.48);}
        .hl-submit:disabled{opacity:.65;cursor:not-allowed;}
        .hl-link{background:none;border:none;color:#C0392B;font-weight:600;cursor:pointer;font-size:13px;padding:0;font-family:'Sora',sans-serif;text-decoration:underline;text-underline-offset:2px;}
        .hl-link:hover{color:#8B1A1A;}
        .hl-back{background:none;border:1.5px solid #E8D5D0;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#7A4A45;font-family:'Sora',sans-serif;transition:all .18s;}
        .hl-back:hover{border-color:#C0392B;color:#C0392B;}
        input::placeholder{color:#BBA0A0;}
        input:focus{border-color:#C0392B !important;box-shadow:0 0 0 3px rgba(192,57,43,.1);}
      `}</style>

      {/* Decorative left panel */}
      <div style={S.panel}>
        <div style={S.panelDrops}>
          {[[15,0],[35,1.5],[55,3],[75,0.8],[95,2.3]].map(([t,d],i)=>(
            <div key={i} style={{position:"absolute",left:`${t}%`,top:0,animation:`bloodFall 5s ${d}s ease-in infinite`}}>
              <svg width="14" height="18" viewBox="0 0 20 26" fill="none">
                <path d="M10 1C10 1 2 10 2 16a8 8 0 0 0 16 0C18 10 10 1 10 1z" fill="rgba(255,255,255,.2)"/>
              </svg>
            </div>
          ))}
        </div>
        <div style={S.panelContent}>
          <div style={{marginBottom:40}}>
            <div style={S.panelDropIcon}>
              <svg width="100" height="124" viewBox="0 0 180 220" fill="none" style={{filter:"drop-shadow(0 10px 30px rgba(0,0,0,.3))"}}>
                <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z" fill="rgba(255,255,255,.15)"/>
                <path d="M55 148a35 35 0 0 0 35 35" stroke="rgba(255,255,255,.2)" strokeWidth="3" strokeLinecap="round"/>
                <text x="90" y="166" textAnchor="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="'Sora',sans-serif" opacity=".9">H</text>
              </svg>
            </div>
            <h2 style={{fontSize:26,fontWeight:800,color:"#fff",marginBottom:10}}>Donor Portal</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,.65)",lineHeight:1.7,maxWidth:280}}>
              Your donation can save up to 3 lives. Rwanda's emergency blood network is counting on you.
            </p>
          </div>
          <div style={S.panelStats}>
            {[["58K+","Registered Donors"],["<60s","Alert Response"],["24/7","Emergency Ready"]].map(([n,l],i)=>(
              <div key={i} style={S.panelStat}>
                <span style={{fontSize:20,fontWeight:800,color:"#fff"}}>{n}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,.55)",textTransform:"uppercase",letterSpacing:.7,marginTop:3}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={S.formPanel}>
        <div style={S.formHeader}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <LogoDrop size={32}/>
            <span style={{fontWeight:800,fontSize:17,color:"#1a0a07"}}>Hemo<span style={{color:"#C0392B"}}>Link</span></span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <LanguageSwitcher />
            <button className="hl-back" onClick={() => navigate("/")}>{t("login.backHome")}</button>
          </div>
        </div>

        <div style={{...S.formCard, animation:"fadeInUp .6s ease both"}}>
          <div style={S.formTop}>
            <h1 style={S.formTitle}>{t("login.title")}</h1>
            <p style={S.formSub}>{t("login.subtitle")}</p>
          </div>

          {serverError && (
            <div style={S.alert}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.4"/><path d="M8 5v3M8 10.5v.5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Phone */}
            <div>
              <label style={S.label}>{t("login.phone")} <span style={{color:"#C0392B"}}>*</span></label>
              <div style={{position:"relative"}}>
                <span style={S.inputIcon}><PhoneIcon/></span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e=>set("phone",e.target.value)}
                  onBlur={()=>touch("phone")}
                  placeholder={t("login.phonePlaceholder")}
                  autoComplete="tel"
                  style={inp(errors.phone && touched.phone, form.phone)}
                />
              </div>
              {errors.phone && touched.phone && <span style={S.err}>{errors.phone}</span>}
            </div>

            {/* Password */}
            <div>
              <label style={S.label}>{t("login.password")} <span style={{color:"#C0392B"}}>*</span></label>
              <div style={{position:"relative"}}>
                <span style={S.inputIcon}><LockIcon/></span>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={e=>set("password",e.target.value)}
                  onBlur={()=>touch("password")}
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                  style={{...inp(errors.password && touched.password, form.password), paddingRight:44}}
                />
                <button type="button" style={S.eyeBtn} onClick={()=>setShowPw(p=>!p)} tabIndex={-1}>
                  <EyeIcon open={showPw}/>
                </button>
              </div>
              {errors.password && touched.password && <span style={S.err}>{errors.password}</span>}
            </div>

            <button type="submit" className="hl-submit" disabled={loading}>
              {loading ? t("login.loggingIn") : t("login.submit")}
            </button>
          </form>

          <div style={{textAlign:"center",marginTop:24,fontSize:13,color:"#7A4A45"}}>
            {t("login.noAccount")}{" "}
            <button className="hl-link" onClick={() => navigate("/register")}>{t("login.register")}</button>
          </div>

          <div style={S.divider}/>
          <div style={{textAlign:"center",fontSize:13,color:"#7A4A45"}}>
            <button className="hl-link" style={{color:"#9B7B77"}} onClick={() => navigate("/hospital-login")}>
              {t("nav.hospitalLogin")} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:{display:"flex",minHeight:"100vh",fontFamily:"'Sora',sans-serif",background:"#FDF4F2"},
  panel:{width:340,background:"linear-gradient(160deg,#C0392B 0%,#7D1212 100%)",position:"relative",overflow:"hidden",flexShrink:0,display:"flex",flexDirection:"column"},
  panelDrops:{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"},
  panelContent:{position:"relative",zIndex:1,padding:"48px 36px",display:"flex",flexDirection:"column",justifyContent:"center",height:"100%"},
  panelDropIcon:{marginBottom:24},
  panelStats:{display:"flex",flexDirection:"column",gap:16},
  panelStat:{display:"flex",flexDirection:"column",padding:"14px 18px",background:"rgba(255,255,255,.1)",borderRadius:12,border:"1px solid rgba(255,255,255,.15)"},
  formPanel:{flex:1,display:"flex",flexDirection:"column"},
  formHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 40px",background:"rgba(255,255,255,.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F0E0DC"},
  formCard:{maxWidth:440,width:"100%",margin:"auto",padding:"0 48px 48px"},
  formTop:{padding:"44px 0 32px",borderBottom:"1px solid #F0E0DC",marginBottom:32},
  formTitle:{fontSize:30,fontWeight:800,color:"#1a0a07",marginBottom:8,letterSpacing:-.5},
  formSub:{fontSize:15,color:"#7A4A45"},
  label:{display:"block",fontSize:13,fontWeight:600,color:"#4A2020",marginBottom:8,letterSpacing:.2},
  inputIcon:{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",display:"flex",alignItems:"center"},
  eyeBtn:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center"},
  err:{display:"block",fontSize:12,color:"#C0392B",marginTop:6,fontWeight:500},
  alert:{display:"flex",alignItems:"center",gap:8,background:"#fff2f2",border:"1.5px solid rgba(192,57,43,.25)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#C0392B",marginBottom:4,fontWeight:500},
  divider:{borderTop:"1px solid #F0E0DC",margin:"22px 0 18px"},
};
