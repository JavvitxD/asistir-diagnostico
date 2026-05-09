import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { calcStats, getNosIdx, getPrioridad, mesDesde, semaforo } from "../utils/stats";
import ChatBot from "./ChatBot";

const BLUE = "#1a4480";

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: "#f5f7fa", borderRadius: 8, padding: ".9rem 1rem", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#222" }}>{value}</div>
    </div>
  );
}

function Card({ children }) {
  return <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: ".75rem" }}>{children}</div>;
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

export default function Screen4Propuesta({ empresa, respuestas, fechas, onReiniciar, onRevisar }) {
  const [guardado, setGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  const stats = calcStats(respuestas);
  const nosIdx = getNosIdx(respuestas);
  const plazo = parseInt(fechas.plazo) || 6;

  const acts = nosIdx.map((qi, idx) => ({
    doc: PREGUNTAS[qi].d,
    norma: PREGUNTAS[qi].n,
    prio: getPrioridad(PREGUNTAS[qi].e),
    mes: mesDesde(fechas.inicio, Math.floor(idx / (Math.max(nosIdx.length, 1) / plazo))),
  }));

  const normSet = {};
  nosIdx.forEach((i) => { normSet[PREGUNTAS[i].n] = (normSet[PREGUNTAS[i].n] || 0) + 1; });

  const hoy = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const costo = (nosIdx.length * 180000).toLocaleString("es-CO");

  useEffect(() => {
    const guardar = async () => {
      try {
        const { error } = await supabase.from("diagnosticos").insert({
          empresa: empresa.empresa, sector: empresa.sector, workers: empresa.workers,
          responsable: empresa.responsable, correo: empresa.correo, ciudad: empresa.ciudad,
          fecha_inicio: fechas.inicio, fecha_limite: fechas.limite, plazo: fechas.plazo,
          respuestas, stats, cumplimiento_total: stats.total, items_faltantes: nosIdx.length,
        });
        if (error) setErrorGuardado("No se pudo guardar el diagnóstico.");
        else setGuardado(true);
      } catch { setErrorGuardado("Error de conexión."); }
    };
    guardar();
  }, []);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #propuesta-print, #propuesta-print * { visibility: visible; }
          #propuesta-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Botones */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => window.print()} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ⬇ Descargar / Imprimir PDF
        </button>
        <button onClick={onRevisar} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>✏ Revisar respuestas</button>
        <button onClick={onReiniciar} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>↺ Nuevo diagnóstico</button>
        {guardado && <span style={{ fontSize: 12, color: "#0F6E56", background: "#E8F8F2", borderRadius: 6, padding: "4px 10px" }}>✓ Diagnóstico guardado</span>}
        {errorGuardado && <span style={{ fontSize: 12, color: "#A32D2D", background: "#FCEBEB", borderRadius: 6, padding: "4px 10px" }}>⚠ {errorGuardado}</span>}
      </div>

      <div id="propuesta-print" style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden" }}>
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
            <div style={{ background: "#E8F8F2", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: "#0F6E56", marginBottom: "1.25rem" }}>
              ✅ ¡Excelente! El programa cumple con todos los ítems verificados. Asistir IPS y HSE los acompañará en el mantenimiento del ciclo PHVA.
            </div>
          ) : (
            <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: BLUE, marginBottom: "1.25rem", lineHeight: 1.6 }}>
              ⓘ Se identificaron <strong>{nosIdx.length}</strong> oportunidad{nosIdx.length !== 1 ? "es" : ""} de mejora. El cumplimiento global actual es del <strong>{stats.total}%</strong>. Un asesor de Asistir se comunicará para validar los resultados y presentar la propuesta formal.
            </div>
          )}

          {/* Métricas PHVA */}
          <Section title="Cumplimiento por etapa PHVA" icon="📊">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
              {["P","H","V","A"].map(e => <MetricCard key={e} label={ETAPA_NOMBRE[e]} value={stats[e].pct + "%"} color={semaforo(stats[e].pct)} />)}
              <MetricCard label="Total general" value={stats.total + "%"} color={semaforo(stats.total)} />
            </div>
            <Card>
              {["P","H","V","A"].map(e => (
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
              {/* SERVICIOS ASISTIR — sección principal mejorada */}
              <Section title={`Servicios de Asistir recomendados (${nosIdx.length})`} icon="🏥">
                <p style={{ fontSize: 13, color: "#555", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Basado en su diagnóstico, Asistir IPS y HSE puede acompañarle en la implementación de los siguientes servicios. Un asesor validará estos resultados con usted en una reunión de alcance.
                </p>
                {nosIdx.map((i) => {
                  const q = PREGUNTAS[i];
                  const prioBg = q.e === "P" ? "#FCEBEB" : q.e === "H" ? "#FFF8EC" : "#E8F8F2";
                  const prioC  = q.e === "P" ? "#A32D2D" : q.e === "H" ? "#854F0B" : "#0F6E56";
                  const prioL  = q.e === "P" ? "Alta"    : q.e === "H" ? "Media"   : "Baja";
                  return (
                    <div key={i} style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 10, padding: "1rem 1.1rem", marginBottom: ".65rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{q.icono}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>{q.servicio}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: prioBg, color: prioC }}>Prioridad {prioL}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 6 }}>{q.desc_servicio}</div>
                        <div style={{ fontSize: 11, color: "#999", background: "#f5f7fa", borderRadius: 4, padding: "2px 8px", display: "inline-block" }}>📋 {q.n}</div>
                      </div>
                    </div>
                  );
                })}
              </Section>

              {/* Plan de trabajo */}
              <Section title={`Plan de trabajo — ${plazo} meses`} icon="📅">
                <Card>
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid #eee" }}>
                    <div/><div>Actividad</div><div>Fecha</div><div>Prioridad</div>
                  </div>
                  {acts.slice(0, 16).map((a, idx) => {
                    const prioBg = a.prio === "Alta" ? "#FCEBEB" : a.prio === "Media" ? "#FFF8EC" : "#E8F8F2";
                    const prioC  = a.prio === "Alta" ? "#A32D2D" : a.prio === "Media" ? "#854F0B" : "#0F6E56";
                    return (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, padding: ".55rem 0", borderBottom: "1px solid #f5f7fa", fontSize: 13 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: BLUE }}>{idx + 1}</div>
                        <div style={{ lineHeight: 1.5 }}>{a.doc}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{a.mes}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: prioBg, color: prioC, textAlign: "center" }}>{a.prio}</div>
                      </div>
                    );
                  })}
                  {acts.length > 16 && <p style={{ fontSize: 12, color: "#999", paddingTop: 6 }}>+ {acts.length - 16} actividades adicionales.</p>}
                </Card>
              </Section>

              {/* Marco normativo */}
              <Section title="Marco normativo a fortalecer" icon="📜">
                <Card>
                  {Object.entries(normSet).map(([n, c]) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                      <span style={{ color: BLUE }}>📋</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{n}</span>
                      <span style={{ fontSize: 11, background: "#e8f0fb", color: BLUE, borderRadius: 4, padding: "2px 7px" }}>{c} ítem{c > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </Card>
              </Section>

              {/* CTA contacto */}
              <div style={{ background: BLUE, borderRadius: 12, padding: "1.25rem 1.5rem", marginTop: "1.5rem", color: "#fff" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: ".4rem" }}>¿Listo para implementar?</div>
                <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.6, marginBottom: "1rem" }}>
                  Un asesor de Asistir IPS y HSE se reunirá con usted para validar los resultados de este diagnóstico y presentar una cotización formal ajustada a sus necesidades.
                </div>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: 13 }}>
                  <span>📧 gestion.negocios@asistiripsyhse.com.co</span>
                  <span>📞 310 297-3991 · 320 496-6084</span>
                  <span>📍 Calle 17 con Cra. 27, Yopal</span>
                </div>
              </div>
            </>
          )}

          {/* Bot de preguntas */}
          <ChatBot
            empresa={empresa}
            nosIdx={nosIdx}
            stats={stats}
          />

          <div style={{ borderTop: "1px solid #e8ecf2", marginTop: "1.5rem", paddingTop: "1rem", fontSize: 12, color: "#aaa", textAlign: "center" }}>
            Diagnóstico generado por ASISTIR IPS Y HSE · www.asistiripsyhse.com.co · F-MP-002 v2
          </div>
        </div>
      </div>
    </div>
  );
}
