import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import { LogoDrop, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";
import { useLocation } from "react-router-dom";

const NAV = [
  { label:"Dashboard", path:"/hospital/dashboard",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/></svg> },
  { label:"Blood Requests", path:"/hospital/requests",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1C8 1 3 6.5 3 10a5 5 0 0 0 10 0C13 6.5 8 1 8 1z" stroke={c} strokeWidth="1.3"/><path d="M5.5 11a2.5 2.5 0 0 0 2.5 2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label:"Inventory", path:"/hospital/inventory",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 5.5l6-3 6 3v7l-6 3-6-3v-7z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 2.5v13M2 5.5l6 3 6-3" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { label:"Donors Map", path:"/hospital/donors-map",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 0 1 4 4c0 4-4 8-4 8S4 10 4 6a4 4 0 0 1 4-4z" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="6" r="1.5" fill={c}/></svg> },
];

export default function HospitalShell({ children, title, subtitle, action }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Sora',sans-serif", background:"#FDF4F2" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        .hosp-nav{display:flex;align-items:center;gap:10px;padding:10px 14px;background:none;border:none;color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;border-radius:10px;text-align:left;font-family:'Sora',sans-serif;font-weight:500;transition:all .16s;width:100%;}
        .hosp-nav:hover{background:rgba(0,0,0,.18);color:#fff;}
        .hosp-nav-active{background:rgba(0,0,0,.28) !important;color:#fff !important;font-weight:700 !important;box-shadow:inset 3px 0 0 #FFB3A7;}
        .hosp-logout{display:flex;align-items:center;gap:8px;background:none;border:none;color:rgba(255,255,255,.4);font-size:13px;cursor:pointer;padding:14px 20px;font-family:'Sora',sans-serif;transition:color .18s;width:100%;}
        .hosp-logout:hover{color:rgba(255,255,255,.8);}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#E8D5D0;border-radius:3px;}
        @keyframes hl-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.4);}}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width:230, background:"linear-gradient(185deg,#8B1A1A 0%,#6B0E0E 50%,#4A0808 100%)", display:"flex", flexDirection:"column", padding:"24px 0", flexShrink:0, position:"sticky", top:0, height:"100vh", borderRight:"1px solid rgba(0,0,0,.15)", boxShadow:"4px 0 24px rgba(139,26,26,.35)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px 18px", borderBottom:"1px solid rgba(255,255,255,.1)", marginBottom:8 }}>
          <LogoDrop size={30}/>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Hemo<span style={{ color:"#FFB3A7" }}>Link</span></div>
            <div style={{ fontSize:9, color:"#FFB3A7", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, marginTop:2 }}>Hospital</div>
          </div>
        </div>

        {user?.name && (
          <div style={{ padding:"6px 20px 14px", borderBottom:"1px solid rgba(255,255,255,.1)", marginBottom:6 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", marginBottom:2 }}>Logged in as</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.85)", fontWeight:600, lineHeight:1.35 }}>{user.name}</div>
          </div>
        )}

        <nav style={{ flex:1, display:"flex", flexDirection:"column", padding:"4px 12px", gap:2 }}>
          {NAV.map(({ label, path: np, Icon }) => (
            <button key={np} className={`hosp-nav${path===np?" hosp-nav-active":""}`} onClick={()=>navigate(np)}>
              <Icon s={16} c={path===np?"#fff":"rgba(255,255,255,.6)"}/>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding:"0 12px 10px" }}>
          <LanguageSwitcher variant="light"/>
        </div>

        <button className="hosp-logout" onClick={()=>{ logout(); navigate("/hospital-login"); }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Log Out
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:"auto", height:"100vh" }}>
        {(title || action) && (
          <div style={{ padding:"28px 40px 0" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:20, borderBottom:"1px solid #F0E0DC", marginBottom:28 }}>
              <div>
                {title && <h1 style={{ fontSize:26, fontWeight:800, color:"#1a0a07", marginBottom:4, letterSpacing:-.5 }}>{title}</h1>}
                {subtitle && <p style={{ fontSize:14, color:"#7A4A45" }}>{subtitle}</p>}
              </div>
              {action}
            </div>
          </div>
        )}
        <div style={{ padding: title ? "0 40px 40px" : "28px 40px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}