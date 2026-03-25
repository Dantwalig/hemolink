import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api.js";
import { useLang } from "../../utils/LangContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import { LogoDrop, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";

export default function DonorRespondPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.get(`/notifications/token/${token}`)
      .then(res => { setData(res.data.data); setStatus("ready"); })
      .catch(err => { setStatus(err.response?.status === 410 ? "expired" : "error"); });
  }, [token]);

  const handleRespond = async (r) => {
    setLoading(true); setResponse(r);
    try {
      await api.post("/notifications/respond", { token, response_status: r });
      setStatus("success");
    } catch { setStatus("error"); }
    finally { setLoading(false); }
  };

  const urgencyColor = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
  const urg = data?.urgency_level?.toLowerCase() || "high";
  const urgColor = urgencyColor[urg] || "#C0392B";
  const neededBy = data?.needed_by ? new Date(data.needed_by).toLocaleString("en-RW", { dateStyle:"medium", timeStyle:"short" }) : t("common.soonAsPossible");

  const Card = ({ children }) => (
    <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:24, padding:"44px 48px", maxWidth:580, width:"100%", boxShadow:"0 12px 48px rgba(140,20,20,.12)", animation:"fadeInUp .6s ease both" }}>
      {children}
    </div>
  );

  const stateContent = {
    loading: (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
        <p style={{ fontSize:14, color:"#7A4A45" }}>{t("respond.loading")}</p>
      </div>
    ),
    error: (
      <Card>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:72, height:72, background:"rgba(192,57,43,.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#C0392B" strokeWidth="2"/><path d="M16 10v7M16 21.5v1" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>{t("respond.invalidTitle")}</h2>
          <p style={{ fontSize:15, color:"#7A4A45", lineHeight:1.7, marginBottom:28 }}>{t("respond.invalidDesc")}</p>
          <button className="hl-btn-red" onClick={()=>navigate("/login")}>Go to Donor Login</button>
        </div>
      </Card>
    ),
    expired: (
      <Card>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:72, height:72, background:"rgba(230,126,34,.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#E67E22" strokeWidth="2"/><path d="M16 9v7l4 4" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>{t("respond.expiredTitle")}</h2>
          <p style={{ fontSize:15, color:"#7A4A45", lineHeight:1.7, marginBottom:28 }}>{t("respond.expiredDesc")}</p>
          <button className="hl-btn-red" onClick={()=>navigate("/login")}>Go to My Dashboard</button>
        </div>
      </Card>
    ),
    success: (
      <Card>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:80, height:80, background: response==="Accepted" ? "rgba(30,132,73,.1)" : "rgba(107,107,107,.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            {response==="Accepted"
              ? <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="#1E8449" strokeWidth="2"/><path d="M10 18l6 6 10-12" stroke="#1E8449" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="#6B6B6B" strokeWidth="2"/><path d="M12 18h12" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round"/></svg>
            }
          </div>
          <h2 style={{ fontSize:24, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>
            {response==="Accepted" ? t("respond.thankYou") : t("respond.responseReceived")}
          </h2>
          <p style={{ fontSize:15, color:"#7A4A45", lineHeight:1.75, marginBottom:28, maxWidth:420, margin:"0 auto 28px" }}>
            {response==="Accepted" ? t("respond.acceptedDesc") : t("respond.declinedDesc")}
          </p>
          {response==="Accepted" && data && (
            <div style={{ display:"flex", alignItems:"center", gap:14, background:"#EAFAF1", border:"1.5px solid #A9DFBF", borderRadius:14, padding:"16px 20px", textAlign:"left", marginBottom:28 }}>
              <div style={{ width:48, height:48, background:"#D5F5E3", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="15" rx="1.5" stroke="#1E8449" strokeWidth="1.5"/><path d="M9 22v-6h6v6M10 3h4v4h-4zM9 12h2M13 12h2" stroke="#1E8449" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"#1a0a07", marginBottom:3 }}>{data.hospital_name}</div>
                <div style={{ fontSize:12, color:"#1E8449", fontWeight:500 }}>{t("common.mentionHemoLink")}</div>
              </div>
            </div>
          )}
          <button className="hl-btn-red" onClick={()=>navigate("/login")} style={{ padding:"13px 32px", fontSize:14 }}>{t("respond.goToDashboard")}</button>
        </div>
      </Card>
    ),
  };

  if (status !== "ready") {
    return (
      <div style={{ minHeight:"100vh", background:"#FDF4F2", fontFamily:"'Sora',sans-serif", display:"flex", flexDirection:"column" }}>
        <style>{SORA_FONT + SHARED_BTN_CSS}</style>
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px", background:"rgba(255,255,255,.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid #F0E0DC" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><LogoDrop size={30}/><span style={{ fontWeight:800, fontSize:16, color:"#1a0a07" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></span></div>
          <LanguageSwitcher/>
        </header>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
          {stateContent[status]}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FDF4F2", fontFamily:"'Sora',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        .respond-accept{flex:1;padding:15px 0;background:linear-gradient(135deg,#1E8449,#145A32);color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 20px rgba(30,132,73,.35);transition:all .2s;}
        .respond-accept:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(30,132,73,.45);}
        .respond-decline{flex:1;padding:15px 0;background:transparent;color:#C0392B;border:2px solid #C0392B;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;}
        .respond-decline:hover:not(:disabled){background:rgba(192,57,43,.05);}
        .respond-accept:disabled,.respond-decline:disabled{opacity:.65;cursor:not-allowed;transform:none;}
      `}</style>

      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px", background:"rgba(255,255,255,.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid #F0E0DC", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><LogoDrop size={30}/><span style={{ fontWeight:800, fontSize:16, color:"#1a0a07" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></span></div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:11, color:"#7A4A45", fontWeight:600, letterSpacing:.8, textTransform:"uppercase" }}>{t("respond.emergencyRequest")}</span>
          <LanguageSwitcher/>
        </div>
      </header>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:24, padding:"44px 48px", maxWidth:600, width:"100%", boxShadow:"0 12px 48px rgba(140,20,20,.12)", animation:"fadeInUp .6s ease both" }}>
          {/* Urgency badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:urgColor, borderRadius:24, padding:"8px 18px", marginBottom:22, color:"#fff", fontSize:13, fontWeight:700 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,.75)", display:"inline-block", animation:"hl-spin 1s linear infinite" }}/>
            {(data?.urgency_level || "High").charAt(0).toUpperCase() + (data?.urgency_level || "High").slice(1)} — {t("respond.bloodNeededNow")}
          </div>

          <h1 style={{ fontSize:24, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>{t("respond.matched")}</h1>
          <p style={{ fontSize:14, color:"#7A4A45", lineHeight:1.7, marginBottom:28 }}>{t("respond.matchedSub")}</p>

          {/* Blood type hero */}
          <div style={{ background:"linear-gradient(135deg,rgba(192,57,43,.06),rgba(192,57,43,.02))", border:"1.5px solid rgba(192,57,43,.2)", borderRadius:16, padding:"20px 24px", marginBottom:24, display:"flex", alignItems:"center", gap:24 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:52, fontWeight:900, color:"#C0392B", fontFamily:"'Lora',serif", lineHeight:1, textShadow:"0 2px 12px rgba(192,57,43,.3)" }}>{data?.blood_type_code}</div>
              <div style={{ fontSize:11, color:"#7A4A45", textTransform:"uppercase", letterSpacing:.8, fontWeight:600, marginTop:4 }}>Blood Type</div>
            </div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                [t("respond.hospital"), data?.hospital_name],
                [t("respond.units"), `${data?.units_needed} ${t("common.units")}`],
                [t("respond.neededBy"), neededBy],
                [t("respond.distance"), data?.distance_km != null ? `${data.distance_km} ${t("common.kmAway")}` : data?.hospital_sector || "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ background:"rgba(255,255,255,.8)", borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#9B7B77", textTransform:"uppercase", letterSpacing:.6, fontWeight:600, marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, color:"#1a0a07", fontWeight:600, lineHeight:1.35 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop:"1px solid #F0E0DC", margin:"0 0 22px" }}/>
          <p style={{ fontSize:16, fontWeight:700, color:"#1a0a07", marginBottom:16, textAlign:"center" }}>{t("respond.canYouDonate")}</p>

          <div style={{ display:"flex", gap:12, marginBottom:18 }}>
            <button className="respond-accept" onClick={()=>handleRespond("Accepted")} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {loading && response==="Accepted" ? t("respond.confirming") : t("respond.yesCanDonate")}
            </button>
            <button className="respond-decline" onClick={()=>handleRespond("Declined")} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"/></svg>
              {loading && response==="Declined" ? t("respond.sending") : t("respond.noCannotDonate")}
            </button>
          </div>

          <div style={{ fontSize:12.5, color:"#7A4A45", lineHeight:1.65, textAlign:"center", background:"rgba(192,57,43,.04)", border:"1px solid rgba(192,57,43,.1)", borderRadius:10, padding:"12px 16px" }}>
            {t("respond.noteText")}
          </div>
        </div>
      </div>
    </div>
  );
}
