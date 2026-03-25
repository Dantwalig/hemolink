import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, padding:"24px", display:"flex", flexDirection:"column", gap:12, boxShadow:"0 4px 16px rgba(140,20,20,.05)", transition:"transform .2s, box-shadow .2s" }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(140,20,20,.1)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 16px rgba(140,20,20,.05)";}}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ width:46, height:46, borderRadius:14, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={22} color={color}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:.8, background:`${color}12`, padding:"4px 10px", borderRadius:20 }}>{label}</span>
    </div>
    <div style={{ fontSize:34, fontWeight:900, color, fontFamily:"'Lora',serif", letterSpacing:-1 }}>{value}</div>
    <div style={{ fontSize:12, color:"#9B7B77" }}>{sub}</div>
  </div>
);

const IconUsers = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/><path d="M1 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M15 6a3.5 3.5 0 1 1 0 7M21 20c0-3.35-2.09-6.25-5-7.22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconHospital = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="3" y="7" width="16" height="13" rx="1.5" stroke={color} strokeWidth="1.5"/><path d="M7 20v-5h8v5M8 3h6v4H8zM9 11h4M11 9v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconWarning = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M11 2L2 19h18L11 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 9v4M11 16v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconBloodDrop = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M11 2C11 2 4 9.5 4 14a7 7 0 0 0 14 0C18 9.5 11 2 11 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 15.5A3.5 3.5 0 0 0 11 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconSms = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="2" y="3" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5"/><path d="M6 19l5-3 5 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 9h10M6 12.5h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconCheck = ({size=22,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={color} strokeWidth="1.5"/><path d="M7 11l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data.data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label:"Total Donors", value:stats.donors.total, sub:`${stats.donors.available} available to donate`, color:"#2E86C1", icon:IconUsers },
    { label:"Hospitals", value:stats.hospitals.total, sub:`${stats.hospitals.approved} approved`, color:"#1E8449", icon:IconHospital },
    { label:"Pending Approval", value:stats.hospitals.pendingApproval, sub:"hospitals awaiting review", color:stats.hospitals.pendingApproval>0?"#C0392B":"#6B6B6B", icon:IconWarning },
    { label:"Blood Requests", value:stats.requests.total, sub:`${stats.requests.pending} pending`, color:"#E67E22", icon:IconBloodDrop },
    { label:"SMS Sent", value:stats.notifications.total, sub:`${stats.notifications.accepted} accepted`, color:"#8E44AD", icon:IconSms },
    { label:"Response Rate", value:`${stats.notifications.responseRate}%`, sub:"donor acceptance rate", color:"#C0392B", icon:IconCheck },
  ] : [];

  const quickLinks = [
    { label:"Manage Hospitals", path:"/admin/hospitals", color:"#1E8449" },
    { label:"View All Donors", path:"/admin/donors", color:"#2E86C1" },
    { label:"Blood Requests", path:"/admin/requests", color:"#E67E22" },
    { label:"SMS Log", path:"/admin/sms", color:"#8E44AD" },
  ];

  return (
    <AdminShell title="Admin Dashboard" subtitle="Platform-wide overview for RBC staff.">
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:24, fontWeight:500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:16 }}>
          <div style={{ width:36, height:36, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
          <span style={{ color:"#7A4A45" }}>Loading stats…</span>
        </div>
      ) : (
        <>
          {stats?.hospitals?.pendingApproval > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fffbf0", border:"1.5px solid rgba(230,126,34,.3)", borderRadius:12, padding:"14px 18px", marginBottom:24 }}>
              <IconWarning size={18} color="#B7560F"/>
              <span style={{ fontSize:13, color:"#7A4A45", fontWeight:500 }}>
                <strong style={{ color:"#1a0a07" }}>{stats.hospitals.pendingApproval} hospital{stats.hospitals.pendingApproval>1?"s":""}</strong> pending approval.{" "}
                <button style={{ background:"none", border:"none", color:"#C0392B", fontWeight:700, cursor:"pointer", padding:0, fontFamily:"'Sora',sans-serif", fontSize:13, textDecoration:"underline" }} onClick={()=>navigate("/admin/hospitals")}>Review now →</button>
              </span>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:28 }}>
            {cards.map(c => <StatCard key={c.label} {...c}/>)}
          </div>

          {/* Quick links */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, padding:"24px 28px", boxShadow:"0 4px 16px rgba(140,20,20,.05)" }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#1a0a07", marginBottom:18, letterSpacing:-.2 }}>Quick Actions</h3>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {quickLinks.map(({ label, path, color }) => (
                <button key={path} onClick={()=>navigate(path)} style={{
                  padding:"10px 20px", borderRadius:10, border:`1.5px solid ${color}22`,
                  background:`${color}0a`, color, fontFamily:"'Sora',sans-serif",
                  fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .18s",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.transform="translateY(-1px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${color}0a`;e.currentTarget.style.transform="translateY(0)";}}>
                  {label} →
                </button>
              ))}
            </div>
          </div>

          {/* Blood gap visual */}
          {stats && (
            <div style={{ marginTop:24, background:"linear-gradient(135deg,rgba(192,57,43,.06),rgba(192,57,43,.02))", border:"1.5px solid rgba(192,57,43,.15)", borderRadius:18, padding:"24px 28px" }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#1a0a07", marginBottom:16, letterSpacing:-.1 }}>Rwanda Blood Gap (National)</h3>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ flex:1, background:"#F0E0DC", borderRadius:8, height:12, overflow:"hidden" }}>
                  <div style={{ width:`${Math.min((86/130)*100,100)}%`, height:"100%", background:"linear-gradient(90deg,#C0392B,#8B1A1A)", borderRadius:8, transition:"width 1s ease" }}/>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:"#C0392B", whiteSpace:"nowrap" }}>86K / 130K units</span>
              </div>
              <p style={{ fontSize:12, color:"#9B7B77", marginTop:8 }}>66% collection rate — 44K unit annual deficit nationally</p>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
