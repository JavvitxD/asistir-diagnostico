import { useState } from "react";
import HeaderBar from "../components/HeaderBar";
import { PREGUNTAS, ETAPA_NOMBRE, ETAPA_COLOR, ETAPA_BG } from "../data/preguntas";

const BLUE = "#1a4480";

export default function Screen2Cuestionario({ onNext, onBack }) {
  const [qi, setQi] = useState(0);
  const [resp, setResp] = useState(PREGUNTAS.map(() => ({ val: null, obs: "" })));

  const q = PREGUNTAS[qi];
  const r = resp[qi];
  const pct = Math.round(((qi + 1) / PREGUNTAS.length) * 100);
  const isLast = qi === PREGUNTAS.length - 1;

  const setVal = (v) => setResp((prev) => prev.map((item, i) => i === qi ? { ...item, val: v } : item));
  const setObs = (v) => setResp((prev) => prev.map((item, i) => i === qi ? { ...item, obs: v } : item));

  const navNext = () => {
    if (isLast) { onNext(resp); return; }
    setQi((i) => i + 1);
  };
  const navPrev = () => { if (qi > 0) setQi((i) => i - 1); };

  const btnStyle = (color, bg, active) => ({
    padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: `1.5px solid ${active ? color : "#d0d7e3"}`,
    background: active ? bg : "transparent", color: active ? color : "#888",
    transition: "all .15s"
  });

  return (
    <div style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden" }}>
      <HeaderBar sub="Lista de verificación F-MP-002" badge={`${qi + 1}/${PREGUNTAS.length}`} />

      {/* Progress */}
      <div style={{ background: "#f5f7fa", padding: ".6rem 1.5rem", borderBottom: "1px solid #e8ecf2" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 6 }}>
          <span>Etapa {ETAPA_NOMBRE[q.e]}</span>
          <span>Pregunta {qi + 1} de {PREGUNTAS.length}</span>
        </div>
        <div style={{ height: 3, background: "#dde3ee", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: BLUE, borderRadius: 2, transition: "width .3s" }} />
        </div>
      </div>

      {/* Stage banner */}
      <div style={{ background: ETAPA_BG[q.e], padding: ".55rem 1.5rem", fontSize: 12, fontWeight: 600, color: ETAPA_COLOR[q.e], borderBottom: "1px solid #e8ecf2" }}>
        ◉ Etapa {ETAPA_NOMBRE[q.e]}
      </div>

      {/* Question */}
      <div style={{ padding: "1.5rem" }}>
        <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: "1rem", color: "#222" }}>{q.t}</p>
        <span style={{ fontSize: 11, color: "#888", background: "#f0f2f5", borderRadius: 4, padding: "3px 8px", display: "inline-block", marginBottom: "1.1rem" }}>
          📋 {q.n}
        </span>

        <div style={{ display: "flex", gap: 8, marginBottom: ".9rem", flexWrap: "wrap" }}>
          <button style={btnStyle("#0F6E56", "#E8F8F2", r.val === "SI")} onClick={() => setVal("SI")}>✓ Sí cumple</button>
          <button style={btnStyle("#A32D2D", "#FCEBEB", r.val === "NO")} onClick={() => setVal("NO")}>✗ No cumple</button>
          <button style={btnStyle("#555", "#f0f2f5", r.val === "NA")} onClick={() => setVal("NA")}>No aplica</button>
        </div>

        {r.val && (
          <textarea
            value={r.obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Observaciones o evidencias (opcional)..."
            rows={2}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 13, resize: "none", boxSizing: "border-box", color: "#333" }}
          />
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid #e8ecf2", background: "#f5f7fa" }}>
        <button onClick={navPrev} disabled={qi === 0} style={{ opacity: qi === 0 ? .4 : 1, background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: qi === 0 ? "default" : "pointer" }}>
          ← Anterior
        </button>
        <button onClick={navNext} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {isLast ? "Ver resultados →" : "Siguiente →"}
        </button>
      </div>
    </div>
  );
}
