const BLUE = "#1a4480";

export default function HeaderBar({ sub, badge }) {
  return (
    <div style={{
      background: BLUE, borderRadius: "12px 12px 0 0",
      padding: ".85rem 1.5rem", display: "flex", alignItems: "center", gap: 12
    }}>
      <div style={{
        width: 38, height: 38, background: "#fff", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: ".02em" }}>ASISTIR IPS Y HSE</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 1 }}>{sub || "Medicina Preventiva y del Trabajo"}</div>
      </div>
      {badge && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.12)", borderRadius: 4, padding: "2px 8px" }}>
          {badge}
        </div>
      )}
    </div>
  );
}
