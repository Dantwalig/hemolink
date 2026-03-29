import React from "react";
import { useNavigate } from "react-router-dom";
import { SORA_FONT, SHARED_BTN_CSS } from "../utils/HLComponents.jsx";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", background:"#FDF4F2", fontFamily:"'Sora',sans-serif", padding:"40px 24px", textAlign:"center" }}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style>

      {/* Big blood drop with 404 */}
      <div style={{ position:"relative", marginBottom:32 }}>
        <svg width="140" height="170" viewBox="0 0 180 220" fill="none"
          style={{ filter:"drop-shadow(0 16px 32px rgba(192,57,43,.25))" }}>
          <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z"
            fill="url(#nf404)" opacity="0.15"/>
          <path d="M90 10C90 10 20 90 20 140a70 70 0 0 0 140 0C160 90 90 10 90 10z"
            stroke="#C0392B" strokeWidth="3" fill="none"/>
          <defs>
            <linearGradient id="nf404" x1="0" y1="0" x2="180" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C0392B"/>
              <stop offset="100%" stopColor="#8B1A1A"/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", paddingTop:30 }}>
          <span style={{ fontSize:52, fontWeight:900, color:"#C0392B", fontFamily:"'Lora',serif",
            letterSpacing:-2 }}>404</span>
        </div>
      </div>

      <h1 style={{ fontSize:28, fontWeight:800, color:"#1a0a07", marginBottom:12, letterSpacing:-.5 }}>
        Page not found
      </h1>
      <p style={{ fontSize:15, color:"#7A4A45", lineHeight:1.7, maxWidth:380, marginBottom:36 }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to saving lives.
      </p>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button className="hl-btn-red" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
        <button className="hl-ghost" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>

      <div style={{ marginTop:48, display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { label:"Donor Login", path:"/login" },
          { label:"Hospital Login", path:"/hospital-login" },
          { label:"Register as Donor", path:"/register" },
        ].map(({ label, path }) => (
          <button key={path} onClick={() => navigate(path)}
            style={{ background:"none", border:"none", color:"#C0392B", fontWeight:600,
              fontSize:13, cursor:"pointer", fontFamily:"'Sora',sans-serif",
              textDecoration:"underline", textUnderlineOffset:3 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
