import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const BLOOD_COLORS = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };
const URGENCY_COLOR = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
const STATUS_S = { pending:{bg:"rgba(230,126,34,.1)",c:"#B7560F"}, fulfilled:{bg:"rgba(30,132,73,.1)",c:"#1E8449"}, cancelled:{bg:"rgba(192,57,43,.1)",c:"#C0392B"} };

export default function HospitalRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/requests")
      .then(res => setRequests(res.data.data || []))
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdating(requestId);
    try {
      const res = await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      setRequests(prev => prev.map(r => r.requestId===requestId ? res.data.data : r));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally { setUpdating(null); }
  };

  const filtered = filter==="all" ? requests : requests.filter(r=>r.statusCode===filter);

  const newBtn = (
    <button className="hl-btn-red" onClick={()=>navigate("/hospital/requests/new")} style={{ display:"flex", alignItems:"center", gap:8 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
      New Request
    </button>
  );

  return (
    <HospitalShell title="Blood Requests" subtitle={`${requests.length} total requests.`} action={newBtn}>
      {error && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>{error}</div>}

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {[["all","All"],["pending","Pending"],["fulfilled","Fulfilled"],["cancelled","Cancelled"]].map(([f,l])=>{
          const count = f==="all" ? requests.length : requests.filter(r=>r.statusCode===f).length;
          return (
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"8px 16px", borderRadius:9, border:`1.5px solid ${filter===f?"#C0392B":"#E8D5D0"}`, background:filter===f?"rgba(192,57,43,.08)":"#fff", color:filter===f?"#C0392B":"#7A4A45", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:filter===f?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              {l}
              <span style={{ background:filter===f?"rgba(192,57,43,.15)":"#F0E0DC", color:filter===f?"#C0392B":"#9B7B77", fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:240, gap:16 }}>
          <div style={{ width:32, height:32, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
          <span style={{ color:"#7A4A45" }}>Loading requests…</span>
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"80px 20px", color:"#9B7B77", fontSize:14 }}>
          {filter==="all" ? "No blood requests yet. Create your first request." : `No ${filter} requests.`}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(r => {
            const bc = BLOOD_COLORS[r.bloodTypeCode]||"#C0392B";
            const ss = STATUS_S[r.statusCode]||{ bg:"rgba(107,107,107,.1)", c:"#6B6B6B" };
            const uc = URGENCY_COLOR[r.urgencyLevel?.toLowerCase()]||"#C0392B";
            const isOpen = expanded===r.requestId;
            const notifs = r.notifications||[];
            const accepted = notifs.filter(n=>n.responseStatus==="Accepted").length;

            return (
              <div key={r.requestId} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
                {/* Main row */}
                <div style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 22px", cursor:"pointer" }} onClick={()=>setExpanded(isOpen?null:r.requestId)}>
                  {/* Blood type */}
                  <div style={{ width:56, height:56, borderRadius:14, background:`${bc}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:22, fontWeight:900, color:bc, fontFamily:"'Lora',serif" }}>{r.bloodTypeCode}</span>
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:15, fontWeight:700, color:"#1a0a07" }}>{r.unitsNeeded} unit{r.unitsNeeded>1?"s":""} needed</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:`${uc}14`, color:uc, textTransform:"capitalize" }}>{r.urgencyLevel}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:ss.bg, color:ss.c, textTransform:"capitalize" }}>{r.statusCode}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#9B7B77", display:"flex", gap:14 }}>
                      <span>Needed by: {r.neededBy ? new Date(r.neededBy).toLocaleString("en-RW",{dateStyle:"medium",timeStyle:"short"}) : "—"}</span>
                      <span>{notifs.length} notified · {accepted} accepted</span>
                    </div>
                  </div>

                  {/* Status actions */}
                  {r.statusCode==="pending" && (
                    <div style={{ display:"flex", gap:8 }} onClick={e=>e.stopPropagation()}>
                      <button disabled={updating===r.requestId} onClick={()=>handleStatusChange(r.requestId,"fulfilled")}
                        style={{ padding:"7px 14px", background:"linear-gradient(135deg,#1E8449,#145A32)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", opacity:updating===r.requestId?.65:1 }}>
                        Fulfilled
                      </button>
                      <button disabled={updating===r.requestId} onClick={()=>handleStatusChange(r.requestId,"cancelled")}
                        style={{ padding:"7px 14px", background:"transparent", color:"#C0392B", border:"1.5px solid #C0392B", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", opacity:updating===r.requestId?.65:1 }}>
                        Cancel
                      </button>
                    </div>
                  )}

                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform:isOpen?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}><path d="M3 5l4 4 4-4" stroke="#9B7B77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                {/* Expanded donor responses */}
                {isOpen && (
                  <div style={{ borderTop:"1px solid #F8EDEB", padding:"16px 22px", background:"rgba(253,244,242,.4)" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#7A4A45", textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Donor Responses ({notifs.length})</div>
                    {notifs.length===0 ? (
                      <p style={{ fontSize:13, color:"#9B7B77" }}>No donors notified yet.</p>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {notifs.map(n=>{
                          const rs = { Accepted:{ bg:"rgba(30,132,73,.1)", c:"#1E8449" }, Declined:{ bg:"rgba(192,57,43,.1)", c:"#C0392B" }, pending:{ bg:"rgba(230,126,34,.1)", c:"#B7560F" } }[n.responseStatus]||{};
                          return (
                            <div key={n.notificationId} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#fff", borderRadius:10, border:"1px solid #F0E0DC" }}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#9B7B77" strokeWidth="1.3"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#9B7B77" strokeWidth="1.3" strokeLinecap="round"/></svg>
                              <span style={{ flex:1, fontSize:13, color:"#1a0a07", fontWeight:500 }}>{n.donor?.fullName||"Donor"}</span>
                              <span style={{ fontSize:11, color:"#9B7B77" }}>{n.donor?.phone}</span>
                              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:rs.bg, color:rs.c }}>{n.responseStatus}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </HospitalShell>
  );
}
