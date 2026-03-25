import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import { useLang } from "../../utils/LangContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import api from "../../utils/api.js";
import { DashShell, LogoDrop, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";
import { IconBlood, IconBell, IconUser, IconPhone, IconCheckCircle } from "../../utils/Icons.jsx";

const IconHeartbeat = ({ size=20, color="#C0392B" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M1 10h3l2-5 4 10 2-5 2 3h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPin = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1a5 5 0 0 1 5 5c0 4-5 9-5 9S3 10 3 6a5 5 0 0 1 5-5z" stroke={color} strokeWidth="1.3"/>
    <circle cx="8" cy="6" r="1.5" stroke={color} strokeWidth="1.3"/>
  </svg>
);
const IconCalendar = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="1.5" stroke={color} strokeWidth="1.3"/>
    <path d="M5 1v4M11 1v4M1 7h14" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconPower = ({ size=20, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 3v5M7 5.27A6 6 0 1 0 13 5.27" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const NAV = [
  { label:"Dashboard", path:"/donor/dashboard", Icon: ({ size, color }) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/></svg> },
];

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/donors/profile")
      .then(res => setProfile(res.data.data))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const res = await api.put("/donors/availability", { available: !profile.available });
      setProfile(res.data.data);
    } catch { setError("Failed to update."); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FDF4F2", fontFamily:"'Sora',sans-serif" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:38, height:38, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
        <span style={{ fontSize:13, color:"#9B7B77" }}>Loading…</span>
      </div>
    </div>
  );

  const firstName = profile?.fullName?.split(" ")[0] || "Donor";
  const isAvailable = profile?.available;

  return (
    <DashShell
      nav={NAV}
      onLogout={() => { logout(); navigate("/login"); }}
      logoLabel="Rwanda"
      userLabel={profile?.fullName?.toUpperCase()}
    >
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>
      <div style={{ padding:"36px 44px", maxWidth:1100, margin:"0 auto" }}>

        {/* Header row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:36 }}>
          <div>
            <p style={{ fontSize:13, color:"#9B7B77", fontWeight:500, marginBottom:6, letterSpacing:.3 }}>
              {t("donor.welcomeBack")}
            </p>
            <h1 style={{ fontSize:34, fontWeight:800, color:"#1a0a07", letterSpacing:-.8, lineHeight:1 }}>{firstName}</h1>
            <p style={{ fontSize:14, color:"#7A4A45", marginTop:6 }}>{t("donor.overview")}</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <LanguageSwitcher/>
          </div>
        </div>

        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:24, fontWeight:500 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.4"/><path d="M8 5v3M8 10.5v.5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:28 }}>
          {[
            { label:t("donor.bloodType"), value:profile?.bloodTypeCode || "—", Icon:IconBlood, color:"#C0392B", bg:"rgba(192,57,43,.08)" },
            { label:t("donor.status"), value:isAvailable ? t("donor.active") : t("donor.inactive"), Icon:IconHeartbeat, color:isAvailable?"#1E8449":"#6B6B6B", bg:isAvailable?"rgba(30,132,73,.08)":"rgba(107,107,107,.08)" },
            { label:t("donor.smsAlerts"), value:profile?.consentSms ? t("donor.enabled") : t("donor.disabled"), Icon:IconBell, color:"#6B3FA0", bg:"rgba(107,63,160,.08)" },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, padding:"24px", display:"flex", alignItems:"center", gap:16, boxShadow:"0 4px 16px rgba(140,20,20,.05)", transition:"transform .2s" }}>
              <div style={{ width:50, height:50, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={22} color={color}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#9B7B77", textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}>
          {/* Left: Profile */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"32px", boxShadow:"0 4px 20px rgba(140,20,20,.05)" }}>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#1a0a07", marginBottom:24, letterSpacing:-.3 }}>{t("donor.profileTitle")}</h2>
            {[
              { label:t("donor.fullName"), value:profile?.fullName, Icon:IconUser },
              { label:t("donor.phone"), value:profile?.phone, Icon:IconPhone },
              { label:t("donor.bloodType"), value:profile?.bloodTypeCode, Icon:IconBlood },
              { label:t("donor.district"), value:profile?.districtCode, Icon:IconPin },
              { label:t("donor.registered"), value:profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-RW", { dateStyle:"medium" }) : "—", Icon:IconCalendar },
            ].map(({ label, value, Icon }, i, arr) => (
              <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 0", borderBottom: i < arr.length-1 ? "1px solid #F8EDEB" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(192,57,43,.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={16} color="#C0392B"/>
                  </div>
                  <span style={{ fontSize:13, color:"#7A4A45" }}>{label}</span>
                </div>
                <span style={{ fontSize:14, fontWeight:600, color:"#1a0a07" }}>{value || "—"}</span>
              </div>
            ))}
          </div>

          {/* Right: Availability card */}
          <div>
            <div style={{
              background:"#fff",
              border:`2.5px solid ${isAvailable ? "#1E8449" : "#E8D5D0"}`,
              borderTop:`5px solid ${isAvailable ? "#1E8449" : "#C0392B"}`,
              borderRadius:20, padding:"36px 28px",
              boxShadow:`0 8px 32px ${isAvailable ? "rgba(30,132,73,.12)" : "rgba(140,20,20,.08)"}`,
              display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:20
            }}>
              {/* Big status icon */}
              <div style={{ width:80, height:80, borderRadius:"50%", background:isAvailable?"rgba(30,132,73,.1)":"rgba(192,57,43,.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <IconPower size={36} color={isAvailable?"#1E8449":"#C0392B"}/>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:isAvailable?"#1E8449":"#C0392B", marginBottom:8 }}>
                  {isAvailable ? "● ACTIVE" : "○ INACTIVE"}
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>{t("donor.availableTitle")}</h3>
                <p style={{ fontSize:13.5, color:"#7A4A45", lineHeight:1.65 }}>{t("donor.availableDesc")}</p>
              </div>

              <button
                onClick={toggleAvailability}
                disabled={toggling}
                style={{
                  width:"100%", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:toggling?"not-allowed":"pointer",
                  fontFamily:"'Sora',sans-serif", transition:"all .2s", opacity:toggling?.65:1,
                  background: isAvailable ? "transparent" : "linear-gradient(135deg,#1E8449,#145A32)",
                  color: isAvailable ? "#C0392B" : "#fff",
                  border: isAvailable ? "2px solid #C0392B" : "none",
                  boxShadow: isAvailable ? "none" : "0 6px 20px rgba(30,132,73,.35)",
                }}
              >
                {toggling ? t("donor.updating") : isAvailable ? t("donor.makeUnavailable") : t("donor.makeAvailable")}
              </button>

              {isAvailable && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"rgba(30,132,73,.06)", borderRadius:10, width:"100%" }}>
                  <IconCheckCircle size={14} color="#1E8449"/>
                  <span style={{ fontSize:12, color:"#1E8449", fontWeight:500 }}>You are receiving SMS alerts</span>
                </div>
              )}
            </div>

            {/* How it works mini */}
            <div style={{ marginTop:18, background:"rgba(192,57,43,.04)", border:"1px solid rgba(192,57,43,.1)", borderRadius:16, padding:"20px 22px" }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:"#1a0a07", marginBottom:14, letterSpacing:-.1 }}>How donations work</h4>
              {[
                "Hospital requests blood via HemoLink",
                "System finds nearby matching donors",
                "You receive SMS with a respond link",
                "Accept → go to hospital & save a life",
              ].map((step, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom: i<3 ? 10 : 0 }}>
                  <div style={{ width:20, height:20, borderRadius:6, background:"rgba(192,57,43,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"#C0392B" }}>{i+1}</span>
                  </div>
                  <span style={{ fontSize:12.5, color:"#7A4A45", lineHeight:1.55 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
