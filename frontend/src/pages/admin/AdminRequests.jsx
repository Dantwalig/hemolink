import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

const URGENCY_COLOR = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
const STATUS_STYLE = {
  pending:   { bg:"rgba(230,126,34,.1)",   color:"#B7560F" },
  fulfilled: { bg:"rgba(30,132,73,.1)",    color:"#1E8449" },
  cancelled: { bg:"rgba(192,57,43,.1)",    color:"#C0392B" },
};
const BLOOD_COLORS = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };

function Badge({ label, style: s }) {
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textTransform:"capitalize", ...s }}>{label}</span>;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/admin/requests")
      .then(res => setRequests(res.data.data || []))
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter==="all" ? requests : requests.filter(r=>r.statusCode===filter);

  return (
    <AdminShell title="Blood Requests" subtitle={`${requests.length} total blood requests across all hospitals.`}>
      {error && <div style={ERR}>{error}</div>}

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {["all","pending","fulfilled","cancelled"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"8px 16px", borderRadius:9, border:`1.5px solid ${filter===f?"#C0392B":"#E8D5D0"}`, background:filter===f?"rgba(192,57,43,.08)":"#fff", color:filter===f?"#C0392B":"#7A4A45", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:filter===f?700:500, cursor:"pointer" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft:"auto", padding:"8px 14px", fontSize:13, fontWeight:700, color:"#C0392B", background:"rgba(192,57,43,.06)", borderRadius:9 }}>{filtered.length} results</span>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#9B7B77" }}>Loading…</div>
      ) : (
        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 16px rgba(140,20,20,.05)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(192,57,43,.04)", borderBottom:"1.5px solid #F0E0DC" }}>
                {["Hospital","Blood Type","Units","Urgency","Status","Needed By","Notified","Created"].map(h=>(
                  <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#7A4A45", textTransform:"uppercase", letterSpacing:.7 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={8} style={{ textAlign:"center", padding:"48px", color:"#9B7B77", fontSize:13 }}>No requests found.</td></tr>
              ) : filtered.map((r,i)=>{
                const color = BLOOD_COLORS[r.bloodTypeCode] || "#C0392B";
                const ss = STATUS_STYLE[r.statusCode] || { bg:"rgba(107,107,107,.1)", color:"#6B6B6B" };
                const uc = URGENCY_COLOR[r.urgencyLevel?.toLowerCase()] || "#C0392B";
                return (
                  <tr key={r.requestId} style={{ borderBottom:"1px solid #F8EDEB", background:i%2===0?"#fff":"rgba(253,244,242,.4)" }}>
                    <td style={TD}><span style={{ fontWeight:600, color:"#1a0a07", fontSize:13 }}>{r.hospital?.name || "—"}</span></td>
                    <td style={TD}><span style={{ background:`${color}14`, color, fontWeight:800, fontSize:13, padding:"3px 10px", borderRadius:20, fontFamily:"'Lora',serif" }}>{r.bloodTypeCode}</span></td>
                    <td style={TD}><span style={{ fontWeight:700, color:"#1a0a07" }}>{r.unitsNeeded}</span></td>
                    <td style={TD}><Badge label={r.urgencyLevel} style={{ background:`${uc}14`, color:uc }}/></td>
                    <td style={TD}><Badge label={r.statusCode} style={{ background:ss.bg, color:ss.color }}/></td>
                    <td style={TD}><span style={{ fontSize:12, color:"#7A4A45" }}>{r.neededBy ? new Date(r.neededBy).toLocaleDateString("en-RW") : "—"}</span></td>
                    <td style={TD}><span style={{ fontSize:13, fontWeight:600, color:"#6B3FA0" }}>{r.notifications?.length || 0}</span></td>
                    <td style={TD}><span style={{ fontSize:11, color:"#9B7B77" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-RW") : "—"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const ERR = { display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 };
const TD = { padding:"12px 14px" };
