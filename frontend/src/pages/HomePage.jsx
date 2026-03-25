import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../utils/LangContext.jsx";
import LanguageSwitcher from "../utils/LanguageSwitcher.jsx";
import { IconCheckCircle } from "../utils/Icons.jsx";

function LogoDrop({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      background: "linear-gradient(135deg, #C0392B 0%, #8B1A1A 100%)",
      borderRadius: "50% 50% 50% 0",
      transform: "rotate(-45deg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 16px rgba(192,57,43,0.4)",
      flexShrink: 0,
    }}>
      <span style={{
        transform: "rotate(45deg)", color: "#fff", fontWeight: 900,
        fontSize: size * 0.38, fontFamily: "'Sora', sans-serif", lineHeight: 1,
      }}>H</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.55;transform:scale(1.4);}}
        @keyframes floatDrop{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes bloodFall{0%{transform:translateY(-40px);opacity:0;}8%{opacity:.6;}90%{opacity:.35;}100%{transform:translateY(520px);opacity:0;}}
        .hl-nav-btn{background:none;border:1.5px solid #E8D5D0;border-radius:9px;padding:8px 15px;font-size:13px;font-weight:600;cursor:pointer;color:#1a0a07;font-family:'Sora',sans-serif;transition:all .18s;white-space:nowrap;}
        .hl-nav-btn:hover{border-color:#C0392B;color:#C0392B;background:rgba(192,57,43,.04);}
        .hl-nav-primary{background:linear-gradient(135deg,#C0392B,#8B1A1A);border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;color:#fff;font-family:'Sora',sans-serif;box-shadow:0 4px 12px rgba(192,57,43,.35);transition:all .18s;white-space:nowrap;}
        .hl-nav-primary:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(192,57,43,.45);}
        .hl-btn-primary{background:linear-gradient(135deg,#C0392B,#8B1A1A);color:#fff;border:none;border-radius:12px;padding:16px 32px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 8px 24px rgba(192,57,43,.4);transition:all .22s;white-space:nowrap;}
        .hl-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(192,57,43,.5);}
        .hl-btn-outline{background:transparent;color:#C0392B;border:2px solid #C0392B;border-radius:12px;padding:15px 28px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .22s;white-space:nowrap;}
        .hl-btn-outline:hover{background:rgba(192,57,43,.05);transform:translateY(-2px);}
        .hl-step-card{background:#fff;border:1.5px solid #F0E0DC;border-radius:20px;padding:36px 30px;flex:1;min-width:240px;max-width:310px;text-align:left;transition:all .24s;}
        .hl-step-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(192,57,43,.12);border-color:#C0392B;}
        .hl-stat{text-align:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:24px 36px;transition:all .22s;backdrop-filter:blur(4px);}
        .hl-stat:hover{background:rgba(255,255,255,.18);transform:scale(1.03);}
        .hl-cta-btn{background:linear-gradient(135deg,#C0392B,#8B1A1A);color:#fff;border:none;border-radius:14px;padding:18px 48px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 8px 28px rgba(192,57,43,.45);transition:all .22s;}
        .hl-cta-btn:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(192,57,43,.55);}
        .hl-admin-link{background:none;border:none;color:#BBA0A0;font-size:11px;cursor:pointer;padding:0;font-family:'Sora',sans-serif;font-weight:500;}
        .hl-admin-link:hover{color:#C0392B;}
      `}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <LogoDrop size={34} />
          <span style={S.logoText}>
            Hemo<span style={{color:"#C0392B"}}>Link</span>{" "}
            <span style={{fontWeight:300,color:"#8B5A55"}}>Rwanda</span>
          </span>
        </div>
        <nav style={S.nav}>
          <button className="hl-nav-btn" onClick={() => navigate("/login")}>{t("nav.donorLogin")}</button>
          <button className="hl-nav-btn" onClick={() => navigate("/hospital-login")}>{t("nav.hospitalLogin")}</button>
          <button className="hl-nav-primary" onClick={() => navigate("/register")}>{t("nav.registerDonor")}</button>
          <LanguageSwitcher />
        </nav>
      </header>

      {/* Hero */}
      <section style={S.hero}>
        {/* Falling blood drops */}
        <div style={S.dropsWrap}>
          {[[8,0,14],[18,1.4,10],[80,0.7,12],[88,2.1,16],[94,3.3,10]].map(([l,d,sz],i)=>(
            <div key={i} style={{position:"absolute",left:`${l}%`,top:0,animation:`bloodFall 4.5s ${d}s ease-in infinite`}}>
              <svg width={sz} height={sz*1.3} viewBox="0 0 20 26" fill="none">
                <path d="M10 1C10 1 2 10 2 16a8 8 0 0 0 16 0C18 10 10 1 10 1z" fill="#C0392B" opacity="0.35"/>
                <path d="M6 17a4 4 0 0 0 4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          ))}
        </div>

        <div style={{...S.heroContent, animation:"fadeInUp .7s ease both"}}>
          <div style={S.badge}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#C0392B",display:"inline-block",animation:"pulse 1.5s infinite"}}/>
            <span>{t("home.badge")}</span>
          </div>
          <h1 style={S.heroTitle}>
            {t("home.heroTitle")}{" "}
            <em style={{fontStyle:"italic",fontFamily:"'Lora',serif",fontWeight:600,color:"#C0392B",fontSize:"1.05em"}}>
              {t("home.heroTitleEm")}
            </em>{" "}
            {t("home.heroTitleEnd")}
          </h1>
          <p style={S.heroSub}>{t("home.heroSubtitle")}</p>
          <div style={S.heroBtns}>
            <button className="hl-btn-primary" onClick={() => navigate("/register")}>{t("home.heroCta")} →</button>
            <button className="hl-btn-outline" onClick={() => navigate("/hospital-login")}>{t("home.hospitalPortal")}</button>
          </div>
        </div>

        <div style={{...S.heroVisual, animation:"fadeInUp .9s .2s ease both"}}>
          <div style={S.glowOrb}/>
          <div style={{animation:"floatDrop 5s ease-in-out infinite", position:"relative", zIndex:1}}>
            <svg width="170" height="210" viewBox="0 0 180 220" fill="none"
              style={{filter:"drop-shadow(0 20px 40px rgba(192,57,43,.42))"}}>
              <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z" fill="url(#bg1)"/>
              <path d="M55 148a35 35 0 0 0 35 35" stroke="rgba(255,255,255,.28)" strokeWidth="3" strokeLinecap="round"/>
              <text x="90" y="166" textAnchor="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="'Sora',sans-serif">H</text>
              <defs>
                <linearGradient id="bg1" x1="0" y1="0" x2="180" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D44235"/>
                  <stop offset="100%" stopColor="#6B0F0F"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{...S.heroCard, animation:"floatDrop 5s .5s ease-in-out infinite", position:"relative", zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:8}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#1E8449",display:"inline-block",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:1.2,color:"#7A4A45",fontWeight:600}}>{t("home.bloodNeeded")}</span>
            </div>
            <div style={{fontSize:56,fontWeight:900,color:"#C0392B",fontFamily:"'Lora',serif",lineHeight:1,marginBottom:8,textShadow:"0 2px 12px rgba(192,57,43,.3)"}}>O+</div>
            <div style={{fontSize:13,color:"#1a0a07",fontWeight:500,marginBottom:5}}>Kigali University Hospital</div>
            <div style={{fontSize:11,color:"#1E8449",fontWeight:600,letterSpacing:.3}}>{t("home.alertSent")}</div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={S.statsSection}>
        <div style={{marginBottom:-2}}>
          <svg viewBox="0 0 1440 40" fill="none" style={{display:"block",width:"100%"}}><path d="M0 40L1440 0V40H0Z" fill="#9B1515"/></svg>
        </div>
        <div style={{background:"linear-gradient(135deg,#C0392B,#8B1A1A)",padding:"44px 48px"}}>
          <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            {(t("home.stats")||[]).map((s,i)=>(
              <div key={i} className="hl-stat">
                <span style={{display:"block",fontSize:36,fontWeight:900,color:"#fff",fontFamily:"'Lora',serif",letterSpacing:-1}}>{s.num}</span>
                <span style={{display:"block",fontSize:11,color:"rgba(255,255,255,.65)",marginTop:6,textTransform:"uppercase",letterSpacing:.8,fontWeight:500}}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:-2}}>
          <svg viewBox="0 0 1440 40" fill="none" style={{display:"block",width:"100%"}}><path d="M0 0L1440 40V0H0Z" fill="#9B1515"/></svg>
        </div>
      </section>

      {/* How it works */}
      <section style={{padding:"96px 72px",textAlign:"center",background:"#fff"}}>
        <div style={{marginBottom:60}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:14,color:"#C0392B",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:2}}>
            <div style={{width:32,height:2,background:"linear-gradient(90deg,transparent,#C0392B)",borderRadius:2}}/>
            <span>Process</span>
            <div style={{width:32,height:2,background:"linear-gradient(90deg,#C0392B,transparent)",borderRadius:2}}/>
          </div>
          <h2 style={{fontSize:40,fontWeight:800,marginBottom:14,color:"#1a0a07",letterSpacing:-.5}}>{t("home.howTitle")}</h2>
          <p style={{fontSize:16,color:"#7A4A45",lineHeight:1.7}}>{t("home.howSub")}</p>
        </div>

        <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
          {(t("home.steps")||[]).map((s,i)=>(
            <div key={i} className="hl-step-card">
              <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,rgba(192,57,43,.12),rgba(192,57,43,.06))",border:"1.5px solid rgba(192,57,43,.2)",fontSize:18,fontWeight:900,color:"#C0392B",marginBottom:18,fontFamily:"'Lora',serif"}}>
                {s.step}
              </div>
              <div style={{marginBottom:14}}>
                {i===0 && <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 8h20M4 8v14a2 2 0 002 2h16a2 2 0 002-2V8" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 13v5M11.5 15.5h5" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"/></svg>}
                {i===1 && <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="#C0392B" strokeWidth="1.8"/><path d="M14 9v5l3.5 3.5" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {i===2 && <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="14" height="16" rx="2" stroke="#C0392B" strokeWidth="1.8"/><path d="M8 11h6M8 14h4M18 10l4 4-4 4" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <h3 style={{fontSize:17,fontWeight:700,marginBottom:10,color:"#1a0a07"}}>{s.title}</h3>
              <p style={{fontSize:14,color:"#7A4A45",lineHeight:1.75}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{background:"linear-gradient(135deg,#1a0a07 0%,#2D1010 60%,#1a0a07 100%)",padding:"100px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-60%)",pointerEvents:"none",zIndex:0,opacity:.06}}>
          <svg width="280" height="340" viewBox="0 0 180 220" fill="none">
            <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z" fill="white"/>
          </svg>
        </div>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
          <h2 style={{fontSize:44,fontWeight:800,color:"#fff",letterSpacing:-.5}}>{t("home.ctaTitle")}</h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,.6)",lineHeight:1.7,maxWidth:460}}>{t("home.ctaSub")}</p>
          <button className="hl-cta-btn" onClick={() => navigate("/register")}>{t("home.ctaBtn")} →</button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <IconCheckCircle size={14} color="rgba(255,255,255,0.4)"/>
            <span style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Free · Secure · Rwanda-wide</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <LogoDrop size={26}/>
          <span style={{fontWeight:700,fontSize:14,color:"#1a0a07"}}>HemoLink Rwanda</span>
        </div>
        <span style={{fontSize:12,color:"#9B7B77"}}>{t("home.footer")}</span>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <LanguageSwitcher />
          <button className="hl-admin-link" onClick={() => navigate("/admin/login")}>{t("nav.rbcStaff")}</button>
        </div>
      </footer>
    </div>
  );
}

const S = {
  page:{fontFamily:"'Sora',sans-serif",background:"#FDF4F2",minHeight:"100vh",display:"flex",flexDirection:"column",color:"#1a0a07",overflowX:"hidden"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 48px",background:"rgba(255,255,255,.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F0E0DC",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(140,20,20,.06)"},
  logo:{display:"flex",alignItems:"center",gap:10},
  logoText:{fontWeight:800,fontSize:19,letterSpacing:-.5,color:"#1a0a07"},
  nav:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"},
  hero:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"90px 72px 80px",gap:60,flex:1,position:"relative",background:"radial-gradient(ellipse at 70% 50%,rgba(192,57,43,.06) 0%,transparent 60%),#FDF4F2",overflow:"hidden"},
  dropsWrap:{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden"},
  heroContent:{flex:1,maxWidth:580},
  badge:{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(192,57,43,.08)",border:"1px solid rgba(192,57,43,.2)",borderRadius:24,padding:"7px 16px",marginBottom:28,fontSize:12,fontWeight:600,color:"#C0392B",letterSpacing:.3},
  heroTitle:{fontSize:52,fontWeight:800,lineHeight:1.12,marginBottom:22,color:"#1a0a07"},
  heroSub:{fontSize:16,color:"#7A4A45",lineHeight:1.8,marginBottom:40,maxWidth:500},
  heroBtns:{display:"flex",gap:14,flexWrap:"wrap"},
  heroVisual:{flex:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,position:"relative",minWidth:280},
  glowOrb:{position:"absolute",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(192,57,43,.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  heroCard:{background:"#fff",border:"1.5px solid #F0E0DC",borderRadius:18,padding:"20px 28px",boxShadow:"0 8px 40px rgba(140,20,20,.12)",textAlign:"center",minWidth:250},
  statsSection:{position:"relative",overflow:"hidden"},
  footer:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 48px",background:"#fff",borderTop:"1px solid #F0E0DC",flexWrap:"wrap",gap:12},
};
