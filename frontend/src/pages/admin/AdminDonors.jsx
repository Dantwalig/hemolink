import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminShell from "./AdminShell.jsx";

const BLOOD_COLORS = { "O+":"#C0392B","O-":"#922B21","A+":"#E67E22","A-":"#B7560F","B+":"#2E86C1","B-":"#1A5276","AB+":"#8E44AD","AB-":"#6C3483" };

function BloodBadge({ type }) {
  const color = BLOOD_COLORS[type] || "#C0392B";
  return <span style={{ background:`${color}14`, color, fontWeight:800, fontSize:12, padding:"3px 10px", borderRadius:20, fontFamily:"'Lora',serif", letterSpacing:.3 }}>{type}</span>;
}

function StatusDot({ active }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:active?"rgba(30,132,73,.1)":"rgba(107,107,107,.1)", color:active?"#1E8449":"#6B6B6B", fontWeight:600, fontSize:11, padding:"3px 10px", borderRadius:20 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:active?"#1E8449":"#9B9B9B", display:"inline-block" }}/>
      {active ? "Available" : "Inactive"}
    </span>
  );
}

export default function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [btFilter, setBtFilter] = useState("all");

  useEffect(() => {
    api.get("/admin/donors")
      .then(res => setDonors(res.data.data || []))
      .catch(() => setError("Failed to load donors."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = donors.filter(d => {
    const matchSearch = !search || d.fullName?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search);
    const matchBt = btFilter==="all" || d.bloodTypeCode===btFilter;
    return matchSearch && matchBt;
  });

  const bloodTypes = [...new Set(donors.map(d=>d.bloodTypeCode).filter(Boolean))].sort();

  return (
    <AdminShell title="Donors" subtitle={`${donors.length} total registered donors.`}>
      {error && <div style={ERR}>{error}</div>}

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9B7B77" strokeWidth="1.3"/><path d="M10 10l2.5 2.5" stroke="#9B7B77" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </span>
          <input placeholder="Search by name or phone…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", padding:"9px 14px 9px 34px", border:"1.5px solid #E8D5D0", borderRadius:9, fontSize:13, fontFamily:"'Sora',sans-serif", color:"#1a0a07" }}/>
        </div>
        <select value={btFilter} onChange={e=>setBtFilter(e.target.value)} style={SEL}>
          <option value="all">All Blood Types</option>
          {bloodTypes.map(bt=><option key={bt} value={bt}>{bt}</option>)}
        </select>
        <div style={{ padding:"9px 16px", background:"rgba(192,57,43,.08)", borderRadius:9, fontSize:13, fontWeight:700, color:"#C0392B" }}>
          {filtered.length} donors
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#9B7B77" }}>Loading donors…</div>
      ) : (
        <div style={{ background:"#fff", border:"1.5px solid #F0E0DC", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 16px rgba(140,20,20,.05)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"linear-gradient(90deg,rgba(192,57,43,.06),rgba(192,57,43,.02))", borderBottom:"1.5px solid #F0E0DC" }}>
                {["Full Name","Phone","Blood Type","District","Status","SMS Consent","Registered"].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#7A4A45", textTransform:"uppercase", letterSpacing:.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:"center", padding:"48px", color:"#9B7B77", fontSize:13 }}>No donors found.</td></tr>
              ) : filtered.map((d,i)=>(
                <tr key={d.donorId} style={{ borderBottom:"1px solid #F8EDEB", background:i%2===0?"#fff":"rgba(253,244,242,.5)", transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(192,57,43,.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"rgba(253,244,242,.5)"}>
                  <td style={TD}><span style={{ fontWeight:600, color:"#1a0a07" }}>{d.fullName}</span></td>
                  <td style={TD}><span style={{ color:"#7A4A45", fontFamily:"monospace", fontSize:12 }}>{d.phone}</span></td>
                  <td style={TD}><BloodBadge type={d.bloodTypeCode}/></td>
                  <td style={TD}><span style={{ color:"#7A4A45", fontSize:13 }}>{d.districtCode || "—"}</span></td>
                  <td style={TD}><StatusDot active={d.available}/></td>
                  <td style={TD}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:d.consentSms?"rgba(30,132,73,.1)":"rgba(107,107,107,.1)", color:d.consentSms?"#1E8449":"#6B6B6B", fontWeight:600, fontSize:11, padding:"3px 10px", borderRadius:20 }}>
                      {d.consentSms ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={TD}><span style={{ fontSize:12, color:"#9B7B77" }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-RW") : "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const ERR = { display:"flex", alignItems:"center", gap:8, background:"#fff2f2", border:"1.5px solid rgba(192,57,43,.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#C0392B", marginBottom:20, fontWeight:500 };
const SEL = { padding:"9px 14px", border:"1.5px solid #E8D5D0", borderRadius:9, fontSize:13, fontFamily:"'Sora',sans-serif", color:"#1a0a07", background:"#fff", cursor:"pointer" };
const TD = { padding:"12px 16px", fontSize:13 };
