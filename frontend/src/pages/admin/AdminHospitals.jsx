import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

function ApprovalBadge({ approved }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:approved?"rgba(30,132,73,.1)":"rgba(230,126,34,.12)", color:approved?"#1E8449":"#B7560F", fontWeight:700, fontSize:11, padding:"4px 12px", borderRadius:20 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:approved?"#1E8449":"#E67E22", display:"inline-block" }}/>
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [approving, setApproving] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/admin/hospitals")
      .then(res => setHospitals(res.data.data || []))
      .catch(() => setError("Failed to load hospitals."))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, approve) => {
    setApproving(a => ({ ...a, [id]: true }));
    try {
      await api.patch(`/admin/hospitals/${id}/approve`, { isApproved: approve });
      setHospitals(hs => hs.map(h => h.hospitalId===id ? { ...h, isApproved:approve } : h));
    } catch { setError("Failed to update hospital."); }
    finally { setApproving(a => ({ ...a, [id]: false })); }
  };

  const filtered = hospitals.filter(h => {
    const matchSearch = !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="pending" && !h.isApproved) || (filter==="approved" && h.isApproved);
    return matchSearch && matchFilter;
  });

  const pending = hospitals.filter(h => !h.isApproved).length;

  return (
    <AdminShell title="Hospitals" subtitle={`${hospitals.length} registered · ${pending} pending approval.`}>
      {error && <div style={ERR}>{error}</div>}

      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9B7B77" strokeWidth="1.3"/><path d="M10 10l2.5 2.5" stroke="#9B7B77" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </span>
          <input placeholder="Search hospitals…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", padding:"9px 14px 9px 34px", border:"1.5px solid #E8D5D0", borderRadius:9, fontSize:13, fontFamily:"'Sora',sans-serif", color:"#1a0a07" }}/>
        </div>
        {["all","pending","approved"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"9px 16px", borderRadius:9, border:`1.5px solid ${filter===f?"#C0392B":"#E8D5D0"}`, background:filter===f?"rgba(192,57,43,.08)":"#fff", color:filter===f?"#C0392B":"#7A4A45", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:filter===f?700:500, cursor:"pointer" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}{f==="pending"&&pending>0?` (${pending})`:""}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#9B7B77" }}>Loading hospitals…</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px", color:"#9B7B77", fontSize:13 }}>No hospitals found.</div>
          ) : filtered.map(h => (
            <div key={h.hospitalId} style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:16, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, boxShadow:"0 2px 8px rgba(140,20,20,.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, flex:1 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(192,57,43,.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="7" width="16" height="13" rx="1.5" stroke="#C0392B" strokeWidth="1.5"/><path d="M7 20v-5h8v5M8 3h6v4H8zM9 11h4M11 9v4" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:"#1a0a07" }}>{h.name}</span>
                    <ApprovalBadge approved={h.isApproved}/>
                  </div>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:"#9B7B77" }}>{h.email}</span>
                    {h.districtCode && <span style={{ fontSize:12, color:"#9B7B77" }}>{h.districtCode}</span>}
                    {h.sector && <span style={{ fontSize:12, color:"#9B7B77" }}>{h.sector}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                {!h.isApproved ? (
                  <button disabled={approving[h.hospitalId]} onClick={()=>handleApprove(h.hospitalId,true)}
                    style={{ padding:"8px 18px", background:"linear-gradient(135deg,#1E8449,#145A32)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", opacity:approving[h.hospitalId]?.65:1 }}>
                    {approving[h.hospitalId]?"…":"Approve"}
                  </button>
                ) : (
                  <button disabled={approving[h.hospitalId]} onClick={()=>handleApprove(h.hospitalId,false)}
                    style={{ padding:"8px 18px", background:"transparent", color:"#C0392B", border:"1.5px solid #C0392B", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", opacity:approving[h.hospitalId]?.65:1 }}>
                    {approving[h.hospitalId]?"…":"Revoke"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

const ERR = { display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 };
