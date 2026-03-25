// Shared HemoLink UI primitives — used across all pages
import React from "react";

export function LogoDrop({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size,
      background: "linear-gradient(135deg,#C0392B,#8B1A1A)",
      borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 14px rgba(192,57,43,.38)", flexShrink: 0,
    }}>
      <span style={{
        transform: "rotate(45deg)", color: "#fff", fontWeight: 900,
        fontSize: size * 0.38, fontFamily: "'Sora',sans-serif", lineHeight: 1,
      }}>H</span>
    </div>
  );
}

export function HLSpinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:16, fontFamily:"'Sora',sans-serif" }}>
      <style>{`@keyframes hl-spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ width:38, height:38, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
      <span style={{ fontSize:13, color:"#9B7B77", fontWeight:500 }}>Loading…</span>
    </div>
  );
}

export function HLAlert({ children, type = "error" }) {
  const colors = {
    error:   { bg:"#fff2f2", border:"rgba(192,57,43,.25)", color:"#C0392B" },
    warning: { bg:"#fffbf0", border:"rgba(230,126,34,.3)", color:"#B7560F" },
    success: { bg:"#f0faf4", border:"rgba(30,132,73,.3)", color:"#1E7040" },
  }[type] || {};
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:colors.bg, border:`1.5px solid ${colors.border}`, borderRadius:10, padding:"12px 16px", fontSize:13, color:colors.color, fontWeight:500, marginBottom:4 }}>
      {children}
    </div>
  );
}

export const SORA_FONT = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`;

export const SHARED_BTN_CSS = `
  .hl-submit{width:100%;padding:14px;background:linear-gradient(135deg,#C0392B,#8B1A1A);color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 6px 20px rgba(192,57,43,.38);transition:all .2s;letter-spacing:.1px;}
  .hl-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(192,57,43,.48);}
  .hl-submit:disabled{opacity:.65;cursor:not-allowed;}
  .hl-link{background:none;border:none;color:#C0392B;font-weight:600;cursor:pointer;font-size:13px;padding:0;font-family:'Sora',sans-serif;text-decoration:underline;text-underline-offset:2px;}
  .hl-link:hover{color:#8B1A1A;}
  .hl-back{background:none;border:1.5px solid #E8D5D0;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#7A4A45;font-family:'Sora',sans-serif;transition:all .18s;}
  .hl-back:hover{border-color:#C0392B;color:#C0392B;}
  .hl-ghost{background:none;border:1.5px solid #E8D5D0;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;color:#4A2020;font-family:'Sora',sans-serif;transition:all .18s;white-space:nowrap;}
  .hl-ghost:hover{border-color:#C0392B;color:#C0392B;background:rgba(192,57,43,.04);}
  .hl-btn-red{background:linear-gradient(135deg,#C0392B,#8B1A1A);border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;color:#fff;font-family:'Sora',sans-serif;box-shadow:0 4px 12px rgba(192,57,43,.35);transition:all .18s;white-space:nowrap;}
  .hl-btn-red:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(192,57,43,.45);}
  .hl-btn-red:disabled{opacity:.65;cursor:not-allowed;transform:none;}
  input::placeholder{color:#BBA0A0;}
  input:focus{outline:none;border-color:#C0392B !important;box-shadow:0 0 0 3px rgba(192,57,43,.1);}
  select:focus{outline:none;border-color:#C0392B !important;box-shadow:0 0 0 3px rgba(192,57,43,.1);}
  @keyframes hl-spin{to{transform:rotate(360deg);}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @keyframes bloodFall{0%{transform:translateY(-40px);opacity:0;}8%{opacity:.5;}90%{opacity:.25;}100%{transform:translateY(100vh);opacity:0;}}
`;

// Auth page layout: left blood panel + right form
export function AuthLayout({ panelTitle, panelSub, panelStats, children }) {
  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Sora',sans-serif", background:"#FDF4F2" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>
      {/* Left panel */}
      <div style={{ width:340, background:"linear-gradient(160deg,#C0392B 0%,#7D1212 100%)", position:"relative", overflow:"hidden", flexShrink:0, display:"flex", flexDirection:"column" }}>
        {/* Falling drops */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          {[[12,0],[30,1.6],[52,3.1],[72,0.9],[90,2.4]].map(([l,d],i)=>(
            <div key={i} style={{ position:"absolute", left:`${l}%`, top:0, animation:`bloodFall 5s ${d}s ease-in infinite` }}>
              <svg width="13" height="17" viewBox="0 0 20 26" fill="none">
                <path d="M10 1C10 1 2 10 2 16a8 8 0 0 0 16 0C18 10 10 1 10 1z" fill="rgba(255,255,255,.18)"/>
              </svg>
            </div>
          ))}
        </div>
        {/* Content */}
        <div style={{ position:"relative", zIndex:1, padding:"48px 36px", display:"flex", flexDirection:"column", justifyContent:"center", height:"100%", gap:32 }}>
          <div>
            {/* Big drop graphic */}
            <div style={{ marginBottom:28 }}>
              <svg width="90" height="112" viewBox="0 0 180 220" fill="none" style={{ filter:"drop-shadow(0 10px 30px rgba(0,0,0,.3))" }}>
                <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z" fill="rgba(255,255,255,.14)"/>
                <path d="M55 148a35 35 0 0 0 35 35" stroke="rgba(255,255,255,.2)" strokeWidth="3" strokeLinecap="round"/>
                <text x="90" y="166" textAnchor="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="'Sora',sans-serif" opacity=".9">H</text>
              </svg>
            </div>
            <h2 style={{ fontSize:24, fontWeight:800, color:"#fff", marginBottom:10, lineHeight:1.2 }}>{panelTitle}</h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.62)", lineHeight:1.75, maxWidth:270 }}>{panelSub}</p>
          </div>
          {panelStats && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {panelStats.map(([n,l],i)=>(
                <div key={i} style={{ padding:"14px 18px", background:"rgba(255,255,255,.1)", borderRadius:12, border:"1px solid rgba(255,255,255,.14)" }}>
                  <span style={{ display:"block", fontSize:20, fontWeight:800, color:"#fff" }}>{n}</span>
                  <span style={{ display:"block", fontSize:11, color:"rgba(255,255,255,.52)", textTransform:"uppercase", letterSpacing:.7, marginTop:3 }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Right: form */}
      {children}
    </div>
  );
}

// Shared input field styles
export function inputStyle(hasErr, hasVal) {
  return {
    width:"100%", padding:"13px 14px 13px 40px",
    border:`1.5px solid ${hasErr ? "#C0392B" : hasVal ? "#1E8449" : "#E8D5D0"}`,
    borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif",
    background: hasErr ? "#fff8f8" : "#fff",
    color:"#1a0a07", transition:"border-color .18s",
  };
}

export function inputStyleNoIcon(hasErr, hasVal) {
  return {
    width:"100%", padding:"13px 14px",
    border:`1.5px solid ${hasErr ? "#C0392B" : hasVal ? "#1E8449" : "#E8D5D0"}`,
    borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif",
    background: hasErr ? "#fff8f8" : "#fff",
    color:"#1a0a07", transition:"border-color .18s",
  };
}

export const LABEL = { display:"block", fontSize:13, fontWeight:600, color:"#4A2020", marginBottom:8, letterSpacing:.2 };
export const ERR_MSG = { display:"block", fontSize:12, color:"#C0392B", marginTop:6, fontWeight:500 };
export const INPUT_ICON = { position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex", alignItems:"center" };

// Shared dashboard shell for Hospital & Donor
export function DashShell({ nav, user, onLogout, children, logoLabel = "Rwanda", userLabel }) {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Sora',sans-serif", background:"#FDF4F2" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        .hl-nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:none;border:none;color:rgba(255,255,255,.55);font-size:13.5px;cursor:pointer;border-radius:10px;text-align:left;font-family:'Sora',sans-serif;font-weight:500;transition:all .16s;width:100%;}
        .hl-nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85);}
        .hl-nav-active{background:rgba(192,57,43,.32) !important;color:#fff !important;font-weight:700 !important;}
        .hl-logout{display:flex;align-items:center;gap:8px;background:none;border:none;color:rgba(255,255,255,.3);font-size:13px;cursor:pointer;padding:14px 20px;font-family:'Sora',sans-serif;transition:color .18s;}
        .hl-logout:hover{color:rgba(255,255,255,.65);}
      `}</style>
      {/* Sidebar */}
      <aside style={{ width:230, background:"linear-gradient(185deg,#1a0505 0%,#0f0000 100%)", display:"flex", flexDirection:"column", padding:"24px 0", flexShrink:0, position:"sticky", top:0, height:"100vh", borderRight:"1px solid rgba(192,57,43,.15)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px 18px", borderBottom:"1px solid rgba(255,255,255,.07)", marginBottom:8 }}>
          <LogoDrop size={30}/>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Hemo<span style={{ color:"#C0392B" }}>Link</span></div>
            <div style={{ fontSize:9, color:"#E87B6E", textTransform:"uppercase", letterSpacing:1, fontWeight:700, marginTop:2 }}>{logoLabel}</div>
          </div>
        </div>
        {userLabel && <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", padding:"6px 20px 12px", letterSpacing:.3 }}>{userLabel}</div>}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", padding:"4px 12px", gap:2 }}>
          {nav.map(({ label, path: np, Icon }) => (
            <button key={np} className={`hl-nav-item${path === np ? " hl-nav-active" : ""}`} onClick={() => window.location.href = np}>
              <Icon size={16} color={path === np ? "#fff" : "rgba(255,255,255,.5)"}/>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="hl-logout" onClick={onLogout}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Log Out</span>
        </button>
      </aside>
      {/* Main */}
      <main style={{ flex:1, overflowY:"auto", height:"100vh" }}>{children}</main>
    </div>
  );
}
