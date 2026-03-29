import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import { useLang } from "../../utils/LangContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import api from "../../utils/api.js";
import { DashShell, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";
import {
  IconBlood, IconBell, IconUser, IconPhone, IconCheckCircle,
  IconCalendar, IconPin, IconHeartbeat, IconPower, IconMessage,
} from "../../utils/Icons.jsx";

const BLOOD_COLORS = {
  "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F",
  "B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483",
};

// Human-readable district names
const DISTRICT_NAMES = {
  GASABO:"Gasabo, Kigali", KICUKIRO:"Kicukiro, Kigali", NYARUGENGE:"Nyarugenge, Kigali",
  BURERA:"Burera", GAKENKE:"Gakenke", GICUMBI:"Gicumbi", MUSANZE:"Musanze", RULINDO:"Rulindo",
  GISAGARA:"Gisagara", HUYE:"Huye", KAMONYI:"Kamonyi", MUHANGA:"Muhanga",
  NYAMAGABE:"Nyamagabe", NYANZA:"Nyanza", NYARUGURU:"Nyaruguru", RUHANGO:"Ruhango",
  BUGESERA:"Bugesera", GATSIBO:"Gatsibo", KAYONZA:"Kayonza", KIREHE:"Kirehe",
  NGOMA:"Ngoma", NYAGATARE:"Nyagatare", RWAMAGANA:"Rwamagana",
  KARONGI:"Karongi", NGORORERO:"Ngororero", NYABIHU:"Nyabihu", NYAMASHEKE:"Nyamasheke",
  RUBAVU:"Rubavu", RUTSIRO:"Rutsiro", RUSIZI:"Rusizi",
};

const BASE_NAV = [
  { label:"Dashboard", path:"/donor/dashboard",
    Icon:({size,color})=><svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/></svg> },
  { label:"Notifications", path:"/donor/notifications", badge: true,
    Icon:({size,color})=><svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2v1h11v-1L12 9V6a4 4 0 0 0-4-4z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

function StatCard({ label, value, icon, color, bg, sub }) {
  return (
    <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20,
      padding:"22px 24px", display:"flex", alignItems:"center", gap:16,
      boxShadow:"0 4px 16px rgba(140,20,20,.05)", transition:"transform .2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}>
      <div style={{ width:52, height:52, borderRadius:16, background:bg,
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:"#9B7B77", textTransform:"uppercase",
          letterSpacing:.8, marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:900, color, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:"#BBA0A0", marginTop:4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function NotificationItem({ notif, onRespond, responding }) {
  const navigate = useNavigate();
  const statusColors = {
    Accepted: { bg:"rgba(30,132,73,.1)", c:"#1E8449" },
    Declined: { bg:"rgba(192,57,43,.1)", c:"#C0392B" },
    pending:  { bg:"rgba(230,126,34,.1)", c:"#B7560F" },
  };
  const sc = statusColors[notif.responseStatus] || statusColors.pending;
  const reqBlood = notif.bloodRequest?.bloodTypeCode || "—";
  const bc = BLOOD_COLORS[reqBlood] || "#C0392B";
  const hospital = notif.bloodRequest?.hospital?.name || "Hospital";
  const isPending = notif.responseStatus === "pending";

  return (
    <div style={{ padding:"14px 16px",
      background: isPending ? "rgba(255,248,240,.9)" : "rgba(253,244,242,.6)",
      borderRadius:14,
      border: isPending ? "1.5px solid rgba(230,126,34,.3)" : "1px solid #F8EDEB",
      borderLeft: isPending ? "3px solid #E67E22" : "1px solid #F8EDEB",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:14, background:`${bc}14`,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ fontSize:17, fontWeight:900, color:bc, fontFamily:"'Lora',serif" }}>{reqBlood}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1a0a07" }}>{hospital}</div>
          <div style={{ fontSize:11, color:"#9B7B77", marginTop:2 }}>
            {notif.sentAt ? new Date(notif.sentAt).toLocaleString("en-RW", { dateStyle:"medium", timeStyle:"short" }) : "—"}
          </div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20,
          background:sc.bg, color:sc.c, whiteSpace:"nowrap" }}>
          {notif.responseStatus || "pending"}
        </span>
      </div>
      {isPending && (
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <button
            onClick={() => onRespond(notif.token, "Accepted", notif.notificationId)}
            disabled={responding === notif.notificationId}
            style={{ flex:1, padding:"8px 0", background:"linear-gradient(135deg,#1E8449,#145A32)",
              color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700,
              cursor:responding===notif.notificationId?"not-allowed":"pointer",
              fontFamily:"'Sora',sans-serif", opacity:responding===notif.notificationId?.65:1,
              display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {responding===notif.notificationId ? "…" : "Can Donate"}
          </button>
          <button
            onClick={() => onRespond(notif.token, "Declined", notif.notificationId)}
            disabled={responding === notif.notificationId}
            style={{ padding:"8px 12px", background:"transparent", color:"#C0392B",
              border:"1.5px solid rgba(192,57,43,.3)", borderRadius:8, fontSize:12, fontWeight:700,
              cursor:responding===notif.notificationId?"not-allowed":"pointer",
              fontFamily:"'Sora',sans-serif" }}>
            Decline
          </button>
          <button
            onClick={() => navigate(`/donor/respond?token=${notif.token}`)}
            style={{ padding:"8px 10px", background:"rgba(192,57,43,.06)", color:"#C0392B",
              border:"1.5px solid rgba(192,57,43,.15)", borderRadius:8, fontSize:11, fontWeight:600,
              cursor:"pointer", fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>
            Map →
          </button>
        </div>
      )}
    </div>
  );
}

export default function DonorDashboard() {
  const navigate  = useNavigate();
  const { logout } = useAuth();
  const { t }     = useLang();
  const [profile, setProfile]   = useState(null);
  const [notifs,  setNotifs]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toggling,setToggling]  = useState(false);
  const [smsToggling,setSmsToggling] = useState(false);
  const [responding,setResponding] = useState(null);
  const [error,   setError]     = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/donors/profile"),
      api.get("/notifications/my").catch(() => ({ data:{ data:[] } })),
    ])
      .then(([pr, nr]) => {
        setProfile(pr.data.data);
        setNotifs(nr.data.data || []);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const toggleSmsConsent = async () => {
    if (!profile) return;
    setSmsToggling(true);
    try {
      const res = await api.put("/donors/profile", { consentSms: !profile.consentSms });
      setProfile(p => ({ ...p, consentSms: res.data.data.consentSms }));
    } catch { setError("Failed to update SMS preference."); }
    finally { setSmsToggling(false); }
  };

  const handleRespond = async (token, response_status, notifId) => {
    setResponding(notifId);
    try {
      await api.post("/notifications/respond", { token, response_status });
      setNotifs(prev => prev.map(n =>
        n.notificationId === notifId ? { ...n, responseStatus: response_status } : n
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to respond.");
    } finally { setResponding(null); }
  };

  const toggleAvailability = async () => {    if (!profile) return;
    setToggling(true);
    try {
      const res = await api.put("/donors/availability", { available: !profile.available });
      setProfile(res.data.data);
    } catch { setError("Failed to update."); }
    finally  { setToggling(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#FDF4F2", fontFamily:"'Sora',sans-serif" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:40, height:40, border:"3px solid #F0E0DC", borderTopColor:"#C0392B",
          borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
        <span style={{ fontSize:13, color:"#9B7B77" }}>Loading your dashboard…</span>
      </div>
    </div>
  );

  const firstName  = profile?.fullName?.split(" ")[0] || "Donor";
  const isAvail    = profile?.available;
  const btype      = profile?.bloodTypeCode || "—";
  const btypeColor = BLOOD_COLORS[btype] || "#C0392B";
  const acceptedCount = notifs.filter(n => n.responseStatus === "Accepted").length;
  const pendingCount  = notifs.filter(n => n.responseStatus === "pending").length;
  const recentNotifs  = [...notifs].sort((a,b) => b.notificationId - a.notificationId).slice(0, 5);

  const NAV = BASE_NAV.map(n =>
    n.badge && pendingCount > 0
      ? { ...n, label: `Notifications (${pendingCount})` }
      : n
  );

  return (
    <DashShell
      nav={NAV}
      onLogout={() => { logout(); navigate("/login"); }}
      logoLabel="Rwanda"
      userLabel={profile?.fullName?.toUpperCase()}
    >
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity:.7; }
          70%  { transform: scale(1.5); opacity:0; }
          100% { transform: scale(1.5); opacity:0; }
        }
      `}</style>

      <div style={{ padding:"36px 44px", maxWidth:1200, margin:"0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32 }}>
          <div>
            <p style={{ fontSize:13, color:"#9B7B77", fontWeight:500, marginBottom:6, letterSpacing:.3 }}>
              Welcome back,
            </p>
            <h1 style={{ fontSize:36, fontWeight:900, color:"#1a0a07", letterSpacing:-1, lineHeight:1 }}>
              {firstName}
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%",
                background: isAvail ? "#1E8449" : "#9B7B77",
                boxShadow: isAvail ? "0 0 0 3px rgba(30,132,73,.2)" : "none" }}/>
              <span style={{ fontSize:13, color: isAvail ? "#1E8449" : "#9B7B77", fontWeight:600 }}>
                {isAvail ? "Active — you are visible to hospitals" : "Inactive — you are hidden from searches"}
              </span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <LanguageSwitcher/>
            {/* Blood type badge */}
            <div style={{ padding:"10px 18px", background:`${btypeColor}12`,
              border:`2px solid ${btypeColor}33`, borderRadius:14, textAlign:"center" }}>
              <div style={{ fontSize:9, fontWeight:700, color:btypeColor, textTransform:"uppercase",
                letterSpacing:1, marginBottom:2 }}>Blood Type</div>
              <div style={{ fontSize:22, fontWeight:900, color:btypeColor, fontFamily:"'Lora',serif",
                lineHeight:1 }}>{btype}</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2",
            border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10,
            padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:24, fontWeight:500 }}>
            {error}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          <StatCard
            label="Availability Status"
            value={isAvail ? "Active" : "Inactive"}
            color={isAvail ? "#1E8449" : "#6B6B6B"}
            bg={isAvail ? "rgba(30,132,73,.1)" : "rgba(107,107,107,.08)"}
            sub={isAvail ? "Hospitals can find you" : "Toggle to become active"}
            icon={<IconHeartbeat size={24} color={isAvail ? "#1E8449" : "#6B6B6B"}/>}
          />
          <StatCard
            label="SMS Alerts"
            value={profile?.consentSms ? "Enabled" : "Disabled"}
            color="#6B3FA0"
            bg="rgba(107,63,160,.08)"
            sub={profile?.consentSms ? "Receiving notifications" : "Not receiving alerts"}
            icon={<IconBell size={24} color="#6B3FA0"/>}
          />
          <StatCard
            label="Donations Accepted"
            value={acceptedCount}
            color="#C0392B"
            bg="rgba(192,57,43,.08)"
            sub={`out of ${notifs.length} request${notifs.length !== 1 ? "s" : ""} received`}
            icon={<IconCheckCircle size={24} color="#C0392B"/>}
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24 }}>

          {/* LEFT column */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Profile card */}
            <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:22,
              padding:"28px 32px", boxShadow:"0 4px 20px rgba(140,20,20,.05)" }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", marginBottom:22,
                letterSpacing:-.2, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:"rgba(192,57,43,.08)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <IconUser size={16} color="#C0392B"/>
                </div>
                Your Profile
              </h2>
              <div style={{ display:"flex", flexDirection:"column" }}>
                {[
                  { label:"Full Name",    value:profile?.fullName, Icon:IconUser },
                  { label:"Phone",        value:profile?.phone,    Icon:IconPhone },
                  { label:"Blood Type",   value:profile?.bloodTypeCode, Icon:IconBlood },
                  { label:"Location",     value: profile?.districtCode ? (DISTRICT_NAMES[profile.districtCode] || profile.districtCode) : (profile?.latitude ? `${parseFloat(profile.latitude).toFixed(4)}, ${parseFloat(profile.longitude).toFixed(4)}` : "Not set"), Icon:IconPin },
                  { label:"Member Since", value:profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-RW", { dateStyle:"medium" })
                    : "—", Icon:IconCalendar },
                ].map(({ label, value, Icon }, i, arr) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 0", borderBottom: i < arr.length-1 ? "1px solid #F8EDEB" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:"rgba(192,57,43,.06)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon size={15} color="#C0392B"/>
                      </div>
                      <span style={{ fontSize:13, color:"#7A4A45" }}>{label}</span>
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color:"#1a0a07" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Notification history */}
            <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:22,
              padding:"28px 32px", boxShadow:"0 4px 20px rgba(140,20,20,.05)" }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", marginBottom:22,
                letterSpacing:-.2, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:"rgba(192,57,43,.08)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <IconMessage size={16} color="#C0392B"/>
                </div>
                Recent Notifications
                <button
                  onClick={() => navigate("/donor/notifications")}
                  style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:"#C0392B",
                    background:"rgba(192,57,43,.07)", border:"1px solid rgba(192,57,43,.2)",
                    borderRadius:8, padding:"4px 12px", cursor:"pointer",
                    fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>
                  View All →
                </button>
              </h2>
              {recentNotifs.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 20px", color:"#9B7B77", fontSize:13,
                  background:"rgba(192,57,43,.02)", borderRadius:14, border:"1px dashed #F0E0DC" }}>
                  <IconBell size={28} color="#E8D5D0"/>
                  <p style={{ marginTop:10 }}>No notifications yet.</p>
                  <p style={{ fontSize:11, marginTop:4, color:"#BBA0A0" }}>
                    When hospitals need your blood type, you will receive an SMS here.
                  </p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {recentNotifs.map(n => <NotificationItem key={n.notificationId} notif={n} onRespond={handleRespond} responding={responding}/>)}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* SMS consent toggle */}
            <div style={{
              background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:22,
              padding:"22px 26px", boxShadow:"0 4px 20px rgba(140,20,20,.05)",
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:14,
            }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#1a0a07", marginBottom:4 }}>SMS Alerts</div>
                <div style={{ fontSize:12, color:"#9B7B77", lineHeight:1.55 }}>
                  {profile?.consentSms ? "You'll receive SMS when your blood type is needed." : "Enable to get SMS alerts when hospitals need you."}
                </div>
              </div>
              <button
                onClick={toggleSmsConsent}
                disabled={smsToggling}
                style={{
                  position:"relative", width:48, height:26, borderRadius:13, border:"none",
                  background: profile?.consentSms ? "#6B3FA0" : "#D0C0C0",
                  cursor: smsToggling ? "not-allowed" : "pointer",
                  transition:"background .25s", flexShrink:0,
                }}
                title={profile?.consentSms ? "Disable SMS alerts" : "Enable SMS alerts"}
              >
                <div style={{
                  position:"absolute", top:3, left: profile?.consentSms ? 24 : 3,
                  width:20, height:20, borderRadius:"50%", background:"#fff",
                  boxShadow:"0 1px 4px rgba(0,0,0,.25)", transition:"left .25s",
                }}/>
              </button>
            </div>

            {/* Availability toggle */}
            <div style={{
              background:"#fff",
              border:`2px solid ${isAvail ? "#1E8449" : "#E8D5D0"}`,
              borderTop:`4px solid ${isAvail ? "#1E8449" : "#C0392B"}`,
              borderRadius:22, padding:"32px 26px",
              boxShadow:`0 8px 32px ${isAvail ? "rgba(30,132,73,.1)" : "rgba(140,20,20,.06)"}`,
              display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:18,
            }}>
              {/* Status indicator */}
              <div style={{ position:"relative", width:80, height:80 }}>
                {isAvail && (
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%",
                    background:"rgba(30,132,73,.2)", animation:"pulse-ring 2s ease-out infinite" }}/>
                )}
                <div style={{ width:80, height:80, borderRadius:"50%",
                  background: isAvail ? "rgba(30,132,73,.1)" : "rgba(192,57,43,.06)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:`2px solid ${isAvail ? "rgba(30,132,73,.3)" : "rgba(192,57,43,.15)"}` }}>
                  <IconPower size={34} color={isAvail ? "#1E8449" : "#C0392B"}/>
                </div>
              </div>

              <div>
                <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1.5,
                  color: isAvail ? "#1E8449" : "#C0392B", marginBottom:8 }}>
                  {isAvail ? "● ACTIVE" : "○ INACTIVE"}
                </div>
                <h3 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", marginBottom:8 }}>
                  {isAvail ? "You Are Available" : "You Are Unavailable"}
                </h3>
                <p style={{ fontSize:12.5, color:"#7A4A45", lineHeight:1.65 }}>
                  {isAvail
                    ? "Hospitals can find you when they need your blood type. You will receive SMS alerts."
                    : "Toggle on to be discoverable by hospitals needing blood donations in your area."}
                </p>
              </div>

              <button
                onClick={toggleAvailability}
                disabled={toggling}
                style={{
                  width:"100%", padding:"14px", borderRadius:13, fontSize:14, fontWeight:800,
                  cursor:toggling ? "not-allowed" : "pointer", fontFamily:"'Sora',sans-serif",
                  transition:"all .2s", opacity:toggling ? .65 : 1, letterSpacing:.2,
                  background: isAvail
                    ? "transparent"
                    : "linear-gradient(135deg,#1E8449,#145A32)",
                  color: isAvail ? "#C0392B" : "#fff",
                  border: isAvail ? "2px solid #C0392B" : "none",
                  boxShadow: isAvail ? "none" : "0 6px 20px rgba(30,132,73,.35)",
                }}
              >
                {toggling ? "Updating…" : isAvail ? "Mark Unavailable" : "Mark Available"}
              </button>

              {isAvail && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
                  background:"rgba(30,132,73,.06)", borderRadius:10, width:"100%" }}>
                  <IconCheckCircle size={14} color="#1E8449"/>
                  <span style={{ fontSize:11, color:"#1E8449", fontWeight:600 }}>
                    SMS alerts are active
                  </span>
                </div>
              )}
            </div>

            {/* How it works */}
            <div style={{ background:"rgba(192,57,43,.03)", border:"1px solid rgba(192,57,43,.1)",
              borderRadius:18, padding:"22px 24px" }}>
              <h4 style={{ fontSize:13, fontWeight:800, color:"#1a0a07", marginBottom:16, letterSpacing:-.1 }}>
                How it works
              </h4>
              {[
                { step:1, text:"A hospital submits a blood request via HemoLink" },
                { step:2, text:"The system finds nearby donors who match the blood type" },
                { step:3, text:"You receive an SMS with a unique link to respond" },
                { step:4, text:"Accept the request, go to the hospital, and save a life" },
              ].map(({ step, text }) => (
                <div key={step} style={{ display:"flex", alignItems:"flex-start", gap:12,
                  marginBottom: step < 4 ? 12 : 0 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:"rgba(192,57,43,.12)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:11, fontWeight:900, color:"#C0392B" }}>{step}</span>
                  </div>
                  <span style={{ fontSize:12, color:"#7A4A45", lineHeight:1.6 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Impact */}
            <div style={{ background:"linear-gradient(135deg,#C0392B,#8B1A1A)", borderRadius:18,
              padding:"22px 24px", color:"#fff" }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1,
                color:"rgba(255,255,255,.6)", marginBottom:12 }}>Your Impact</div>
              <div style={{ fontSize:36, fontWeight:900, fontFamily:"'Lora',serif", letterSpacing:-1 }}>
                {acceptedCount * 3}
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", marginTop:4 }}>
                potential lives saved
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", marginTop:6 }}>
                Each donation can save up to 3 lives
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}