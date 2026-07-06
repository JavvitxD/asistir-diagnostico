import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { calcStats, getNosIdx, getPrioridad, mesDesde, semaforo } from "../utils/stats";
import { calcularCotizacion } from "../data/tarifario";

const BLUE = "#1a4480";
const WA_NUM = "573102793991";

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

function agruparPorCategoria(items) {
  const grupos = {};
  items.forEach((item, idx) => {
    const cat = item.categoria || "Otros";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push({ ...item, idx });
  });
  return grupos;
}

export default function Screen4Propuesta({ empresa, respuestas, fechas, onReiniciar, onRevisar }) {
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
  const cotizacionBase = calcularCotizacion(nosIdx, empresa.workers || "1 – 10");

  const [seleccionados, setSeleccionados] = useState(() =>
    cotizacionBase.items.map((_, i) => true)
  );

  const toggleItem = (idx) => {
    setSeleccionados(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  const toggleTodos = (valor) => {
    setSeleccionados(cotizacionBase.items.map(() => valor));
  };

  const itemsSeleccionados = cotizacionBase.items.filter((_, i) => seleccionados[i]);
  const totalMin = itemsSeleccionados.reduce((s, item) => s + item.min, 0);
  const totalMax = itemsSeleccionados.reduce((s, item) => s + item.max, 0);
  const hayRango = totalMin !== totalMax;

  const pct = Math.round((stats.si / Math.max(stats.total, 1)) * 100);
  const pctColor = pct >= 70 ? "#0F6E56" : pct >= 40 ? "#854F0B" : "#A32D2D";

  const waMsg = encodeURIComponent(
    `Hola Asistir IPS y HSE! Acabo de completar el diagnóstico de Medicina Preventiva para *${empresa.empresa}*.\n\nResultado: ${pct}% de cumplimiento (${stats.si} de ${stats.total} ítems).\n\nEstimado de inversión: entre $${totalMin.toLocaleString("es-CO")} y $${totalMax.toLocaleString("es-CO")} COP.\n\n¿Cuándo podemos hablar?`
  );
  const waURL = `https://wa.me/${WA_NUM}?text=${waMsg}`;

  useEffect(() => {
    const guardar = async () => {
      try {
        await supabase.from("diagnosticos").insert({
          empresa: empresa.empresa, sector: empresa.sector, workers: empresa.workers,
          responsable: empresa.responsable, correo: empresa.correo,
          telefono: empresa.telefono,
          ciudad: empresa.ciudad,
          fecha_inicio: fechas.inicio, fecha_limite: fechas.limite, plazo: fechas.plazo,
          respuestas: JSON.stringify(respuestas),
          items_faltantes: nosIdx.length,
          cumplimiento: pct,
          total_max: cotizacionBase.totalMax,
          total_min: cotizacionBase.totalMin,
        });
      } catch (e) { console.error(e); }
    };
    guardar();
  }, []);

  const grupos = agruparPorCategoria(cotizacionBase.items);
  const etapas = ["P", "H", "V", "A"];

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      <div style={{ background: BLUE, borderRadius: "0 0 16px 16px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, opacity: .7, textTransform: "uppercase", letterSpacing: ".06em" }}>ASISTIR IPS Y HSE · F-MP-002 v2</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>Propuesta de implementación</div>
            <div style={{ fontSize: 13, opacity: .8, marginTop: 2 }}>{empresa.empresa} · {hoy}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={onRevisar} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
              ← Revisar
            </button>
            <button onClick={() => window.print()} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
              ⬇ Descargar PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 .5rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
          <MetricCard label="Cumplimiento" value={`${pct}%`} color={pctColor} />
          <MetricCard label="Ítems OK" value={stats.si} color="#0F6E56" />
          <MetricCard label="Por mejorar" value={nosIdx.length} color="#A32D2D" />
          <MetricCard label="No aplica" value={stats.na} color="#888" />
        </div>

        <Section title="Cumplimiento por etapa PHVA" icon="📊">
          <Card>
            {etapas.map(e => {
              const pregs = PREGUNTAS.filter(p => p.e === e);
              const idxs = pregs.map(p => PREGUNTAS.indexOf(p));
              const total = pregs.length;
              const si = idxs.filter(i => respuestas[i] === "si").length;
              const pctE = total > 0 ? Math.round((si / total) * 100) : 0;
              return (
                <div key={e} style={{ marginBottom: ".85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{ETAPA_NOMBRE[e]}</span>
                    <span style={{ fontWeight: 700, color: BAR_COLOR[e] }}>{pctE}%</span>
                  </div>
                  <div style={{ height: 10, background: "#f0f2f5", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pctE}%`, background: BAR_COLOR[e], borderRadius: 5, transition: "width .6s ease" }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </Section>

        {nosIdx.length > 0 && (
          <>
            <Section title="Servicios recomendados por Asistir IPS y HSE" icon="🏥">
              {nosIdx.map((qi) => {
                const p = PREGUNTAS[qi];
                return (
                  <Card key={qi}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icono}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{p.n}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#222", marginBottom: 4 }}>{p.servicio}</div>
                        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{p.desc_servicio}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </Section>

            <Section title={`Plan de trabajo — ${plazo} meses`} icon="📅">
              <Card>
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid #eee" }}>
                  <div /><div>Actividad</div><div>Fecha</div><div>Prioridad</div>
                </div>
                {acts.slice(0, 16).map((a, idx) => {
                  const prioBg = a.prio === "Alta" ? "#FCEBEB" : a.prio === "Media" ? "#FFF8EC" : "#E8F8F2";
                  const prioC = a.prio === "Alta" ? "#A32D2D" : a.prio === "Media" ? "#854F0B" : "#0F6E56";
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

            <Section title="Cotización estimada — Seleccione los servicios" icon="💰">
              <div style={{
                background: "linear-gradient(135deg, #1a4480 0%, #2563a8 100%)",
                borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: ".75rem", color: "#fff",
                position: "sticky", top: 10, zIndex: 10, boxShadow: "0 4px 20px rgba(26,68,128,.3)"
              }}>
                <div style={{ fontSize: 12, opacity: .8, marginBottom: 4 }}>
                  Estimado con {itemsSeleccionados.length} de {cotizacionBase.items.length} servicios seleccionados
                </div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>
                  {hayRango ? (
                    <>entre ${totalMin.toLocaleString("es-CO")} y ${totalMax.toLocaleString("es-CO")}</>
                  ) : (
                    <>${totalMax.toLocaleString("es-CO")}</>
                  )} <span style={{ fontSize: 13, opacity: .8 }}>COP</span>
                </div>
                <div style={{ fontSize: 11, opacity: .7, marginTop: 4 }}>
                  * Valor de referencia. Marque o desmarque servicios para ajustar según su presupuesto.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: ".75rem" }}>
                <button onClick={() => toggleTodos(true)}
                  style={{ fontSize: 12, padding: "6px 14px", border: "1px solid #d0d7e3", borderRadius: 8, background: "#fff", cursor: "pointer", color: BLUE, fontWeight: 600 }}>
                  ✓ Seleccionar todo
                </button>
                <button onClick={() => toggleTodos(false)}
                  style={{ fontSize: 12, padding: "6px 14px", border: "1px solid #d0d7e3", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#888" }}>
                  ✗ Deseleccionar todo
                </button>
              </div>

              {Object.entries(grupos).map(([categoria, items]) => (
                <div key={categoria} style={{ marginBottom: ".75rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6, paddingLeft: 4 }}>
                    {categoria}
                  </div>
                  <Card>
                    {items.map((item) => {
                      const sel = seleccionados[item.idx];
                      return (
                        <div key={item.idx}
                          onClick={() => toggleItem(item.idx)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12, padding: ".65rem 0",
                            borderBottom: "1px solid #f5f7fa", cursor: "pointer",
                            opacity: sel ? 1 : 0.45, transition: "opacity .2s"
                          }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
                            background: sel ? BLUE : "#fff",
                            border: sel ? `2px solid ${BLUE}` : "2px solid #d0d7e3",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {sel && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, lineHeight: 1.5, fontWeight: sel ? 500 : 400 }}>{item.nombre}</div>
                            {item.nota && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.nota}</div>}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: sel ? BLUE : "#aaa", whiteSpace: "nowrap" }}>
                              ${item.max.toLocaleString("es-CO")}
                            </div>
                            {item.tipo === "examen" && (
                              <div style={{ fontSize: 10, color: "#aaa" }}>por {item.numPersonas} personas</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              ))}

              <div style={{ background: "#f9fafb", border: "1px solid #e8ecf2", borderRadius: 8, padding: ".85rem 1rem", fontSize: 12, color: "#666", lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: "#444", marginBottom: 4 }}>📌 Notas importantes:</div>
                {cotizacionBase.notas.map((nota, i) => (
                  <div key={i} style={{ marginBottom: 3 }}>{nota}</div>
                ))}
              </div>
            </Section>

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
          </>
        )}

        <div style={{ background: BLUE, borderRadius: 12, padding: "1.5rem", marginTop: "1.5rem", color: "#fff" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: ".5rem" }}>¿Listo para implementar?</div>
          <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.7, marginBottom: ".5rem" }}>
            Estimado seleccionado:&nbsp;
            <strong>
              {hayRango
                ? `entre $${totalMin.toLocaleString("es-CO")} y $${totalMax.toLocaleString("es-CO")} COP`
                : `$${totalMax.toLocaleString("es-CO")} COP`}
            </strong>
          </div>
          <div style={{ fontSize: 13, opacity: .75, lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Un asesor de Asistir IPS y HSE se reunirá con usted para validar los resultados y presentar la cotización formal.
          </div>
          <a href={waURL} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar asesor por WhatsApp
          </a>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: 12, opacity: .8 }}>
            <span>📧 gestion.negocios@asistiripsyhse.com.co</span>
            <span>📞 (310) 297-3991 · (320) 496-6084</span>
            <span>📍 Calle 17 con Cra. 27, Yopal, Casanare</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e8ecf2", marginTop: "1.5rem", paddingTop: "1rem", fontSize: 12, color: "#aaa", textAlign: "center", marginBottom: "2rem" }}>
          Diagnóstico generado por ASISTIR IPS Y HSE · www.asistiripsyhse.com.co · F-MP-002 v2
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", paddingBottom: "2rem" }}>
          <button onClick={onReiniciar} style={{ background: "#f0f4f9", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", color: "#555" }}>
            Nuevo diagnóstico
          </button>
        </div>

      </div>
    </div>
  );
}
