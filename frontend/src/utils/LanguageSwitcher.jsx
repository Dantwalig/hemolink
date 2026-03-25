import React, { useState, useRef, useEffect } from "react";
import { useLang } from "./LangContext.jsx";

export default function LanguageSwitcher({ variant = "default" }) {
  const { lang, changeLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = languages.find((l) => l.code === lang) || languages[0];

  const isLight = variant === "light";

  const wrapStyle = {
    position: "relative",
    display: "inline-block",
    zIndex: 200,
  };

  const triggerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    border: isLight
      ? "1px solid rgba(255,255,255,0.3)"
      : "1.5px solid #E8D5D0",
    background: isLight ? "rgba(255,255,255,0.12)" : "#fff",
    color: isLight ? "#fff" : "#1a0a07",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.18s ease",
    backdropFilter: "blur(8px)",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#fff",
    border: "1.5px solid #E8D5D0",
    borderRadius: 10,
    padding: "4px",
    minWidth: 140,
    boxShadow: "0 8px 32px rgba(140,20,20,0.12)",
    display: open ? "block" : "none",
    animation: open ? "dropIn 0.15s ease" : "none",
  };

  const optionStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    borderRadius: 7,
    cursor: "pointer",
    background: isActive ? "#FFF0EE" : "transparent",
    transition: "background 0.12s",
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#C0392B" : "#1a0a07",
    fontFamily: "'Sora', sans-serif",
  });

  const GlobeIcon = () => (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5C8 1.5 5.5 4.5 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4.5 10.5 8S8 14.5 8 14.5M1.5 8h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );

  const ChevronIcon = () => (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const CheckIcon = () => (
    <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <path d="M2.5 6.5l3 3 5-5" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div ref={ref} style={wrapStyle}>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <button
        style={triggerStyle}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isLight
            ? "rgba(255,255,255,0.22)"
            : "#FFF0EE";
          e.currentTarget.style.borderColor = isLight
            ? "rgba(255,255,255,0.5)"
            : "#C0392B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isLight
            ? "rgba(255,255,255,0.12)"
            : "#fff";
          e.currentTarget.style.borderColor = isLight
            ? "rgba(255,255,255,0.3)"
            : "#E8D5D0";
        }}
      >
        <GlobeIcon />
        <span>{current.label}</span>
        <span style={{ color: isLight ? "rgba(255,255,255,0.7)" : "#9B9B9B" }}>
          <ChevronIcon />
        </span>
      </button>

      <div style={dropdownStyle}>
        {languages.map((l) => (
          <div
            key={l.code}
            style={optionStyle(l.code === lang)}
            onClick={() => {
              changeLang(l.code);
              setOpen(false);
            }}
            onMouseEnter={(e) => {
              if (l.code !== lang) e.currentTarget.style.background = "#FFF8F7";
            }}
            onMouseLeave={(e) => {
              if (l.code !== lang) e.currentTarget.style.background = "transparent";
            }}
          >
            <span>{l.name}</span>
            {l.code === lang && <CheckIcon />}
          </div>
        ))}
      </div>
    </div>
  );
}
