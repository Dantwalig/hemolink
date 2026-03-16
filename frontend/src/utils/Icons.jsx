// Shared inline SVG icons — no emojis, no external dependencies

export const IconDashboard = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
    <rect x="10" y="1" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const IconBlood = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M9 2C9 2 3 8.5 3 12a6 6 0 0 0 12 0C15 8.5 9 2 9 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6.5 13a2.5 2.5 0 0 0 2.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconBox = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M2 5.5l7-3 7 3v7l-7 3-7-3v-7z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 2.5v13M2 5.5l7 3 7-3" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const IconLogout = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 11l3-3-3-3M14 8H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconClock = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
    <path d="M10 6v4l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconCheckCircle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
    <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconList = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconWarning = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M9.133 3.5L2 16.5h16L10.867 3.5a1 1 0 0 0-1.734 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 9v3M10 14.5v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconEmail = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.4"/>
    <path d="M1 4l7 5 7-5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconLock = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.4"/>
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="11" r="1" fill={color}/>
  </svg>
);

export const IconPhone = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="4" y="1" width="8" height="14" rx="2" stroke={color} strokeWidth="1.4"/>
    <circle cx="8" cy="12" r="0.8" fill={color}/>
  </svg>
);

export const IconUser = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.4"/>
    <path d="M2 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconPin = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1a5 5 0 0 1 5 5c0 3.5-5 9-5 9S3 9.5 3 6a5 5 0 0 1 5-5z" stroke={color} strokeWidth="1.4"/>
    <circle cx="8" cy="6" r="1.5" stroke={color} strokeWidth="1.4"/>
  </svg>
);

export const IconGlobe = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.4"/>
    <path d="M2 8h12M8 2a9 9 0 0 1 0 12M8 2a9 9 0 0 0 0 12" stroke={color} strokeWidth="1.4"/>
  </svg>
);

export const IconBuilding = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="2" y="5" width="12" height="10" rx="1" stroke={color} strokeWidth="1.4"/>
    <path d="M5 15v-4h6v4M8 1v4M5 8h1M10 8h1M5 11h1M10 11h1" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconShield = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5l5.5 2v4.5C13.5 11 11 13.5 8 14.5 5 13.5 2.5 11 2.5 8V3.5L8 1.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 8l1.5 1.5L10.5 6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconEye = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke={color} strokeWidth="1.4"/>
    <circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.4"/>
  </svg>
);

export const IconEyeOff = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M2 2l12 12M6.5 6.5A2 2 0 0 0 9.5 9.5M4 4.5C2.5 5.8 1 8 1 8s2.5 5 7 5c1.4 0 2.7-.4 3.8-1M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.7 1.3-2 2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconAlert = ({ size = 14, color = "#C0392B" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.4"/>
    <path d="M7 4.5v3M7 9.5v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconCheck = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
    <path d="M2 6.5l3.5 3.5 5.5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconAccept = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M3 9l4 4 8-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconDecline = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M4 4l10 10M14 4L4 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconCalendar = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="1.5" stroke={color} strokeWidth="1.4"/>
    <path d="M1 7h14M5 1v4M11 1v4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconPlus = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M2 8h12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconSuccess = ({ size = 52, color = "#1E8449" }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08"/>
    <path d="M15 26l8 8 14-14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconErrorCircle = ({ size = 52, color = "#C0392B" }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08"/>
    <path d="M18 18l16 16M34 18L18 34" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const IconExpired = ({ size = 52, color = "#E67E22" }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08"/>
    <circle cx="26" cy="26" r="14" stroke={color} strokeWidth="2"/>
    <path d="M26 18v8l5 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconHospitalLarge = ({ size = 52, color = "#C0392B" }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect x="6" y="16" width="40" height="32" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M18 48V34h16v14" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M20 8h12v8H20z" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconHeartbeat = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M2 9h3l2 4 4-9 2 5h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconBell = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M9 2a4 4 0 0 0-4 4v3.5l-1.5 2v1h11v-1l-1.5-2V6a4 4 0 0 0-4-4z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 13.5a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconPower = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconMessage = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M14 10.5a1.5 1.5 0 0 1-1.5 1.5H5.5L2 14.5V4a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 14 4v6.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconMatch = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="5" cy="8" r="3" stroke={color} strokeWidth="1.5"/>
    <circle cx="11" cy="8" r="3" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const IconFile = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 2.5a1 1 0 0 1 1-1h5.5l3.5 3.5v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-10.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);