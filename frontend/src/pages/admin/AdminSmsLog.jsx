import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

const RESP_STYLE = {
  pending:  { bg:"rgba(230,126,34,.1)",   color:"#B7560F",   label:"Pending" },
  Accepted: { bg:"rgba(30,132,73,.1)",    color:"#1E8449",   label:"Accepted" },
  Declined: { bg:"rgba(192,57,43,.1)",    color:"#C0392B",   label:"Declined" },
};

export default function AdminSmsLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/admin/notifications")
      .then(res => setLogs(res.data.data || []))
      .catch(() => setError("Failed to load SMS log."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter==="all" ? logs : logs.filter(l => {
    if (filter==="accepted") return l.responseStatus==="Accepted";
    if (filter==="declined") return l.responseStatus==="Declined";
    if (filter==="pending") return l.responseStatus==="pending";
    return true;
  });

  const stats = {
    total: logs.length,
    accepted: logs.filter(l=>l.responseStatus==="Accepted").length,
    declined: logs.filter(l=>l.responseStatus==="Declined").length,
    pending: logs.filter(l=>l.responseStatus==="pending").length,
  };
  const rate = stats.total>0 ? Math.round((stats.accepted/stats.total)*100) : 0;

  return (
    <AdminShell title="SMS Log" subtitle="All donor notification records and responses.">
      {error && <div style={ERR}>{error}</div>}

      {/* Mini stats */}
      <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
        {[
          { label:"Total Sent", value:stats.total, color:"#6B3FA0" },
          { label:"Accepted", value:stats.accepted, color:"#1E8449" },
          { label:"Declined", value:stats.declined, color:"#C0392B" },
          { label:"Pending", value:stats.pending, color:"#E67E22" },
          { label:"Response Rate", value:`${rate}%`, color:"#C0392B" },
        ].map(({ label, value, color })=>(
          <div key={label} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:14, padding:"16px 20px", minWidth:110, textAlign:"center", boxShadow:"0 2px 8px rgba(140,20,20,.04)" }}>
            <div style={{ fontSize:24, fontWeight:900, color, fontFamily:"'Lora',serif" }}>{value}</div>
            <div style={{ fontSize:11, color:"#9B7B77", marginTop:4, fontWeight:600, textTransform:"uppercase", letterSpacing:.6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Response rate bar */}
      <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#7A4A45", whiteSpace:"nowrap" }}>Response Rate</span>
        <div style={{ flex:1, background:"#F0E0DC", borderRadius:8, height:10, overflow:"hidden" }}>
          <div style={{ width:`${rate}%`, height:"100%", background:"linear-gradient(90deg,#C0392B,#8B1A1A)", borderRadius:8, transition:"width 1s ease" }}/>
        </div>
        <span style={{ fontSize:14, fontWeight:800, color:"#C0392B", fontFamily:"'Lora',serif" }}>{rate}%</span>
      </div>

      {/* Filter buttons */}
      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        {[["all","All"],["accepted","Accepted"],["declined","Declined"],["pending","Pending"]].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"8px 16px", borderRadius:9, border:`1.5px solid ${filter===f?"#C0392B":"#E8D5D0"}`, background:filter===f?"rgba(192,57,43,.08)":"#fff", color:filter===f?"#C0392B":"#7A4A45", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:filter===f?700:500, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#9B7B77" }}>Loading SMS log…</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px", color:"#9B7B77", fontSize:13 }}>No records found.</div>
          ) : filtered.map(log => {
            const rs = RESP_STYLE[log.responseStatus] || { bg:"rgba(107,107,107,.1)", color:"#6B6B6B", label:log.responseStatus };
            const isOpen = expanded===log.notificationId;
            return (
              <div key={log.notificationId} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 8px rgba(140,20,20,.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", cursor:"pointer" }}
                  onClick={()=>setExpanded(isOpen?null:log.notificationId)}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(192,57,43,.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke="#C0392B" strokeWidth="1.3"/><path d="M4 14l4-2 4 2" stroke="#C0392B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <span style={{ fontSize:14, fontWeight:700, color:"#1a0a07" }}>{log.donor?.fullName || "Donor"}</span>
                      <span style={{ fontSize:12, color:"#9B7B77", marginLeft:10 }}>{log.donor?.phone}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:12, color:"#9B7B77" }}>{log.sentAt ? new Date(log.sentAt).toLocaleString("en-RW",{dateStyle:"short",timeStyle:"short"}) : "—"}</span>
                    <span style={{ background:rs.bg, color:rs.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{rs.label}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform:isOpen?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}><path d="M3 5l4 4 4-4" stroke="#9B7B77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                {isOpen && log.smsMessage && (
                  <div style={{ padding:"0 18px 16px", borderTop:"1px solid #F8EDEB" }}>
                    <div style={{ fontSize:11, color:"#7A4A45", fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:8, marginTop:12 }}>SMS Message</div>
                    <div style={{ background:"rgba(192,57,43,.04)", border:"1px solid rgba(192,57,43,.1)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#1a0a07", lineHeight:1.65, fontFamily:"monospace" }}>
                      {log.smsMessage}
                    </div>
                    {log.token && (
                      <div style={{ marginTop:8, fontSize:11, color:"#9B7B77" }}>
                        Token: <span style={{ fontFamily:"monospace", color:"#6B3FA0" }}>{log.token.substring(0,24)}…</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

const ERR = { display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 };
