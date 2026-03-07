import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api.js";

export default function DonorRespondPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get("token"); // from SMS link e.g. /donor/respond?token=abc123

  const [status,      setStatus]      = useState("loading"); // loading | ready | success | error | expired
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
      // api.js handles baseURL ('/api') automatically
      const res = await api.get(`/notifications/token/${token}`);
      setRequestData(res.data);
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
      // api.js handles baseURL ('/api') automatically
      await api.post("/notifications/respond", {
        token:           token,
        response_status: donorResponse, // "Accepted" or "Declined"
      });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  /* ── LOADING ── */
  if (status === "loading") return (
    <div style={styles.centeredPage}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Loading blood request details…</p>
    </div>
  );

  /* ── ERROR ── */
  if (status === "error") return (
    <div style={styles.centeredPage}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
      <h2 style={styles.stateTitle}>Invalid Request</h2>
      <p style={styles.stateDesc}>This link is invalid or has already been used. Make sure you copied the full link from your SMS.</p>
      <button style={styles.btnOutline} onClick={() => navigate("/login")}>Go to Donor Login</button>
    </div>
  );

  /* ── EXPIRED ── */
  if (status === "expired") return (
    <div style={styles.centeredPage}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>⏰</div>
      <h2 style={styles.stateTitle}>Request Expired</h2>
      <p style={styles.stateDesc}>This blood request has already been fulfilled or the response window has closed. Thank you for being a registered donor.</p>
      <button style={styles.btnOutline} onClick={() => navigate("/login")}>Go to My Dashboard</button>
    </div>
  );

  /* ── SUCCESS ── */
  if (status === "success") return (
    <div style={styles.centeredPage}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>{response === "Accepted" ? "✅" : "🙏"}</div>
      <h2 style={styles.stateTitle}>{response === "Accepted" ? "Thank you!" : "Response received"}</h2>
      <p style={styles.stateDesc}>
        {response === "Accepted"
          ? `You've confirmed you can donate. ${requestData?.hospital_name} has been notified. Please head there as soon as possible and mention HemoLink at reception.`
          : "We've noted that you're unable to donate right now. No worries — you may be contacted for future requests."}
      </p>
      {response === "Accepted" && (
        <div style={styles.hospitalCard}>
          <span style={{ fontSize: 28 }}>🏥</span>
          <div>
            <div style={styles.hospitalCardName}>{requestData?.hospital_name}</div>
            <div style={styles.hospitalCardSub}>Please arrive as soon as possible · Mention HemoLink</div>
          </div>
        </div>
      )}
      <button style={styles.btnPrimary} onClick={() => navigate("/login")}>Go to My Dashboard →</button>
    </div>
  );

  /* ── MAIN VIEW ── */
  const urgencyColor = { Critical: "#C0392B", High: "#E67E22", Medium: "#F1C40F", Low: "#1E8449" }[requestData?.urgency_level] || "#C0392B";
  const neededBy     = requestData?.needed_by
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
            <span>{requestData?.urgency_level} — Blood Needed Now</span>
          </div>

          <h1 style={styles.cardTitle}>You've been matched as a donor.</h1>
          <p style={styles.cardSub}>A hospital near you needs your blood type urgently. Please review the details and let them know if you can help.</p>

          <div style={styles.detailsGrid}>
            {[
              { label: "Hospital",         value: `🏥 ${requestData?.hospital_name}` },
              { label: "Blood Type Needed", value: `🩸 ${requestData?.blood_type_code}`, red: true },
              { label: "Units Needed",      value: `${requestData?.units_needed} unit(s)` },
              { label: "Distance from You", value: `📍 ${requestData?.distance_km} km away` },
              { label: "Needed By",         value: `⏰ ${neededBy}` },
              { label: "Urgency Level",     value: requestData?.urgency_level, urgency: true },
            ].map((d) => (
              <div key={d.label} style={styles.detailItem}>
                <span style={styles.detailLabel}>{d.label}</span>
                <span style={{ ...styles.detailValue, ...(d.red ? { color: "#C0392B", fontSize: 22, fontWeight: 800 } : {}), ...(d.urgency ? { color: urgencyColor, fontWeight: 700 } : {}) }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.divider} />
          <p style={styles.questionText}>Can you donate right now?</p>

          <div style={styles.responseRow}>
            <button style={{ ...styles.btnAccept, ...(loading ? styles.btnDisabled : {}) }}
              onClick={() => handleRespond("Accepted")} disabled={loading}>
              {loading && response === "Accepted" ? <><span style={styles.spinner} />&nbsp;Confirming…</> : "✅ Yes, I can donate"}
            </button>
            <button style={{ ...styles.btnDecline, ...(loading ? styles.btnDisabled : {}) }}
              onClick={() => handleRespond("Declined")} disabled={loading}>
              {loading && response === "Declined" ? <><span style={styles.spinner} />&nbsp;Sending…</> : "❌ No, I can't right now"}
            </button>
          </div>

          <p style={styles.noteText}>
            ℹ️ Your response will be sent to the hospital immediately. If you accept, please go to the hospital as soon as possible and mention HemoLink at reception.
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
  urgencyBadge:   { display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 20, padding: "7px 16px", marginBottom: 24, color: "#fff", fontSize: 13, fontWeight: 600 },
  pulseDot:       { width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "inline-block" },
  cardTitle:      { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 10, lineHeight: 1.2 },
  cardSub:        { fontSize: 14, color: "#6B6B6B", lineHeight: 1.65, marginBottom: 28 },
  detailsGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 },
  detailItem:     { background: "#FDF6EE", border: "1px solid #DDD5D0", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  detailLabel:    { fontSize: 11, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 },
  detailValue:    { fontSize: 15, color: "#1C1C1C", fontWeight: 600 },
  divider:        { borderTop: "1px solid #DDD5D0", margin: "8px 0 24px" },
  questionText:   { fontSize: 17, fontWeight: 700, color: "#1C1C1C", marginBottom: 16, textAlign: "center" },
  responseRow:    { display: "flex", gap: 14, marginBottom: 20 },
  btnAccept:      { flex: 1, padding: "14px 0", background: "#1E8449", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDecline:     { flex: 1, padding: "14px 0", background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled:    { opacity: 0.6, cursor: "not-allowed" },
  spinner:        { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" },
  noteText:       { fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.6, textAlign: "center", background: "#F0E8DF", borderRadius: 9, padding: "10px 14px" },
  centeredPage:   { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif", textAlign: "center", background: "#FDF6EE" },
  loadingSpinner: { width: 40, height: 40, border: "3px solid #DDD5D0", borderTopColor: "#C0392B", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 },
  loadingText:    { fontSize: 14, color: "#6B6B6B" },
  stateTitle:     { fontSize: 26, fontWeight: 800, color: "#1C1C1C", marginBottom: 12 },
  stateDesc:      { fontSize: 15, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28, maxWidth: 440 },
  hospitalCard:   { display: "flex", alignItems: "center", gap: 14, background: "#EAFAF1", border: "1px solid #A9DFBF", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" },
  hospitalCardName: { fontSize: 15, fontWeight: 700, color: "#1C1C1C", marginBottom: 4 },
  hospitalCardSub:  { fontSize: 12, color: "#1E8449" },
  btnPrimary:     { padding: "13px 32px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnOutline:     { padding: "13px 32px", background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
};