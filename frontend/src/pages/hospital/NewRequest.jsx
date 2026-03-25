import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const BLOOD_TYPES    = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const URGENCY_LEVELS = ["low","medium","high","critical"];
const URGENCY_META   = {
  low:      { color:"#1E8449", bg:"rgba(30,132,73,.08)",   label:"Low — Routine, can wait a few days" },
  medium:   { color:"#D4A017", bg:"rgba(212,160,23,.08)",  label:"Medium — Needed within 24 hours" },
  high:     { color:"#E67E22", bg:"rgba(230,126,34,.08)",  label:"High — Needed within a few hours" },
  critical: { color:"#C0392B", bg:"rgba(192,57,43,.08)",   label:"Critical — Immediate, life-threatening" },
};
const BLOOD_COLORS   = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ bloodTypeCode:"", unitsNeeded:"", urgencyLevel:"", neededBy:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState(null);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]:val }));
    if (errors[field]) validate(field, val);
  };

  const validate = (field, val=form[field]) => {
    let err = "";
    if (field==="bloodTypeCode" && !val) err = "Select a blood type.";
    if (field==="unitsNeeded") { const n=parseInt(val,10); if (!val||isNaN(n)||n<1) err = "Enter a positive number of units."; }
    if (field==="urgencyLevel" && !val) err = "Select an urgency level.";
    if (field==="neededBy") { if (!val) err = "Select a date and time."; else if (new Date(val)<=new Date()) err = "Needed-by must be in the future."; }
    setErrors(e => ({ ...e, [field]:err }));
    return !err;
  };

  const validateAll = () => ["bloodTypeCode","unitsNeeded","urgencyLevel","neededBy"].map(f=>validate(f)).every(Boolean);

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setLoading(true); setServerError("");
    try {
      const res = await api.post("/requests", {
        bloodTypeCode: form.bloodTypeCode,
        unitsNeeded:   parseInt(form.unitsNeeded,10),
        urgencyLevel:  form.urgencyLevel,
        neededBy:      new Date(form.neededBy).toISOString(),
      });
      setResult(res.data.data);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create request.");
    } finally { setLoading(false); }
  };

  const selStyle = (hasErr, hasVal) => ({
    width:"100%", padding:"13px 14px", border:`1.5px solid ${hasErr?"#C0392B":hasVal?"#1E8449":"#E8D5D0"}`,
    borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif", color:hasVal?"#1a0a07":"#BBA0A0",
    background:"#fff", cursor:"pointer", transition:"border-color .18s",
  });

  // Success state
  if (result) {
    const matched = result.request?.matchedDonors ?? result.matchedDonors ?? 0;
    const notified = result.notified ?? matched;
    const bt = result.request?.bloodTypeCode || form.bloodTypeCode;
    const bc = BLOOD_COLORS[bt]||"#C0392B";

    return (
      <HospitalShell title="Request Created" subtitle="Donors are being notified.">
        <div style={{ maxWidth:540, margin:"0 auto", background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:24, padding:"48px", boxShadow:"0 12px 40px rgba(140,20,20,.1)", textAlign:"center" }}>
          <div style={{ width:80, height:80, background:"rgba(30,132,73,.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="#1E8449" strokeWidth="2"/><path d="M10 18l6 6 10-12" stroke="#1E8449" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{ fontSize:26, fontWeight:800, color:"#1a0a07", marginBottom:10 }}>Request Sent!</h2>
          <p style={{ fontSize:15, color:"#7A4A45", lineHeight:1.7, marginBottom:28 }}>Your blood request has been submitted. Our matching engine has found and notified compatible donors.</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:28 }}>
            {[
              { label:"Blood Type", value:bt, style:{ color:bc, fontFamily:"'Lora',serif", fontWeight:900 } },
              { label:"Donors Notified", value:notified, style:{ color:"#1E8449" } },
              { label:"Urgency", value:form.urgencyLevel, style:{ color:URGENCY_META[form.urgencyLevel]?.color||"#C0392B", textTransform:"capitalize" } },
            ].map(({ label, value, style: s }) => (
              <div key={label} style={{ background:"rgba(192,57,43,.04)", border:"1px solid rgba(192,57,43,.1)", borderRadius:12, padding:"14px 10px" }}>
                <div style={{ fontSize:24, fontWeight:800, marginBottom:6, ...s }}>{value}</div>
                <div style={{ fontSize:11, color:"#9B7B77", textTransform:"uppercase", letterSpacing:.6, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>

          {notified===0 && (
            <div style={{ background:"rgba(230,126,34,.08)", border:"1.5px solid rgba(230,126,34,.25)", borderRadius:12, padding:"14px 16px", marginBottom:22, fontSize:13, color:"#B7560F", lineHeight:1.6 }}>
              No donors were matched at this time. This may be because your hospital doesn't have GPS coordinates set, or no donors with the required blood type are currently available in your area.
            </div>
          )}

          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button className="hl-btn-red" onClick={()=>navigate("/hospital/requests")} style={{ padding:"12px 28px" }}>View All Requests</button>
            <button className="hl-ghost" onClick={()=>{ setResult(null); setForm({ bloodTypeCode:"", unitsNeeded:"", urgencyLevel:"", neededBy:"" }); }}>Create Another</button>
          </div>
        </div>
      </HospitalShell>
    );
  }

  return (
    <HospitalShell title="New Blood Request" subtitle="Create an urgent blood request and alert matching donors.">
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        {serverError && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.4"/><path d="M8 5v3M8 10.5v.5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {serverError}
          </div>
        )}

        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:20, padding:"36px", boxShadow:"0 4px 16px rgba(140,20,20,.06)", display:"flex", flexDirection:"column", gap:24 }}>
          {/* Blood type selector */}
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4A2020", marginBottom:10, letterSpacing:.2 }}>Blood Type Required <span style={{ color:"#C0392B" }}>*</span></label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {BLOOD_TYPES.map(bt => {
                const c = BLOOD_COLORS[bt]||"#C0392B";
                const sel = form.bloodTypeCode===bt;
                return (
                  <button key={bt} type="button" onClick={()=>set("bloodTypeCode",bt)}
                    style={{ padding:"14px 8px", borderRadius:12, border:`2px solid ${sel?c:"#E8D5D0"}`, background:sel?`${c}12`:"#fff", color:sel?c:"#9B7B77", fontFamily:"'Lora',serif", fontSize:20, fontWeight:900, cursor:"pointer", transition:"all .18s", boxShadow:sel?`0 4px 12px ${c}33`:"none" }}>
                    {bt}
                  </button>
                );
              })}
            </div>
            {errors.bloodTypeCode && <span style={{ display:"block", fontSize:12, color:"#C0392B", marginTop:6, fontWeight:500 }}>{errors.bloodTypeCode}</span>}
          </div>

          {/* Units needed */}
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4A2020", marginBottom:8, letterSpacing:.2 }}>Units Needed <span style={{ color:"#C0392B" }}>*</span></label>
            <input type="number" min="1" value={form.unitsNeeded} onChange={e=>set("unitsNeeded",e.target.value)} onBlur={()=>validate("unitsNeeded")}
              placeholder="e.g. 2"
              style={{ width:"100%", padding:"13px 14px", border:`1.5px solid ${errors.unitsNeeded?"#C0392B":form.unitsNeeded?"#1E8449":"#E8D5D0"}`, borderRadius:10, fontSize:15, fontFamily:"'Sora',sans-serif", color:"#1a0a07", transition:"border-color .18s" }}/>
            {errors.unitsNeeded && <span style={{ display:"block", fontSize:12, color:"#C0392B", marginTop:6, fontWeight:500 }}>{errors.unitsNeeded}</span>}
          </div>

          {/* Urgency level */}
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4A2020", marginBottom:10, letterSpacing:.2 }}>Urgency Level <span style={{ color:"#C0392B" }}>*</span></label>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {URGENCY_LEVELS.map(lvl => {
                const meta = URGENCY_META[lvl];
                const sel = form.urgencyLevel===lvl;
                return (
                  <button key={lvl} type="button" onClick={()=>set("urgencyLevel",lvl)}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:`2px solid ${sel?meta.color:"#E8D5D0"}`, background:sel?meta.bg:"#fff", cursor:"pointer", textAlign:"left", transition:"all .18s" }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:meta.color, flexShrink:0, boxShadow:sel?`0 0 0 3px ${meta.color}33`:"none" }}/>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:sel?meta.color:"#1a0a07", textTransform:"capitalize", marginBottom:2 }}>{lvl}</div>
                      <div style={{ fontSize:12, color:"#9B7B77" }}>{meta.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.urgencyLevel && <span style={{ display:"block", fontSize:12, color:"#C0392B", marginTop:6, fontWeight:500 }}>{errors.urgencyLevel}</span>}
          </div>

          {/* Needed by */}
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4A2020", marginBottom:8, letterSpacing:.2 }}>Needed By <span style={{ color:"#C0392B" }}>*</span></label>
            <input type="datetime-local" value={form.neededBy} onChange={e=>set("neededBy",e.target.value)} onBlur={()=>validate("neededBy")}
              min={new Date().toISOString().slice(0,16)}
              style={{ width:"100%", padding:"13px 14px", border:`1.5px solid ${errors.neededBy?"#C0392B":form.neededBy?"#1E8449":"#E8D5D0"}`, borderRadius:10, fontSize:14, fontFamily:"'Sora',sans-serif", color:"#1a0a07", transition:"border-color .18s" }}/>
            {errors.neededBy && <span style={{ display:"block", fontSize:12, color:"#C0392B", marginTop:6, fontWeight:500 }}>{errors.neededBy}</span>}
          </div>

          {/* Info banner */}
          <div style={{ display:"flex", gap:10, padding:"14px 16px", background:"rgba(192,57,43,.04)", border:"1px solid rgba(192,57,43,.12)", borderRadius:12 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}><circle cx="8" cy="8" r="6.5" stroke="#C0392B" strokeWidth="1.3"/><path d="M8 5v4M8 11.5v.5" stroke="#C0392B" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <p style={{ fontSize:13, color:"#7A4A45", lineHeight:1.6 }}>Once submitted, HemoLink will instantly find compatible donors near your hospital and send them SMS alerts. Donors will confirm or decline within seconds.</p>
          </div>

          {/* Submit */}
          <div style={{ display:"flex", gap:12 }}>
            <button type="button" className="hl-ghost" onClick={()=>navigate("/hospital/requests")} style={{ flex:1 }}>Cancel</button>
            <button type="button" disabled={loading} onClick={handleSubmit}
              style={{ flex:2, padding:"14px", background:"linear-gradient(135deg,#C0392B,#8B1A1A)", color:"#fff", border:"none", borderRadius:11, fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", boxShadow:"0 6px 20px rgba(192,57,43,.38)", opacity:loading?.65:1, transition:"all .2s" }}>
              {loading ? "Submitting & Notifying Donors…" : "Submit Blood Request →"}
            </button>
          </div>
        </div>
      </div>
    </HospitalShell>
  );
}
