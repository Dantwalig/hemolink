import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import HospitalShell from "./HospitalShell.jsx";

const ALL_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const BLOOD_COLORS = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };

function stockMeta(u) {
  if (u===0) return { label:"Out of Stock", color:"#C0392B", bg:"rgba(192,57,43,.1)", barColor:"#C0392B" };
  if (u<5)   return { label:"Critically Low", color:"#E67E22", bg:"rgba(230,126,34,.1)", barColor:"#E67E22" };
  if (u<15)  return { label:"Low",            color:"#D4A017", bg:"rgba(212,160,23,.1)", barColor:"#D4A017" };
  return       { label:"Good",            color:"#1E8449", bg:"rgba(30,132,73,.1)",   barColor:"#1E8449" };
}

export default function HospitalInventory() {
  const [inventory, setInventory] = useState({});
  const [editing,   setEditing]   = useState({});
  const [saving,    setSaving]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saved,     setSaved]     = useState(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    api.get("/inventory")
      .then(res => {
        const map = {};
        (res.data.data || []).forEach(item => { map[item.bloodTypeCode] = item.unitsAvailable; });
        setInventory(map);
        setEditing({ ...map });
      })
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (bt) => {
    const units = parseInt(editing[bt], 10);
    if (isNaN(units) || units < 0) { setError("Units must be a non-negative number."); return; }
    setSaving(bt); setError("");
    try {
      await api.put(`/inventory/${bt}`, { unitsAvailable: units });
      setInventory(prev => ({ ...prev, [bt]: units }));
      setSaved(bt);
      setTimeout(() => setSaved(null), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(null); }
  };

  const totalUnits = Object.values(inventory).reduce((sum, v) => sum + (v||0), 0);
  const criticalTypes = ALL_TYPES.filter(bt => (inventory[bt]||0) < 5);

  return (
    <HospitalShell title="Blood Inventory" subtitle="Manage and update your current blood stock levels.">
      {error && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 }}>{error}</div>}

      {/* Summary bar */}
      <div style={{ display:"flex", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:14, padding:"16px 22px", flex:1, minWidth:140 }}>
          <div style={{ fontSize:28, fontWeight:900, color:"#C0392B", fontFamily:"'Lora',serif" }}>{totalUnits}</div>
          <div style={{ fontSize:12, color:"#9B7B77", fontWeight:500, marginTop:4 }}>Total units on hand</div>
        </div>
        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:14, padding:"16px 22px", flex:1, minWidth:140 }}>
          <div style={{ fontSize:28, fontWeight:900, color:criticalTypes.length>0?"#C0392B":"#1E8449", fontFamily:"'Lora',serif" }}>{criticalTypes.length}</div>
          <div style={{ fontSize:12, color:"#9B7B77", fontWeight:500, marginTop:4 }}>Blood types critically low</div>
        </div>
        {criticalTypes.length>0 && (
          <div style={{ background:"rgba(192,57,43,.06)", border:"1.5px solid rgba(192,57,43,.2)", borderRadius:14, padding:"16px 22px", flex:2, minWidth:200, display:"flex", alignItems:"center", gap:12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L2 17h16L10 2z" stroke="#C0392B" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 9v4M10 15.5v.5" stroke="#C0392B" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#C0392B", marginBottom:3 }}>Critical shortage</div>
              <div style={{ fontSize:12, color:"#7A4A45" }}>{criticalTypes.join(", ")} — restock urgently</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:240, gap:16 }}>
          <div style={{ width:32, height:32, border:"3px solid #F0E0DC", borderTopColor:"#C0392B", borderRadius:"50%", animation:"hl-spin .75s linear infinite" }}/>
          <span style={{ color:"#7A4A45" }}>Loading inventory…</span>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {ALL_TYPES.map(bt => {
            const units = inventory[bt] ?? 0;
            const editVal = editing[bt] ?? units;
            const meta = stockMeta(units);
            const color = BLOOD_COLORS[bt]||"#C0392B";
            const pct = Math.min((units/30)*100, 100);
            const isSaving = saving===bt;
            const justSaved = saved===bt;
            const changed = editVal !== units;

            return (
              <div key={bt} style={{ background:"#fff", border:`1.5px solid ${changed?"#C0392B":"#F0E0DC"}`, borderRadius:18, padding:"22px", display:"flex", flexDirection:"column", gap:14, boxShadow:"0 4px 12px rgba(140,20,20,.04)", transition:"all .2s" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:28, fontWeight:900, color, fontFamily:"'Lora',serif" }}>{bt}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:meta.bg, color:meta.color }}>{meta.label}</span>
                </div>

                {/* Bar */}
                <div style={{ background:"#F0E0DC", borderRadius:6, height:8, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:meta.barColor, borderRadius:6, transition:"width .6s ease" }}/>
                </div>

                {/* Input */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7A4A45", textTransform:"uppercase", letterSpacing:.6, marginBottom:6 }}>Units Available</label>
                  <input
                    type="number" min="0" value={editVal}
                    onChange={e => setEditing(prev => ({ ...prev, [bt]: e.target.value }))}
                    style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${changed?"#C0392B":"#E8D5D0"}`, borderRadius:9, fontSize:16, fontWeight:700, fontFamily:"'Sora',sans-serif", color:"#1a0a07", textAlign:"center", transition:"border-color .18s" }}
                  />
                </div>

                <button
                  onClick={()=>handleSave(bt)}
                  disabled={isSaving || !changed}
                  style={{
                    padding:"10px", borderRadius:10, fontSize:13, fontWeight:700, fontFamily:"'Sora',sans-serif", cursor:isSaving||!changed?"not-allowed":"pointer", transition:"all .18s",
                    background: justSaved ? "linear-gradient(135deg,#1E8449,#145A32)" : changed ? "linear-gradient(135deg,#C0392B,#8B1A1A)" : "#F8EDEB",
                    color: changed||justSaved ? "#fff" : "#BBA0A0",
                    border: "none",
                    boxShadow: changed ? "0 4px 12px rgba(192,57,43,.3)" : "none",
                    opacity: isSaving ? .65 : 1,
                  }}
                >
                  {isSaving ? "Saving…" : justSaved ? "Saved!" : changed ? "Save Changes" : "No Changes"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </HospitalShell>
  );
}
