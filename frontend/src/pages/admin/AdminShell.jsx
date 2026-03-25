import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import { LogoDrop, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";

const NAV = [
  { label:"Dashboard", path:"/admin/dashboard",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/></svg> },
  { label:"Hospitals", path:"/admin/hospitals",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="10" rx="1" stroke={c} strokeWidth="1.3"/><path d="M5 15v-4h6v4M6 2h4v3H6zM7 8h2M8 7v2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label:"Donors", path:"/admin/donors",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.3"/><path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M11 4a2.5 2.5 0 1 1 0 5M15 14c0-2.414-1.494-4.5-3.5-4.83" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label:"Blood Requests", path:"/admin/requests",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1C8 1 3 6.5 3 10a5 5 0 0 0 10 0C13 6.5 8 1 8 1z" stroke={c} strokeWidth="1.3"/><path d="M5.5 11a2.5 2.5 0 0 0 2.5 2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label:"SMS Log", path:"/admin/sms",
    Icon:({s,c})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke={c} strokeWidth="1.3"/><path d="M4 14l4-2 4 2" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 7h8M4 9.5h5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

export default function AdminShell({ children, title, subtitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const path = window.location.pathname;

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Sora',sans-serif", background:"#FDF4F2" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        .admin-nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:none;border:none;color:rgba(255,255,255,.5);font-size:13px;cursor:pointer;border-radius:10px;text-align:left;font-family:'Sora',sans-serif;font-weight:500;transition:all .16s;width:100%;}
        .admin-nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);}
        .admin-nav-active{background:rgba(192,57,43,.32) !important;color:#fff !important;font-weight:700 !important;}
        .admin-logout{display:flex;align-items:center;gap:8px;background:none;border:none;color:rgba(255,255,255,.28);font-size:13px;cursor:pointer;padding:14px 20px;font-family:'Sora',sans-serif;transition:color .18s;width:100%;}
        .admin-logout:hover{color:rgba(255,255,255,.6);}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width:234, background:"linear-gradient(185deg,#1a0505 0%,#0a0000 100%)", display:"flex", flexDirection:"column", padding:"24px 0", flexShrink:0, position:"sticky", top:0, height:"100vh", borderRight:"1px solid rgba(192,57,43,.15)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px 18px", borderBottom:"1px solid rgba(255,255,255,.06)", marginBottom:6 }}>
          <LogoDrop size={30}/>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></div>
            <div style={{ fontSize:9, color:"#E87B6E", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, marginTop:2 }}>RBC Admin</div>
          </div>
        </div>

        {user?.email && (
          <div style={{ padding:"8px 20px 12px", borderBottom:"1px solid rgba(255,255,255,.05)", marginBottom:6 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.28)", textTransform:"uppercase", letterSpacing:.4, marginBottom:2 }}>Logged in as</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", wordBreak:"break-all" }}>{user.email}</div>
          </div>
        )}

        <nav style={{ flex:1, display:"flex", flexDirection:"column", padding:"4px 12px", gap:2 }}>
          {NAV.map(({ label, path: np, Icon }) => (
            <button key={np} className={`admin-nav-item${path===np?" admin-nav-active":""}`} onClick={()=>navigate(np)}>
              <Icon s={15} c={path===np ? "#fff" : "rgba(255,255,255,.45)"}/>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding:"0 12px 8px" }}>
          <LanguageSwitcher variant="light"/>
        </div>

        <button className="admin-logout" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Log Out
        </button>
      </aside>

      {/* Main content area */}
      <main style={{ flex:1, overflowY:"auto", height:"100vh" }}>
        {(title || subtitle) && (
          <div style={{ padding:"28px 40px 0", marginBottom:0 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", paddingBottom:20, borderBottom:"1px solid #F0E0DC", marginBottom:28 }}>
              <div>
                {title && <h1 style={{ fontSize:26, fontWeight:800, color:"#1a0a07", marginBottom:4, letterSpacing:-.5 }}>{title}</h1>}
                {subtitle && <p style={{ fontSize:14, color:"#7A4A45" }}>{subtitle}</p>}
              </div>
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
