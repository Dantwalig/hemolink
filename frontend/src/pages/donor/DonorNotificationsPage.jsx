import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import { DashShell, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";

const BLOOD_COLORS = {
  "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F",
  "B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483",
};

const BASE_NAV = [
  { label:"Dashboard", path:"/donor/dashboard",
    Icon:({size,color})=><svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3"/></svg> },
  { label:"Notifications", path:"/donor/notifications", badge:true,
    Icon:({size,color})=><svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2v1h11v-1L12 9V6a4 4 0 0 0-4-4z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

const URGENCY_COLOR = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
const STATUS_COLORS = {
  Accepted: { bg:"rgba(30,132,73,.1)", c:"#1E8449" },
  Declined: { bg:"rgba(192,57,43,.1)", c:"#C0392B" },
  pending:  { bg:"rgba(230,126,34,.1)", c:"#B7560F" },
};

export default function DonorNotificationsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [responding, setResponding] = useState(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/notifications/my")
      .then(res => setNotifs(res.data.data || []))
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

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

  const filtered = filter === "all" ? notifs
    : notifs.filter(n => n.responseStatus === filter);

  const pending  = notifs.filter(n => n.responseStatus === "pending").length;
  const accepted = notifs.filter(n => n.responseStatus === "Accepted").length;
  const NAV = BASE_NAV.map(n =>
    n.badge && pending > 0 ? { ...n, label: `Notifications (${pending})` } : n
  );

  return (
    <DashShell
      nav={NAV}
      onLogout={() => { logout(); navigate("/login"); }}
      logoLabel="Rwanda"
      userLabel=""
    >
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.35);}}
      `}</style>
      <div style={{ padding:"36px 44px", maxWidth:900, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#1a0a07", letterSpacing:-.6 }}>
            Blood Request Notifications
          </h1>
          <p style={{ fontSize:14, color:"#7A4A45", marginTop:6 }}>
            Respond to hospitals that need your blood type
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Total Received", value:notifs.length, color:"#6B3FA0" },
            { label:"Awaiting Response", value:pending, color:"#E67E22", urgent:pending>0 },
            { label:"Accepted", value:accepted, color:"#1E8449" },
          ].map(({ label, value, color, urgent }) => (
            <div key={label} style={{ background:"#fff", border:`1.5px solid ${urgent?"rgba(230,126,34,.3)":"#F0E0DC"}`,
              borderRadius:16, padding:"18px 20px", boxShadow: urgent?"0 4px 16px rgba(230,126,34,.1)":"0 2px 8px rgba(140,20,20,.04)" }}>
              {urgent && (
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", animation:"pulse 1.4s infinite" }}/>
                  <span style={{ fontSize:10, fontWeight:700, color, textTransform:"uppercase", letterSpacing:.8 }}>Needs Response</span>
                </div>
              )}
              <div style={{ fontSize:30, fontWeight:900, color, fontFamily:"'Lora',serif" }}>{value}</div>
              <div style={{ fontSize:12, color:"#9B7B77", fontWeight:500, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10,
            padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>{error}</div>
        )}

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {[["all","All"], ["pending","Pending"], ["Accepted","Accepted"], ["Declined","Declined"]].map(([f,l]) => {
            const count = f==="all" ? notifs.length : notifs.filter(n=>n.responseStatus===f).length;
            return (
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"8px 16px", borderRadius:9, border:`1.5px solid ${filter===f?"#C0392B":"#E8D5D0"}`,
                  background:filter===f?"rgba(192,57,43,.08)":"#fff", color:filter===f?"#C0392B":"#7A4A45",
                  fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:filter===f?700:500, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:6 }}>
                {l}
                <span style={{ background:filter===f?"rgba(192,57,43,.15)":"#F0E0DC",
                  color:filter===f?"#C0392B":"#9B7B77", fontSize:11, fontWeight:700,
                  padding:"1px 7px", borderRadius:20 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:14 }}>
            <div style={{ width:32, height:32, border:"3px solid #F0E0DC", borderTopColor:"#C0392B",
              borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
            <span style={{ color:"#7A4A45" }}>Loading notifications…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#9B7B77", fontSize:14,
            background:"rgba(192,57,43,.02)", borderRadius:18, border:"1.5px dashed #F0E0DC" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ marginBottom:12, opacity:.3 }}>
              <path d="M18 5a9 9 0 0 0-9 9v7l-3 4v2h24v-2l-3-4V14a9 9 0 0 0-9-9z" stroke="#C0392B" strokeWidth="2"/>
              <path d="M15 28a3 3 0 0 0 6 0" stroke="#C0392B" strokeWidth="2"/>
            </svg>
            <p>{filter==="all" ? "No notifications yet. You'll be notified when a hospital needs your blood type." : `No ${filter} notifications.`}</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filtered.map(n => {
              const req   = n.bloodRequest;
              const bc    = BLOOD_COLORS[req?.bloodTypeCode] || "#C0392B";
              const uc    = URGENCY_COLOR[req?.urgencyLevel?.toLowerCase()] || "#C0392B";
              const sc    = STATUS_COLORS[n.responseStatus] || STATUS_COLORS.pending;
              const isPending = n.responseStatus === "pending";

              return (
                <div key={n.notificationId} style={{ background:"#fff",
                  border:`1.5px solid ${isPending?"rgba(230,126,34,.25)":"#F0E0DC"}`,
                  borderLeft:`4px solid ${isPending?uc:sc.c}`,
                  borderRadius:18, padding:"22px 24px",
                  boxShadow: isPending?"0 4px 16px rgba(230,126,34,.08)":"0 2px 8px rgba(140,20,20,.04)" }}>

                  <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                    {/* Blood type badge */}
                    <div style={{ width:56, height:56, borderRadius:14, background:`${bc}12`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      border:`1.5px solid ${bc}22` }}>
                      <span style={{ fontSize:22, fontWeight:900, color:bc, fontFamily:"'Lora',serif" }}>
                        {req?.bloodTypeCode || "—"}
                      </span>
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                        <span style={{ fontSize:15, fontWeight:800, color:"#1a0a07" }}>
                          {req?.hospital?.name || "Hospital"}
                        </span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20,
                          background:`${uc}14`, color:uc, textTransform:"capitalize" }}>
                          {req?.urgencyLevel || "—"}
                        </span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20,
                          background:sc.bg, color:sc.c }}>
                          {n.responseStatus}
                        </span>
                        {isPending && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background:"#E67E22",
                              display:"inline-block", animation:"pulse 1.4s infinite" }}/>
                            <span style={{ fontSize:10, color:"#B7560F", fontWeight:700 }}>Needs your response</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display:"flex", gap:18, fontSize:12, color:"#7A4A45", marginBottom:isPending?16:0 }}>
                        <span>{req?.unitsNeeded || "?"} unit{req?.unitsNeeded!==1?"s":""} needed</span>
                        <span>Received: {new Date(n.sentAt).toLocaleString("en-RW", { dateStyle:"medium", timeStyle:"short" })}</span>
                        {req?.neededBy && <span>By: {new Date(req.neededBy).toLocaleDateString("en-RW", { dateStyle:"medium" })}</span>}
                      </div>

                      {/* Action buttons for pending */}
                      {isPending && (
                        <div style={{ display:"flex", gap:10 }}>
                          <button
                            onClick={() => handleRespond(n.token, "Accepted", n.notificationId)}
                            disabled={responding === n.notificationId}
                            style={{ flex:1, padding:"11px 0", background:"linear-gradient(135deg,#1E8449,#145A32)",
                              color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700,
                              cursor:responding===n.notificationId?"not-allowed":"pointer",
                              fontFamily:"'Sora',sans-serif", boxShadow:"0 4px 12px rgba(30,132,73,.3)",
                              opacity:responding===n.notificationId?.65:1, display:"flex",
                              alignItems:"center", justifyContent:"center", gap:6 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {responding===n.notificationId ? "Confirming…" : "Yes, I Can Donate"}
                          </button>
                          <button
                            onClick={() => handleRespond(n.token, "Declined", n.notificationId)}
                            disabled={responding === n.notificationId}
                            style={{ padding:"11px 18px", background:"transparent", color:"#C0392B",
                              border:"1.5px solid #C0392B", borderRadius:10, fontSize:13, fontWeight:700,
                              cursor:responding===n.notificationId?"not-allowed":"pointer",
                              fontFamily:"'Sora',sans-serif",
                              opacity:responding===n.notificationId?.65:1 }}>
                            Decline
                          </button>
                          <button
                            onClick={() => navigate(`/donor/respond?token=${n.token}`)}
                            style={{ padding:"11px 14px", background:"rgba(192,57,43,.06)", color:"#C0392B",
                              border:"1.5px solid rgba(192,57,43,.2)", borderRadius:10, fontSize:12, fontWeight:600,
                              cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                            View Map →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashShell>
  );
}
