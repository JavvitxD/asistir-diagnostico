import { useRef } from "react";
import HeaderBar from "../components/HeaderBar";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { calcStats, getNosIdx, getPrioridad, mesDesde, semaforo } from "../utils/stats";

const BLUE = "#1a4480";

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: "#f5f7fa", borderRadius: 8, padding: ".9rem 1rem", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#222" }}>{value}</div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </>
  );
}

function Card({ children }) {
  return <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: ".5rem" }}>{children}</div>;
}

export default function Screen4Propuesta({ empresa, respuestas, fechas, onReiniciar, onRevisar }) {
  const propRef = useRef(null);
  const stats = calcStats(respuestas);
  const nosIdx = getNosIdx(respuestas);
  const plazo = parseInt(fechas.plazo) || 6;

  const acts = nosIdx.map((qi, idx) => ({
    doc: PREGUNTAS[qi].d,
    norma: PREGUNTAS[qi].n,
    e: PREGUNTAS[qi].e,
    prio: getPrioridad(PREGUNTAS[qi].e),
    mes: mesDesde(fechas.inicio, Math.floor(idx / (Math.max(nosIdx.length, 1) / plazo))),
  }));

  const normSet = {};
  nosIdx.forEach((i) => { normSet[PREGUNTAS[i].n] = (normSet[PREGUNTAS[i].n] || 0) + 1; });

  const hoy = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const costo = (nosIdx.length * 180000).toLocaleString("es-CO");

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #propuesta-print, #propuesta-print * { visibility: visible; }
          #propuesta-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action buttons */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
        <button onClick={handlePrint} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ⬇ Descargar / Imprimir PDF
        </button>
        <button onClick={onRevisar} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
          ✏ Revisar respuestas
        </button>
        <button onClick={onReiniciar} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
          ↺ Nuevo diagnóstico
        </button>
      </div>

      <div id="propuesta-print" ref={propRef} style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: BLUE, padding: "1.25rem 1.5rem", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".5rem" }}>
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>♥</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Propuesta de implementación</div>
              <div style={{ fontSize: 12, opacity: .75 }}>ASISTIR IPS Y HSE · F-MP-002 v2 · {hoy}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, opacity: .85 }}>
            🏢 {empresa.empresa}{empresa.sector ? " · " + empresa.sector : ""}{empresa.workers ? " · " + empresa.workers + " trabajadores" : ""}{empresa.ciudad ? " · " + empresa.ciudad : ""}
          </div>
          {empresa.responsable && <div style={{ fontSize: 12, opacity: .7, marginTop: 3 }}>Responsable SST: {empresa.responsable} · {empresa.correo}</div>}
        </div>

        <div style={{ padding: "1.5rem" }}>
          {/* Banner */}
          {nosIdx.length === 0 ? (
            <div style={{ background: "#E8F8F2", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: "#0F6E56", marginBottom: "1.25rem", display: "flex", gap: 8 }}>
              ✅ ¡Excelente! El programa cumple con todos los ítems verificados. Se recomienda mantener el ciclo PHVA de revisión periódica.
            </div>
          ) : (
            <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: BLUE, marginBottom: "1.25rem", display: "flex", gap: 8, lineHeight: 1.5 }}>
              ⓘ Se identificaron <strong>&nbsp;{nosIdx.length}&nbsp;</strong> ítem{nosIdx.length !== 1 ? "s" : ""} por implementar. El cumplimiento global actual es del <strong>&nbsp;{stats.total}%</strong>.
            </div>
          )}

          {/* Metrics */}
          <Section title="Cumplimiento por etapa PHVA" icon="📊">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
              {["P", "H", "V", "A"].map((e) => (
                <MetricCard key={e} label={ETAPA_NOMBRE[e]} value={stats[e].pct + "%"} color={semaforo(stats[e].pct)} />
              ))}
              <MetricCard label="Total general" value={stats.total + "%"} color={semaforo(stats.total)} />
            </div>

            {/* Bar chart */}
            <Card>
              {["P", "H", "V", "A"].map((e) => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div style={{ fontSize: 12, width: 64, color: "#666", flexShrink: 0 }}>{ETAPA_NOMBRE[e]}</div>
                  <div style={{ flex: 1, height: 18, background: "#eef1f7", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: stats[e].pct + "%", height: "100%", background: BAR_COLOR[e], borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{stats[e].pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Section>

          {nosIdx.length > 0 && (
            <>
              {/* Missing docs */}
              <Section title={`Documentos faltantes (${nosIdx.length})`} icon="📁">
                <Card>
                  {nosIdx.slice(0, 12).map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                      <span style={{ color: "#E24B4A", flexShrink: 0 }}>✗</span>
                      <span style={{ flex: 1 }}>{PREGUNTAS[i].d}</span>
                      <span style={{ fontSize: 11, background: "#f0f2f5", borderRadius: 4, padding: "2px 7px", color: "#666", whiteSpace: "nowrap" }}>{PREGUNTAS[i].n}</span>
                    </div>
                  ))}
                  {nosIdx.length > 12 && <p style={{ fontSize: 12, color: "#999", paddingTop: 6 }}>+ {nosIdx.length - 12} documentos adicionales.</p>}
                </Card>
              </Section>

              {/* Normative */}
              <Section title="Marco normativo a fortalecer" icon="📜">
                <Card>
                  {Object.entries(normSet).map(([n, c]) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                      <span style={{ color: BLUE, flexShrink: 0 }}>📋</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{n}</span>
                      <span style={{ fontSize: 11, background: "#e8f0fb", color: BLUE, borderRadius: 4, padding: "2px 7px" }}>{c} ítem{c > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </Card>
              </Section>

              {/* Work plan */}
              <Section title={`Plan de trabajo — ${plazo} meses`} icon="📅">
                <Card>
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", paddingBottom: 6, borderBottom: "1px solid #eee" }}>
                    <div />
                    <div>Actividad / Documento</div>
                    <div>Fecha</div>
                    <div>Prioridad</div>
                  </div>
                  {acts.slice(0, 16).map((a, idx) => {
                    const prioBg = a.prio === "Alta" ? "#FCEBEB" : a.prio === "Media" ? "#FFF8EC" : "#E8F8F2";
                    const prioC = a.prio === "Alta" ? "#A32D2D" : a.prio === "Media" ? "#854F0B" : "#0F6E56";
                    return (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, alignItems: "start", padding: ".55rem 0", borderBottom: "1px solid #f5f7fa", fontSize: 13 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: BLUE }}>{idx + 1}</div>
                        <div style={{ lineHeight: 1.5 }}>{a.doc}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{a.mes}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: prioBg, color: prioC, textAlign: "center" }}>{a.prio}</div>
                      </div>
                    );
                  })}
                  {acts.length > 16 && <p style={{ fontSize: 12, color: "#999", paddingTop: 6 }}>+ {acts.length - 16} actividades adicionales en el plan completo.</p>}
                </Card>
              </Section>

              {/* Investment */}
              <Section title="Estimado de inversión" icon="💰">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: ".5rem" }}>
                  <MetricCard label="Ítems a implementar" value={nosIdx.length} />
                  <MetricCard label="Estimado referencial" value={"$" + costo} />
                </div>
                <p style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>
                  * Valor estimado de referencia. Asistir IPS y HSE emitirá una cotización formal tras reunión de alcance con el equipo SST.<br />
                  📧 gestion.negocios@asistiripsyhse.com.co · 📞 3204966084 · 3102793991
                </p>
              </Section>
            </>
          )}

          {/* Footer */}
          <div style={{ borderTop: "1px solid #e8ecf2", marginTop: "1.5rem", paddingTop: "1rem", fontSize: 12, color: "#aaa", textAlign: "center" }}>
            Diagnóstico generado por ASISTIR IPS Y HSE · Calle 17 N° 27-56, Yopal · www.asistiripsyhse.com.co
          </div>
        </div>
      </div>
    </div>
  );
}
