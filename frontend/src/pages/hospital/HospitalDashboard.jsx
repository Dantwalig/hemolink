import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const BLOOD_COLORS = {
  "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F",
  "B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483",
};

function stockLevel(u) {
  if (u === 0) return { color:"#C0392B", label:"Critical", bg:"rgba(192,57,43,.12)", bar:"#C0392B" };
  if (u < 5)   return { color:"#E67E22", label:"Low",      bg:"rgba(230,126,34,.12)", bar:"#E67E22" };
  if (u < 15)  return { color:"#D4A017", label:"Medium",   bg:"rgba(212,160,23,.12)", bar:"#D4A017" };
  return         { color:"#1E8449", label:"Good",    bg:"rgba(30,132,73,.12)",  bar:"#1E8449" };
}

function BloodStockCard({ type, units }) {
  const color = BLOOD_COLORS[type] || "#C0392B";
  const level = stockLevel(units);
  const pct   = Math.min((units / 30) * 100, 100);
  return (
    <div
      style={{ background:"#fff", border:`1.5px solid ${level.color}22`, borderTop:`3px solid ${level.color}`,
        borderRadius:16, padding:"18px 16px", display:"flex", flexDirection:"column", gap:10, transition:"all .2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${level.color}22`; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="none"; }}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:28, fontWeight:900, color, fontFamily:"'Lora',serif", letterSpacing:-1 }}>{type}</span>
        <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, background:level.bg, color:level.color }}>{level.label}</span>
      </div>
      <div style={{ background:"#F0E0DC", borderRadius:6, height:7, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${level.bar},${level.bar}99)`, borderRadius:6, transition:"width .8s ease" }}/>
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:"#1a0a07" }}>
        {units} <span style={{ fontSize:12, fontWeight:400, color:"#9B7B77" }}>units</span>
      </div>
    </div>
  );
}

function DonorHeatmap({ hospitalLat, hospitalLng, hospitalName }) {
  const mapRef = useRef(null);
  const initialized = useRef(false);
  const [donorCount, setDonorCount] = useState(null);
  const [bloodBreakdown, setBloodBreakdown] = useState({});

  useEffect(() => {
    if (!mapRef.current || initialized.current || !hospitalLat || !hospitalLng) return;
    initialized.current = true;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current, {
        center: [hospitalLat, hospitalLng], zoom: 12, zoomControl: true,
        preferCanvas: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap",
      }).addTo(map);

      // Hospital marker
      const hospIcon = L.divIcon({
        className: "",
        html: `<div style="width:42px;height:42px;background:linear-gradient(135deg,#C0392B,#8B1A1A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(192,57,43,.6);border:2.5px solid white"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:15px;font-family:Sora,sans-serif">H</span></div>`,
        iconSize: [42, 42], iconAnchor: [21, 42],
      });
      L.marker([hospitalLat, hospitalLng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(`<b style="font-family:Sora,sans-serif;font-size:13px">${hospitalName}</b><br><small style="color:#7A4A45">Your hospital</small>`)
        .openPopup();

      // 10 km radius search ring
      L.circle([hospitalLat, hospitalLng], {
        radius: 10000, color: "#C0392B", weight: 1.5,
        opacity: 0.4, fillColor: "#C0392B", fillOpacity: 0.03,
        dashArray: "6 4",
      }).addTo(map).bindPopup("10 km search radius");

      // Fetch donors
      try {
        const res = await api.get("/donors/locations");
        const donors = res.data.data || [];
        setDonorCount(donors.length);

        // Build blood type breakdown
        const breakdown = {};
        donors.forEach(d => { breakdown[d.bloodTypeCode] = (breakdown[d.bloodTypeCode] || 0) + 1; });
        setBloodBreakdown(breakdown);

        // Heatmap layer using leaflet.heat
        if (donors.length > 0) {
          const heatPoints = donors
            .filter(d => d.latitude && d.longitude)
            .map(d => [d.latitude, d.longitude, 0.8]);

          try {
            // leaflet.heat attaches to L as a plugin
            await import("leaflet.heat");
            if (L.heatLayer) {
              L.heatLayer(heatPoints, {
                radius: 35, blur: 25, maxZoom: 15,
                gradient: { 0.2: "#3B82F6", 0.5: "#F59E0B", 0.8: "#EF4444", 1.0: "#7F1D1D" },
              }).addTo(map);
            }
          } catch (_) {
            // leaflet.heat unavailable — fall through to dot markers
          }
        }

        // Individual donor markers on top of heatmap
        donors.forEach(d => {
          if (!d.latitude || !d.longitude) return;
          const bc = BLOOD_COLORS[d.bloodTypeCode] || "#C0392B";
          const donorIcon = L.divIcon({
            className: "",
            html: `<div style="width:30px;height:30px;border-radius:50%;background:${bc};border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.3);font-family:Sora,sans-serif;font-size:8px;font-weight:900;color:white;line-height:1">${d.bloodTypeCode}</div>`,
            iconSize: [30, 30], iconAnchor: [15, 15],
          });
          L.marker([d.latitude, d.longitude], { icon: donorIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family:Sora,sans-serif;padding:2px">
                <b style="font-size:15px;color:${bc}">${d.bloodTypeCode}</b>
                <br><small style="color:#7A4A45">Available Donor</small>
              </div>
            `);
        });

      } catch (err) {
        console.error("Donor locations error:", err);
      }
    };
    init().catch(console.error);
  }, [hospitalLat, hospitalLng, hospitalName]);

  if (!hospitalLat || !hospitalLng) {
    return (
      <div style={{ height:240, borderRadius:16, background:"rgba(192,57,43,.03)", border:"1.5px dashed #E8D5D0",
        display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 3a11 11 0 0 1 11 11c0 8-11 20-11 20S7 22 7 14A11 11 0 0 1 18 3z" stroke="#C0392B" strokeWidth="2" opacity=".35"/>
          <circle cx="18" cy="14" r="3.5" stroke="#C0392B" strokeWidth="2" opacity=".35"/>
        </svg>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:13, color:"#9B7B77", fontWeight:600 }}>No GPS coordinates set</p>
          <p style={{ fontSize:12, color:"#BBA0A0", marginTop:4 }}>Contact admin to enable the donor map.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <div ref={mapRef} style={{ height:240, borderRadius:16, overflow:"hidden", border:"1.5px solid #F0E0DC", boxShadow:"0 4px 20px rgba(140,20,20,.07)" }}/>

      {/* Donor count badge */}
      {donorCount !== null && (
        <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(255,255,255,.97)",
          backdropFilter:"blur(10px)", borderRadius:10, padding:"8px 14px", border:"1px solid #F0E0DC",
          display:"flex", alignItems:"center", gap:8, boxShadow:"0 3px 14px rgba(0,0,0,.1)", zIndex:1000 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#C0392B",
            boxShadow:"0 0 0 3px rgba(192,57,43,.2)" }}/>
          <span style={{ fontSize:12, fontWeight:700, color:"#1a0a07", fontFamily:"Sora,sans-serif" }}>
            {donorCount} available donor{donorCount !== 1 ? "s" : ""} in range
          </span>
        </div>
      )}

      {/* Blood type breakdown badge */}
      {Object.keys(bloodBreakdown).length > 0 && (
        <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,.97)",
          backdropFilter:"blur(10px)", borderRadius:11, padding:"10px 13px", border:"1px solid #F0E0DC",
          boxShadow:"0 3px 14px rgba(0,0,0,.1)", zIndex:1000, minWidth:120 }}>
          <div style={{ fontSize:9, fontWeight:800, color:"#9B7B77", textTransform:"uppercase",
            letterSpacing:1, marginBottom:7, fontFamily:"Sora,sans-serif" }}>By Blood Type</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {Object.entries(bloodBreakdown).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([type, count]) => {
              const bc = BLOOD_COLORS[type] || "#C0392B";
              return (
                <div key={type} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:22, height:22, borderRadius:7, background:`${bc}18`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:9, fontWeight:900, color:bc, fontFamily:"Lora,serif" }}>{type}</span>
                  </div>
                  <div style={{ flex:1, background:"#F0E0DC", borderRadius:4, height:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:bc, borderRadius:4,
                      width:`${Math.min((count / Math.max(...Object.values(bloodBreakdown))) * 100, 100)}%`,
                      transition:"width .6s ease" }}/>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:"#1a0a07", fontFamily:"Sora,sans-serif",
                    minWidth:14, textAlign:"right" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap legend */}
      <div style={{ position:"absolute", bottom:12, right:12, background:"rgba(255,255,255,.93)",
        backdropFilter:"blur(8px)", borderRadius:9, padding:"7px 12px", border:"1px solid #F0E0DC",
        boxShadow:"0 2px 10px rgba(0,0,0,.07)", zIndex:1000 }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#9B7B77", textTransform:"uppercase",
          letterSpacing:.8, marginBottom:5, fontFamily:"Sora,sans-serif" }}>Density</div>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {["#3B82F6","#F59E0B","#EF4444","#7F1D1D"].map((c,i) => (
            <div key={i} style={{ width:14, height:10, background:c, borderRadius:i===0?"3px 0 0 3px":i===3?"0 3px 3px 0":"0", opacity:.85 }}/>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:8, color:"#9B7B77", fontFamily:"Sora,sans-serif" }}>Low</span>
          <span style={{ fontSize:8, color:"#9B7B77", fontFamily:"Sora,sans-serif" }}>High</span>
        </div>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests,  setRequests]  = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get("/requests"), api.get("/inventory")])
      .then(([rr, ir]) => { setRequests(rr.data.data || []); setInventory(ir.data.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending   = requests.filter(r => r.statusCode === "pending").length;
  const fulfilled = requests.filter(r => r.statusCode === "fulfilled").length;
  const critical  = inventory.filter(i => i.unitsAvailable === 0).length;
  const lowStock  = inventory.filter(i => i.unitsAvailable < 5).length;
  const recent    = [...requests].sort((a,b) => b.requestId - a.requestId).slice(0, 5);

  const URGENCY_COLOR = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
  const STATUS_S = {
    pending:   { bg:"rgba(230,126,34,.1)", c:"#B7560F" },
    fulfilled: { bg:"rgba(30,132,73,.1)", c:"#1E8449" },
    cancelled: { bg:"rgba(192,57,43,.1)", c:"#C0392B" },
  };

  const newRequestBtn = (
    <button className="hl-btn-red" onClick={() => navigate("/hospital/requests/new")}
      style={{ display:"flex", alignItems:"center", gap:8 }}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      New Blood Request
    </button>
  );

  return (
    <HospitalShell title="Dashboard" subtitle="Blood supply and request overview." action={newRequestBtn}>
      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:16 }}>
          <div style={{ width:36, height:36, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
          <span style={{ color:"#7A4A45" }}>Loading…</span>
        </div>
      ) : (
        <>
          {/* 1. STATS — pending requests prominent at top */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Pending Requests", value:pending,          color:"#E67E22", urgent: pending > 0 },
              { label:"Fulfilled",        value:fulfilled,        color:"#1E8449" },
              { label:"Total Requests",   value:requests.length,  color:"#2E86C1" },
              { label:"Low/Out of Stock", value:lowStock,         color:lowStock>0?"#C0392B":"#1E8449", urgent: lowStock > 0 },
            ].map(({ label, value, color, urgent }) => (
              <div key={label} style={{
                background:"#fff",
                border:`1.5px solid ${urgent ? `${color}44` : "#F0E0DC"}`,
                borderTop:`3px solid ${urgent ? color : "#F0E0DC"}`,
                borderRadius:18, padding:"20px",
                boxShadow: urgent ? `0 4px 18px ${color}18` : "0 4px 12px rgba(140,20,20,.04)",
              }}>
                {urgent && (
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block",
                      animation:"hl-pulse 1.4s infinite" }}/>
                    <span style={{ fontSize:9, fontWeight:700, color, textTransform:"uppercase", letterSpacing:.8 }}>
                      Action needed
                    </span>
                  </div>
                )}
                <div style={{ fontSize:34, fontWeight:900, color, fontFamily:"Lora,serif", letterSpacing:-1 }}>{value}</div>
                <div style={{ fontSize:12, color:"#9B7B77", fontWeight:500, marginTop:6 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* 2. RECENT REQUESTS — full width */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 28px", marginBottom:24, boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07" }}>Recent Requests</h2>
                {pending > 0 && (
                  <p style={{ fontSize:12, color:"#E67E22", fontWeight:600, marginTop:4 }}>
                    {pending} pending — awaiting donor matching
                  </p>
                )}
              </div>
              <button onClick={() => navigate("/hospital/requests")}
                style={{ background:"none", border:"none", color:"#C0392B", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                View all →
              </button>
            </div>
            {recent.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#9B7B77", fontSize:13 }}>No requests yet.</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {recent.map(r => {
                  const bc = BLOOD_COLORS[r.bloodTypeCode] || "#C0392B";
                  const ss = STATUS_S[r.statusCode] || { bg:"rgba(107,107,107,.1)", c:"#6B6B6B" };
                  const uc = URGENCY_COLOR[r.urgencyLevel?.toLowerCase()] || "#C0392B";
                  const isPending = r.statusCode === "pending";
                  return (
                    <div key={r.requestId} style={{
                      display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                      background: isPending ? "rgba(255,248,240,.9)" : "rgba(253,244,242,.7)",
                      borderRadius:14,
                      border: isPending ? `1.5px solid ${uc}33` : "1px solid #F8EDEB",
                      borderLeft: isPending ? `3px solid ${uc}` : "1px solid #F8EDEB",
                    }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:`${bc}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:16, fontWeight:900, color:bc, fontFamily:"Lora,serif" }}>{r.bloodTypeCode}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1a0a07" }}>{r.unitsNeeded} unit{r.unitsNeeded>1?"s":""}</div>
                        <div style={{ fontSize:11, color:"#9B7B77", marginTop:2 }}>{r.neededBy ? new Date(r.neededBy).toLocaleDateString("en-RW") : "—"}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:ss.bg, color:ss.c }}>{r.statusCode}</span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${uc}14`, color:uc, textTransform:"capitalize" }}>{r.urgencyLevel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. DONOR HEATMAP */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 28px", marginBottom:24, boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07" }}>Nearby Available Donors</h2>
                <p style={{ fontSize:12, color:"#9B7B77", marginTop:4 }}>Live map — 10 km radius</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:10, fontWeight:700, color:"#C0392B", background:"rgba(192,57,43,.08)", padding:"5px 12px", borderRadius:20 }}>● LIVE</span>
                <button onClick={()=>navigate("/hospital/donors-map")}
                  style={{ padding:"6px 14px", background:"linear-gradient(135deg,#C0392B,#8B1A1A)", color:"#fff",
                    border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
                    fontFamily:"'Sora',sans-serif" }}>
                  Full Map →
                </button>
              </div>
            </div>
            <DonorHeatmap hospitalLat={user?.latitude} hospitalLng={user?.longitude} hospitalName={user?.name || "Your Hospital"}/>
          </div>

          {/* 4. BLOOD INVENTORY */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 28px", marginBottom:24, boxShadow:"0 4px 16px rgba(140,20,20,.05)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#1a0a07", letterSpacing:-.3 }}>Blood Inventory</h2>
                {(critical > 0 || lowStock > 0) && (
                  <p style={{ fontSize:12, color:"#C0392B", fontWeight:600, marginTop:4 }}>
                    {critical > 0 ? `⚠ ${critical} blood type${critical>1?"s":""} out of stock` : `⚠ ${lowStock} type${lowStock>1?"s":""} critically low`}
                  </p>
                )}
              </div>
              <button onClick={() => navigate("/hospital/inventory")}
                style={{ background:"none", border:"1.5px solid #E8D5D0", borderRadius:9, padding:"7px 16px",
                  color:"#C0392B", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all .18s" }}>
                Manage Inventory →
              </button>
            </div>
            {inventory.length > 0 ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {inventory.map(i => <BloodStockCard key={i.bloodTypeCode} type={i.bloodTypeCode} units={i.unitsAvailable}/>)}
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"32px", color:"#9B7B77", fontSize:13, background:"rgba(192,57,43,.03)", borderRadius:12, border:"1px dashed #E8D5D0" }}>
                No inventory data. <button onClick={() => navigate("/hospital/inventory")} style={{ background:"none", border:"none", color:"#C0392B", fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:13 }}>Set up blood stock →</button>
              </div>
            )}
          </div>

          {/* 5. QUICK ACTIONS */}
          <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"24px 26px", boxShadow:"0 4px 12px rgba(140,20,20,.04)" }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:"#1a0a07", marginBottom:20 }}>Quick Actions</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { label:"New Blood Request", sub:"Request donors for a blood type", color:"#C0392B", path:"/hospital/requests/new" },
                { label:"Update Blood Stock", sub:"Edit inventory levels",           color:"#2E86C1", path:"/hospital/inventory" },
                { label:"View All Requests",  sub:"Track and manage all requests",  color:"#8E44AD", path:"/hospital/requests" },
              ].map(({ label, sub, color, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
                    background:"none", border:`1.5px solid ${color}22`, borderRadius:14,
                    cursor:"pointer", textAlign:"left", fontFamily:"Sora,sans-serif", transition:"all .18s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${color}08`; e.currentTarget.style.transform="translateX(4px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.transform="translateX(0)"; }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ width:16, height:16, borderRadius:4, background:color }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a0a07" }}>{label}</div>
                    <div style={{ fontSize:11, color:"#9B7B77", marginTop:2 }}>{sub}</div>
                  </div>
                  <svg style={{ marginLeft:"auto" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="#9B7B77" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </HospitalShell>
  );
}
