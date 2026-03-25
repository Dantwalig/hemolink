import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const BLOOD_COLORS = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };

function stockLevel(u) {
  if (u===0) return { color:"#C0392B", label:"Critical", bg:"rgba(192,57,43,.1)" };
  if (u<5)   return { color:"#E67E22", label:"Low",      bg:"rgba(230,126,34,.1)" };
  if (u<15)  return { color:"#D4A017", label:"Medium",   bg:"rgba(212,160,23,.1)" };
  return       { color:"#1E8449", label:"Good",    bg:"rgba(30,132,73,.1)" };
}

function BloodStockCard({ type, units }) {
  const color = BLOOD_COLORS[type] || "#C0392B";
  const level = stockLevel(units);
  const maxBar = 30;
  const pct = Math.min((units / maxBar) * 100, 100);

  return (
    <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:16, padding:"20px", display:"flex", flexDirection:"column", gap:12, transition:"all .2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(140,20,20,.1)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:26, fontWeight:900, color, fontFamily:"'Lora',serif", letterSpacing:-1 }}>{type}</span>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:level.bg, color:level.color }}>{level.label}</span>
      </div>
      <div style={{ background:"#F0E0DC", borderRadius:6, height:8, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color},${color}aa)`, borderRadius:6, transition:"width .8s ease" }}/>
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:"#1a0a07" }}>
        {units} <span style={{ fontSize:13, fontWeight:400, color:"#9B7B77" }}>units</span>
      </div>
    </div>
  );
}

function DonorMap({ lat, lng, hospitalName }) {
  const mapRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!mapRef.current || initialized.current || !lat || !lng) return;
    initialized.current = true;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current, { center:[lat,lng], zoom:13, zoomControl:true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);
      const icon = L.divIcon({
        className:"",
        html:`<div style="width:36px;height:36px;background:linear-gradient(135deg,#C0392B,#8B1A1A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(192,57,43,.5)"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:13px;font-family:'Sora',sans-serif">H</span></div>`,
        iconSize:[36,36], iconAnchor:[18,36],
      });
      L.marker([lat,lng],{icon}).addTo(map).bindPopup(`<b>${hospitalName}</b>`).openPopup();
    };
    init().catch(console.error);
  }, [lat, lng]);

  if (!lat || !lng) return (
    <div style={{ height:280, borderRadius:16, background:"rgba(192,57,43,.04)", border:"1.5px dashed #E8D5D0", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3a9 9 0 0 1 9 9c0 7-9 17-9 17S7 19 7 12a9 9 0 0 1 9-9z" stroke="#C0392B" strokeWidth="1.8" opacity=".4"/><circle cx="16" cy="12" r="3" stroke="#C0392B" strokeWidth="1.8" opacity=".4"/></svg>
      <p style={{ fontSize:13, color:"#9B7B77", textAlign:"center", maxWidth:200 }}>No GPS coordinates set for your hospital. Contact admin to enable donor map.</p>
    </div>
  );

  return <div ref={mapRef} style={{ height:280, borderRadius:16, overflow:"hidden", border:"1.5px solid #F0E0DC" }}/>;
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/requests"),
      api.get("/inventory"),
    ])
      .then(([rr, ir]) => {
        setRequests(rr.data.data || []);
        setInventory(ir.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending   = requests.filter(r=>r.statusCode==="pending").length;
  const fulfilled = requests.filter(r=>r.statusCode==="fulfilled").length;
  const lowStock  = inventory.filter(i=>i.unitsAvailable<5).length;
  const recent    = requests.slice(0,5);

  const newRequestBtn = (
    <button className="hl-btn-red" onClick={()=>navigate("/hospital/requests/new")} style={{ display:"flex", alignItems:"center", gap:8 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
      New Blood Request
    </button>
  );

  const URGENCY_COLOR = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
  const STATUS_S = { pending:{bg:"rgba(230,126,34,.1)",c:"#B7560F"}, fulfilled:{bg:"rgba(30,132,73,.1)",c:"#1E8449"}, cancelled:{bg:"rgba(192,57,43,.1)",c:"#C0392B"} };
  const BLOOD_C = BLOOD_COLORS;

  return (
    <HospitalShell title="Dashboard" subtitle="Blood supply and request overview." action={newRequestBtn}>
      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:16 }}>
          <div style={{ width:36, height:36, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
          <span style={{ color:"#7A4A45" }}>Loading…</span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
            {[
              { label:"Pending Requests", value:pending, color:"#E67E22", icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="#E67E22" strokeWidth="1.5"/><path d="M11 7v4l3 3" stroke="#E67E22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { label:"Fulfilled",        value:fulfilled, color:"#1E8449", icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="#1E8449" strokeWidth="1.5"/><path d="M7 11l3 3 5-6" stroke="#1E8449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { label:"Total Requests",  value:requests.length, color:"#2E86C1", icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2" stroke="#2E86C1" strokeWidth="1.5"/><path d="M7 8h8M7 12h8M7 16h5" stroke="#2E86C1" strokeWidth="1.5" strokeLinecap="round"/></svg> },
              { label:"Low Stock Alerts",value:lowStock, color:lowStock>0?"#C0392B":"#1E8449", icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L2 19h18L11 3z" stroke={lowStock>0?"#C0392B":"#1E8449"} strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 10v4M11 17v.5" stroke={lowStock>0?"#C0392B":"#1E8449"} strokeWidth="1.5" strokeLinecap="round"/></svg> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, padding:"22px", display:"flex", flexDirection:"column", gap:10, boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
                </div>
                <div style={{ fontSize:32, fontWeight:900, color, fontFamily:"'Lora',serif", letterSpacing:-1 }}>{value}</div>
                <div style={{ fontSize:12, color:"#9B7B77", fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:28 }}>
            {/* Blood stock */}
            <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 26px", boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", letterSpacing:-.2 }}>Blood Inventory</h2>
                <button onClick={()=>navigate("/hospital/inventory")} style={{ background:"none", border:"none", color:"#C0392B", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>Manage →</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {inventory.length>0 ? inventory.map(i=><BloodStockCard key={i.bloodTypeCode} type={i.bloodTypeCode} units={i.unitsAvailable}/>) : (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px", color:"#9B7B77", fontSize:13 }}>No inventory data. Set up your blood stock in Inventory.</div>
                )}
              </div>
            </div>

            {/* Recent requests */}
            <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 26px", boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", letterSpacing:-.2 }}>Recent Requests</h2>
                <button onClick={()=>navigate("/hospital/requests")} style={{ background:"none", border:"none", color:"#C0392B", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>View all →</button>
              </div>
              {recent.length===0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#9B7B77", fontSize:13 }}>No requests yet. Create your first blood request.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {recent.map(r => {
                    const bc = BLOOD_C[r.bloodTypeCode]||"#C0392B";
                    const ss = STATUS_S[r.statusCode]||{ bg:"rgba(107,107,107,.1)", c:"#6B6B6B" };
                    const uc = URGENCY_COLOR[r.urgencyLevel?.toLowerCase()]||"#C0392B";
                    return (
                      <div key={r.requestId} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(253,244,242,.6)", borderRadius:12, border:"1px solid #F8EDEB" }}>
                        <span style={{ fontSize:18, fontWeight:900, color:bc, fontFamily:"'Lora',serif", minWidth:40 }}>{r.bloodTypeCode}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#1a0a07" }}>{r.unitsNeeded} unit{r.unitsNeeded>1?"s":""}</div>
                          <div style={{ fontSize:11, color:"#9B7B77" }}>{r.neededBy ? new Date(r.neededBy).toLocaleDateString("en-RW") : "—"}</div>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:ss.bg, color:ss.c }}>{r.statusCode}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:`${uc}14`, color:uc, textTransform:"capitalize" }}>{r.urgencyLevel}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 26px", boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", letterSpacing:-.2, marginBottom:18 }}>Hospital Location</h2>
            <DonorMap lat={user?.latitude} lng={user?.longitude} hospitalName={user?.name}/>
          </div>
        </>
      )}
    </HospitalShell>
  );
}
