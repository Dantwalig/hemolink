import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api.js";
import { useLang } from "../../utils/LangContext.jsx";
import LanguageSwitcher from "../../utils/LanguageSwitcher.jsx";
import { LogoDrop, SORA_FONT, SHARED_BTN_CSS } from "../../utils/HLComponents.jsx";

function HospitalMap({ lat, lng, name, donorLat, donorLng, distanceKm }) {
  const mapRef  = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || initRef.current || !lat || !lng) return;
    initRef.current = true;
    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const centerLat = (donorLat && donorLng) ? (lat + donorLat) / 2 : lat;
      const centerLng = (donorLat && donorLng) ? (lng + donorLng) / 2 : lng;
      const map = L.map(mapRef.current, { center:[centerLat,centerLng], zoom:donorLat?12:13, zoomControl:true, scrollWheelZoom:false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution:"© OpenStreetMap" }).addTo(map);

      const hospIcon = L.divIcon({
        className:"",
        html:`<div style="width:44px;height:44px;background:linear-gradient(135deg,#C0392B,#8B1A1A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(192,57,43,.55);border:2.5px solid white"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:16px;font-family:Sora,sans-serif">H</span></div>`,
        iconSize:[44,44], iconAnchor:[22,44],
      });
      L.marker([lat,lng],{icon:hospIcon}).addTo(map)
        .bindPopup(`<div style="font-family:Sora,sans-serif;min-width:150px"><strong style="font-size:14px;color:#1a0a07">${name}</strong><br/><span style="font-size:11px;color:#C0392B;font-weight:600">🏥 Blood donation centre</span></div>`)
        .openPopup();

      if (donorLat && donorLng) {
        const donorIcon = L.divIcon({
          className:"",
          html:`<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2E86C1,#1A5276);border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(46,134,193,.5)"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" fill="white"/><path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg></div>`,
          iconSize:[36,36], iconAnchor:[18,18],
        });
        L.marker([donorLat,donorLng],{icon:donorIcon}).addTo(map)
          .bindPopup(`<div style="font-family:Sora,sans-serif"><strong>📍 Your location</strong></div>`);
        L.polyline([[donorLat,donorLng],[lat,lng]],{color:"#C0392B",weight:2,opacity:.45,dashArray:"8 6"}).addTo(map);
        map.fitBounds([[donorLat,donorLng],[lat,lng]],{padding:[50,50]});
      }
    };
    init().catch(console.error);
  }, [lat,lng,donorLat,donorLng,name]);

  if (!lat || !lng) return (
    <div style={{height:220,borderRadius:16,background:"rgba(192,57,43,.03)",border:"1.5px dashed #E8D5D0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3a9 9 0 0 1 9 9c0 6-9 14-9 14S5 18 5 12a9 9 0 0 1 9-9z" stroke="#BBA0A0" strokeWidth="1.8"/><circle cx="14" cy="12" r="3" stroke="#BBA0A0" strokeWidth="1.8"/></svg>
      <span style={{fontSize:13,color:"#9B7B77",fontWeight:500}}>Map not available — no GPS set for this hospital</span>
    </div>
  );

  return (
    <div style={{position:"relative"}}>
      <div ref={mapRef} style={{height:260,borderRadius:16,overflow:"hidden",border:"1.5px solid #F0E0DC",boxShadow:"0 4px 20px rgba(140,20,20,.08)"}}/>
      <div style={{position:"absolute",bottom:10,left:10,background:"rgba(255,255,255,.97)",backdropFilter:"blur(8px)",borderRadius:10,padding:"8px 12px",border:"1px solid #F0E0DC",boxShadow:"0 2px 10px rgba(0,0,0,.08)",zIndex:1000,display:"flex",flexDirection:"column",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:10,height:10,borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",background:"#C0392B"}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#1a0a07",fontFamily:"Sora,sans-serif"}}>{name}</span>
        </div>
        {donorLat && donorLng && (
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#2E86C1"}}/>
            <span style={{fontSize:11,fontWeight:600,color:"#1a0a07",fontFamily:"Sora,sans-serif"}}>You {distanceKm!=null?`· ${distanceKm} km away`:""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DonorRespondPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const token = searchParams.get("token");

  const [status,   setStatus]   = useState("loading");
  const [response, setResponse] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [data,     setData]     = useState(null);
  const [donorPos, setDonorPos] = useState({ lat:null, lng:null });

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.get(`/notifications/token/${token}`)
      .then(res => { setData(res.data.data); setStatus("ready"); })
      .catch(err => { setStatus(err.response?.status === 410 ? "expired" : "error"); });
  }, [token]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setDonorPos({ lat:pos.coords.latitude, lng:pos.coords.longitude }),
      () => {}, { timeout:6000 }
    );
  }, []);

  const handleRespond = async (r) => {
    setLoading(true); setResponse(r);
    try {
      await api.post("/notifications/respond", { token, response_status:r });
      setStatus("success");
    } catch { setStatus("error"); }
    finally   { setLoading(false); }
  };

  const urgencyColor = { critical:"#C0392B", high:"#E67E22", medium:"#D4A017", low:"#1E8449" };
  const urg      = data?.urgency_level?.toLowerCase() || "high";
  const urgColor = urgencyColor[urg] || "#C0392B";
  const neededBy = data?.needed_by
    ? new Date(data.needed_by).toLocaleString("en-RW", { dateStyle:"medium", timeStyle:"short" })
    : t("common.soonAsPossible");

  const Header = () => (
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 40px",background:"rgba(255,255,255,.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F0E0DC",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <LogoDrop size={30}/>
        <span style={{fontWeight:800,fontSize:16,color:"#1a0a07"}}>Hemo<span style={{color:"#C0392B"}}>Link</span></span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {status==="ready" && <span style={{fontSize:11,color:"#C0392B",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",background:"rgba(192,57,43,.08)",padding:"5px 12px",borderRadius:20}}>● {t("respond.emergencyRequest")}</span>}
        <LanguageSwitcher/>
      </div>
    </header>
  );

  const Card = ({children}) => (
    <div style={{background:"#fff",border:"1.5px solid #F0E0DC",borderRadius:24,padding:"44px 48px",maxWidth:600,width:"100%",boxShadow:"0 12px 48px rgba(140,20,20,.12)",animation:"fadeInUp .6s ease both"}}>
      {children}
    </div>
  );

  if (status === "loading") return (
    <div style={{minHeight:"100vh",background:"#FDF4F2",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style><Header/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
        <div style={{width:44,height:44,border:"3px solid #F0E0DC",borderTopColor:"#C0392B",borderRadius:"50%",animation:"hl-spin .75s linear infinite"}}/>
        <p style={{fontSize:14,color:"#7A4A45"}}>{t("respond.loading")}</p>
      </div>
    </div>
  );

  if (status === "error") return (
    <div style={{minHeight:"100vh",background:"#FDF4F2",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style><Header/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 24px"}}>
        <Card>
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,background:"rgba(192,57,43,.1)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#C0392B" strokeWidth="2"/><path d="M16 10v7M16 21.5v1" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#1a0a07",marginBottom:10}}>{t("respond.invalidTitle")}</h2>
            <p style={{fontSize:15,color:"#7A4A45",lineHeight:1.7,marginBottom:28}}>{t("respond.invalidDesc")}</p>
            <button className="hl-btn-red" onClick={()=>navigate("/login")}>Go to Donor Login</button>
          </div>
        </Card>
      </div>
    </div>
  );

  if (status === "expired") return (
    <div style={{minHeight:"100vh",background:"#FDF4F2",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style><Header/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 24px"}}>
        <Card>
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,background:"rgba(230,126,34,.1)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#E67E22" strokeWidth="2"/><path d="M16 9v7l4 4" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#1a0a07",marginBottom:10}}>{t("respond.expiredTitle")}</h2>
            <p style={{fontSize:15,color:"#7A4A45",lineHeight:1.7,marginBottom:28}}>{t("respond.expiredDesc")}</p>
            <button className="hl-btn-red" onClick={()=>navigate("/donor/dashboard")}>Go to My Dashboard</button>
          </div>
        </Card>
      </div>
    </div>
  );

  if (status === "success") return (
    <div style={{minHeight:"100vh",background:"#FDF4F2",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{SORA_FONT + SHARED_BTN_CSS}</style><Header/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 24px"}}>
        <Card>
          <div style={{textAlign:"center"}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:response==="Accepted"?"rgba(30,132,73,.1)":"rgba(107,107,107,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              {response==="Accepted"
                ? <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="#1E8449" strokeWidth="2"/><path d="M10 18l6 6 10-12" stroke="#1E8449" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="#6B6B6B" strokeWidth="2"/><path d="M12 18h12" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round"/></svg>}
            </div>
            <h2 style={{fontSize:24,fontWeight:800,color:"#1a0a07",marginBottom:10}}>
              {response==="Accepted" ? t("respond.thankYou") : t("respond.responseReceived")}
            </h2>
            <p style={{fontSize:15,color:"#7A4A45",lineHeight:1.75,maxWidth:420,margin:"0 auto 24px"}}>
              {response==="Accepted" ? t("respond.acceptedDesc") : t("respond.declinedDesc")}
            </p>
            {response==="Accepted" && data && (
              <>
                <div style={{display:"flex",alignItems:"center",gap:14,background:"#EAFAF1",border:"1.5px solid #A9DFBF",borderRadius:14,padding:"16px 20px",textAlign:"left",marginBottom:16}}>
                  <div style={{width:48,height:48,background:"#D5F5E3",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="15" rx="1.5" stroke="#1E8449" strokeWidth="1.5"/><path d="M9 22v-6h6v6M10 3h4v4h-4zM9 12h2M13 12h2" stroke="#1E8449" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontSize:15,fontWeight:700,color:"#1a0a07",marginBottom:2}}>{data.hospital_name}</div>
                    {data.hospital_sector && <div style={{fontSize:12,color:"#1E8449",fontWeight:500}}>📍 {data.hospital_sector}, {data.hospital_district}</div>}
                    <div style={{fontSize:12,color:"#7A4A45",marginTop:2}}>{t("common.mentionHemoLink")}</div>
                  </div>
                </div>
                {data.hospital_lat && data.hospital_lng && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${data.hospital_lat},${data.hospital_lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:10,marginBottom:20,background:"linear-gradient(135deg,#2E86C1,#1A5276)",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none",fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 14px rgba(46,134,193,.4)"}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a3.5 3.5 0 0 1 3.5 3.5C10.5 8 7 12 7 12S3.5 8 3.5 5A3.5 3.5 0 0 1 7 1.5z" stroke="white" strokeWidth="1.3" fill="none"/><circle cx="7" cy="5" r="1.2" fill="white"/></svg>
                    Get Directions to Hospital
                  </a>
                )}
              </>
            )}
            <button className="hl-btn-red" onClick={()=>navigate("/donor/dashboard")} style={{padding:"13px 32px",fontSize:14}}>
              {t("respond.goToDashboard")}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  // ── Ready: main card with map ─────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#FDF4F2",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{SORA_FONT + SHARED_BTN_CSS + `
        .respond-accept{flex:1;padding:15px 0;background:linear-gradient(135deg,#1E8449,#145A32);color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 20px rgba(30,132,73,.35);transition:all .2s;}
        .respond-accept:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(30,132,73,.45);}
        .respond-decline{flex:1;padding:15px 0;background:transparent;color:#C0392B;border:2px solid #C0392B;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;}
        .respond-decline:hover:not(:disabled){background:rgba(192,57,43,.05);}
        .respond-accept:disabled,.respond-decline:disabled{opacity:.65;cursor:not-allowed;transform:none;}
      `}</style>

      <Header/>

      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"36px 24px 60px"}}>
        <div style={{background:"#fff",border:"1.5px solid #F0E0DC",borderRadius:24,padding:"40px 44px",maxWidth:640,width:"100%",boxShadow:"0 12px 48px rgba(140,20,20,.12)",animation:"fadeInUp .5s ease both"}}>

          {/* Urgency badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:urgColor,borderRadius:24,padding:"7px 18px",marginBottom:20,color:"#fff",fontSize:13,fontWeight:700}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,.8)",display:"inline-block"}}/>
            {(data?.urgency_level||"High").charAt(0).toUpperCase()+(data?.urgency_level||"High").slice(1)} — {t("respond.bloodNeededNow")}
          </div>

          <h1 style={{fontSize:22,fontWeight:800,color:"#1a0a07",marginBottom:8}}>{t("respond.matched")}</h1>
          <p style={{fontSize:14,color:"#7A4A45",lineHeight:1.7,marginBottom:24}}>{t("respond.matchedSub")}</p>

          {/* Blood type + details */}
          <div style={{background:"linear-gradient(135deg,rgba(192,57,43,.06),rgba(192,57,43,.02))",border:"1.5px solid rgba(192,57,43,.2)",borderRadius:16,padding:"20px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:24}}>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:52,fontWeight:900,color:"#C0392B",fontFamily:"'Lora',serif",lineHeight:1,textShadow:"0 2px 12px rgba(192,57,43,.3)"}}>{data?.blood_type_code}</div>
              <div style={{fontSize:11,color:"#7A4A45",textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginTop:4}}>Blood Type</div>
            </div>
            <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                [t("respond.hospital"),  data?.hospital_name],
                [t("respond.units"),     `${data?.units_needed} ${t("common.units")}`],
                [t("respond.neededBy"),  neededBy],
                [t("respond.distance"),  data?.distance_km!=null?`${data.distance_km} ${t("common.kmAway")}`:data?.hospital_sector||"—"],
              ].map(([label,val])=>(
                <div key={label} style={{background:"rgba(255,255,255,.85)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:10,color:"#9B7B77",textTransform:"uppercase",letterSpacing:.6,fontWeight:600,marginBottom:3}}>{label}</div>
                  <div style={{fontSize:13,color:"#1a0a07",fontWeight:600,lineHeight:1.35}}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── HOSPITAL MAP ── */}
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <h3 style={{fontSize:14,fontWeight:800,color:"#1a0a07",margin:0}}>📍 Hospital Location</h3>
              {data?.hospital_lat && data?.hospital_lng && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${data.hospital_lat},${data.hospital_lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:"#2E86C1",textDecoration:"none",fontFamily:"'Sora',sans-serif",background:"rgba(46,134,193,.08)",padding:"5px 12px",borderRadius:8,border:"1px solid rgba(46,134,193,.2)"}}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a3.5 3.5 0 0 1 3.5 3.5C10.5 8 7 12 7 12S3.5 8 3.5 5A3.5 3.5 0 0 1 7 1.5z" stroke="#2E86C1" strokeWidth="1.3" fill="none"/><circle cx="7" cy="5" r="1.2" fill="#2E86C1"/></svg>
                  Open in Google Maps
                </a>
              )}
            </div>
            <HospitalMap
              lat={data?.hospital_lat} lng={data?.hospital_lng}
              name={data?.hospital_name}
              donorLat={donorPos.lat} donorLng={donorPos.lng}
              distanceKm={data?.distance_km}
            />
          </div>

          <div style={{borderTop:"1px solid #F0E0DC",margin:"0 0 20px"}}/>
          <p style={{fontSize:16,fontWeight:700,color:"#1a0a07",marginBottom:14,textAlign:"center"}}>{t("respond.canYouDonate")}</p>

          <div style={{display:"flex",gap:12,marginBottom:16}}>
            <button className="respond-accept" onClick={()=>handleRespond("Accepted")} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {loading&&response==="Accepted"?t("respond.confirming"):t("respond.yesCanDonate")}
            </button>
            <button className="respond-decline" onClick={()=>handleRespond("Declined")} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"/></svg>
              {loading&&response==="Declined"?t("respond.sending"):t("respond.noCannotDonate")}
            </button>
          </div>

          <div style={{fontSize:12.5,color:"#7A4A45",lineHeight:1.65,textAlign:"center",background:"rgba(192,57,43,.04)",border:"1px solid rgba(192,57,43,.1)",borderRadius:10,padding:"12px 16px"}}>
            {t("respond.noteText")}
          </div>
        </div>
      </div>
    </div>
  );
}
