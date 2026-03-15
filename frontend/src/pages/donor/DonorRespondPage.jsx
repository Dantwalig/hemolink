import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api.js";
import { IconAccept, IconDecline, IconSuccess, IconErrorCircle, IconExpired, IconBlood, IconCalendar, IconPin, IconWarning } from "../../utils/Icons.jsx";

export default function DonorRespondPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get("token");

  const [status,      setStatus]      = useState("loading");
  const [response,    setResponse]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetchRequestDetails();
  }, [token]);

  const fetchRequestDetails = async () => {
    setStatus("loading");
    try {
      const res = await api.get(`/notifications/token/${token}`);
      setRequestData(res.data.data);
      setStatus("ready");
    } catch (err) {
      if (err.response?.status === 410) { setStatus("expired"); return; }
      setStatus("error");
    }
  };

  const handleRespond = async (donorResponse) => {
    setLoading(true);
    setResponse(donorResponse);
    try {
      await api.post("/notifications/respond", { token, response_status: donorResponse });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return (
    <div style={styles.centeredPage}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Loading blood request details…</p>
    </div>
  );

  if (status === "error") return (
    <div style={styles.centeredPage}>
      <IconErrorCircle size={56} color="#C0392B" />
      <h2 style={styles.stateTitle}>Invalid Request</h2>
      <p style={styles.stateDesc}>This link is invalid or has already been used. Make sure you copied the full link from your SMS.</p>
      <button style={styles.btnOutline} onClick={() => navigate("/login")}>Go to Donor Login</button>
    </div>
  );

  if (status === "expired") return (
    <div style={styles.centeredPage}>
      <IconExpired size={56} color="#E67E22" />
      <h2 style={styles.stateTitle}>Request Expired</h2>
      <p style={styles.stateDesc}>This blood request has already been fulfilled or the response window has closed. Thank you for being a registered donor.</p>
      <button style={styles.btnOutline} onClick={() => navigate("/login")}>Go to My Dashboard</button>
    </div>
  );

  if (status === "success") return (
    <div style={styles.centeredPage}>
      <IconSuccess size={56} color={response === "Accepted" ? "#1E8449" : "#6B6B6B"} />
      <h2 style={styles.stateTitle}>{response === "Accepted" ? "Thank you!" : "Response received"}</h2>
      <p style={styles.stateDesc}>
        {response === "Accepted"
          ? `You've confirmed you can donate. ${requestData?.hospital_name} has been notified. Please head there as soon as possible and mention HemoLink at reception.`
          : "We've noted that you're unable to donate right now. No worries — you may be contacted for future requests."}
      </p>
      {response === "Accepted" && (
        <div style={styles.hospitalCard}>
          <div style={styles.hospitalIconWrap}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="15" rx="1.5" stroke="#1E8449" strokeWidth="1.5"/>
              <path d="M9 22v-6h6v6M10 3h4v4h-4zM9 12h2M13 12h2M9 16h2M13 16h2" stroke="#1E8449" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={styles.hospitalCardName}>{requestData?.hospital_name}</div>
            <div style={styles.hospitalCardSub}>Please arrive as soon as possible &middot; Mention HemoLink</div>
          </div>
        </div>
      )}
      <button style={styles.btnPrimary} onClick={() => navigate("/login")}>Go to My Dashboard</button>
    </div>
  );

  const urgencyRaw    = requestData?.urgency_level || "";
  const urgencyLower  = urgencyRaw.toLowerCase();
  const urgencyColor  = { critical: "#C0392B", high: "#E67E22", medium: "#F1C40F", low: "#1E8449" }[urgencyLower] || "#C0392B";
  const urgencyDisplay= urgencyRaw.charAt(0).toUpperCase() + urgencyRaw.slice(1);
  const neededBy      = requestData?.needed_by
    ? new Date(requestData.needed_by).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })
    : "As soon as possible";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDrop}><span style={styles.logoDropText}>H</span></div>
          <span style={styles.logoText}>Hemo<span style={styles.logoRed}>Link</span> Rwanda</span>
        </div>
        <span style={styles.headerTag}>Emergency Blood Request</span>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <div style={{ ...styles.urgencyBadge, background: urgencyColor }}>
            <span style={styles.pulseDot} />
            <span>{urgencyDisplay} — Blood Needed Now</span>
          </div>

          <h1 style={styles.cardTitle}>You've been matched as a donor.</h1>
          <p style={styles.cardSub}>A hospital near you needs your blood type urgently. Please review the details and let them know if you can help.</p>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Hospital</span>
              <span style={styles.detailValue}>{requestData?.hospital_name}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Blood Type Needed</span>
              <span style={{ ...styles.detailValue, color: "#C0392B", fontSize: 22, fontWeight: 800 }}>{requestData?.blood_type_code}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Units Needed</span>
              <span style={styles.detailValue}>{requestData?.units_needed} unit(s)</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Distance from You</span>
              <span style={styles.detailValue}>
                {requestData?.distance_km != null ? `${requestData.distance_km} km away` : "See hospital name"}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Needed By</span>
              <span style={styles.detailValue}>{neededBy}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Urgency Level</span>
              <span style={{ ...styles.detailValue, color: urgencyColor, fontWeight: 700 }}>{urgencyDisplay}</span>
            </div>
          </div>

          <div style={styles.divider} />
          <p style={styles.questionText}>Can you donate right now?</p>

          <div style={styles.responseRow}>
            <button style={{ ...styles.btnAccept, ...(loading ? styles.btnDisabled : {}) }}
              onClick={() => handleRespond("Accepted")} disabled={loading}>
              <IconAccept size={16} color="#fff" />
              {loading && response === "Accepted" ? "Confirming…" : "Yes, I can donate"}
            </button>
            <button style={{ ...styles.btnDecline, ...(loading ? styles.btnDisabled : {}) }}
              onClick={() => handleRespond("Declined")} disabled={loading}>
              <IconDecline size={16} color="#C0392B" />
              {loading && response === "Declined" ? "Sending…" : "No, I can't right now"}
            </button>
          </div>

          <p style={styles.noteText}>
            Your response will be sent to the hospital immediately. If you accept, please go to the hospital as soon as possible and mention HemoLink at reception.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight: "100vh", background: "#FDF6EE", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" },
  header:         { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", background: "#fff", borderBottom: "1px solid #DDD5D0", position: "sticky", top: 0, zIndex: 100 },
  logo:           { display: "flex", alignItems: "center", gap: 10 },
  logoDrop:       { width: 32, height: 32, background: "#C0392B", borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoDropText:   { transform: "rotate(45deg)", color: "#fff", fontWeight: 800, fontSize: 12 },
  logoText:       { fontWeight: 800, fontSize: 17, letterSpacing: -0.3 },
  logoRed:        { color: "#C0392B" },
  headerTag:      { fontSize: 11, color: "#6B6B6B", fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase" },
  content:        { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" },
  card:           { background: "#fff", border: "1px solid #DDD5D0", borderRadius: 20, padding: "40px 48px", maxWidth: 600, width: "100%", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" },
  urgencyBadge:   { display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 20, padding: "7px 16px", marginBottom: 22, color: "#fff", fontSize: 13, fontWeight: 600 },
  pulseDot:       { width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "inline-block" },
  cardTitle:      { fontSize: 24, fontWeight: 800, color: "#1C1C1C", marginBottom: 10, lineHeight: 1.2 },
  cardSub:        { fontSize: 14, color: "#6B6B6B", lineHeight: 1.65, marginBottom: 26 },
  detailsGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 26 },
  detailItem:     { background: "#FDF6EE", border: "1px solid #DDD5D0", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 },
  detailLabel:    { fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 },
  detailValue:    { fontSize: 14, color: "#1C1C1C", fontWeight: 600 },
  divider:        { borderTop: "1px solid #DDD5D0", margin: "6px 0 22px" },
  questionText:   { fontSize: 16, fontWeight: 700, color: "#1C1C1C", marginBottom: 14, textAlign: "center" },
  responseRow:    { display: "flex", gap: 12, marginBottom: 18 },
  btnAccept:      { flex: 1, padding: "13px 0", background: "#1E8449", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDecline:     { flex: 1, padding: "13px 0", background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled:    { opacity: 0.6, cursor: "not-allowed" },
  noteText:       { fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.6, textAlign: "center", background: "#F0E8DF", borderRadius: 9, padding: "10px 14px" },
  centeredPage:   { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif", textAlign: "center", background: "#FDF6EE", gap: 16 },
  loadingSpinner: { width: 40, height: 40, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%", marginBottom: 8 },
  loadingText:    { fontSize: 14, color: "#6B6B6B" },
  stateTitle:     { fontSize: 24, fontWeight: 800, color: "#1C1C1C", margin: 0 },
  stateDesc:      { fontSize: 15, color: "#6B6B6B", lineHeight: 1.7, maxWidth: 440, margin: 0 },
  hospitalCard:   { display: "flex", alignItems: "center", gap: 14, background: "#EAFAF1", border: "1px solid #A9DFBF", borderRadius: 12, padding: "14px 18px", textAlign: "left" },
  hospitalIconWrap:{ width: 44, height: 44, background: "#D5F5E3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  hospitalCardName:{ fontSize: 15, fontWeight: 700, color: "#1C1C1C", marginBottom: 3 },
  hospitalCardSub: { fontSize: 12, color: "#1E8449" },
  btnPrimary:     { padding: "13px 32px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnOutline:     { padding: "13px 32px", background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
};