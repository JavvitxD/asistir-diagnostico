
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { semaforo, getPrioridad, mesDesde } from "../utils/stats";
import { calcularCotizacion } from "../data/tarifario";

const BLUE = "#1a4480";
const ADMIN_PASSWORD = "asistir2025";
const WA_NUM = "573102793991";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtFechaCSV(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Escapa valores para que el CSV no se rompa con comas, comillas o saltos de línea
function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Construye y descarga el archivo CSV a partir de un arreglo de diagnósticos
function exportarCSV(diagnosticos) {
  if (!diagnosticos || diagnosticos.length === 0) return;

  const headers = [
    "Empresa", "Responsable", "Correo", "Sector", "Ciudad",
    "Numero_Trabajadores", "Porcentaje_Cumplimiento",
    "Cotizacion_Minima", "Cotizacion_Referencia", "Fecha_Diagnostico"
  ];

  const filas = diagnosticos.map(d => {
    const resp   = d.respuestas || [];
    const nosIdx = PREGUNTAS.map((q, i) => resp[i]?.val === "NO" ? i : -1).filter(i => i >= 0);
    const cotizacion = calcularCotizacion(nosIdx, d.workers || "1 – 10");

    return [
      csvEscape(d.empresa),
      csvEscape(d.responsable),
      csvEscape(d.correo),
      csvEscape(d.sector),
      csvEscape(d.ciudad),
      csvEscape(d.workers),
      csvEscape(d.cumplimiento_total || 0),
      csvEscape(cotizacion.totalMin),
      csvEscape(cotizacion.totalMax),
      csvEscape(fmtFechaCSV(d.created_at)),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...filas].join("\n");

  // BOM para que Excel reconozca tildes y caracteres especiales correctamente
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const nombreArchivo = diagnosticos.length === 1
    ? `diagnostico_${(diagnosticos[0].empresa || "cliente").replace(/[^a-zA-Z0-9]/g, "_")}_${fechaArchivo}.csv`
    : `diagnosticos_asistir_${fechaArchivo}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Badge({ pct }) {
  const bg = pct >= 80 ? "#E8F8F2" : pct >= 50 ? "#FFF8EC" : "#FCEBEB";
  const c  = pct >= 80 ? "#0F6E56" : pct >= 50 ? "#854F0B" : "#A32D2D";
  return <span style={{ background: bg, color: c, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{pct}%</span>;
}

function Stat({ label, value, sub }) {
  return (
    <div style={{ background: "#f5f7fa", borderRadius: 10, padding: "1rem 1.25rem", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: BLUE }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── PROPUESTA COMPLETA ──────────────────────────────────────────────────────
function PropuestaCompleta({ d, onClose }) {
  if (!d) return null;
  const resp   = d.respuestas || [];
  const stats  = d.stats || {};
  const nosIdx = PREGUNTAS.map((q, i) => resp[i]?.val === "NO" ? i : -1).filter(i => i >= 0);
  const plazo  = parseInt(d.plazo) || 6;
  const hoy    = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const cotizacion = calcularCotizacion(nosIdx, d.workers || "1 – 10");

  const acts = nosIdx.map((qi, idx) => ({
    doc:   PREGUNTAS[qi].d,
    norma: PREGUNTAS[qi].n,
    prio:  getPrioridad(PREGUNTAS[qi].e),
    mes:   mesDesde(d.fecha_inicio, Math.floor(idx / (Math.max(nosIdx.length, 1) / plazo))),
  }));

  const normSet = {};
  nosIdx.forEach(i => { normSet[PREGUNTAS[i].n] = (normSet[PREGUNTAS[i].n] || 0) + 1; });

  const waMsg = encodeURIComponent(
    `Hola! Soy asesor de Asistir IPS y HSE. Le contacto en relación al diagnóstico de Medicina Preventiva de *${d.empresa}*.\n\nResultado: ${d.cumplimiento_total || 0}% de cumplimiento.\n\nEstimado de inversión: $${cotizacion.totalMax.toLocaleString("es-CO")} COP\n\n¿Cuándo podemos agendar una reunión de alcance?`
  );
  const waURL = `https://wa.me/${WA_NUM}?text=${waMsg}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, overflowY: "auto", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>

        {/* Barra acciones */}
        <div className="no-print" style={{ background: "#f5f7fa", padding: ".75rem 1.5rem", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #e0e6f0", flexWrap: "wrap" }}>
          <button onClick={() => window.print()} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            ⬇ Imprimir / PDF
          </button>
          <button onClick={() => exportarCSV([d])} style={{ background: "#0F6E56", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            📊 Exportar CSV
          </button>
          <a href={waURL} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>
            ✕ Cerrar
          </button>
          <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>Diagnóstico recibido: {fmt(d.created_at)}</span>
        </div>

        <div id="propuesta-print">
          <style>{`@media print { .no-print { display:none!important; } body * { visibility:hidden; } #propuesta-print, #propuesta-print * { visibility:visible; } #propuesta-print { position:absolute;left:0;top:0;width:100%; } }`}</style>

          {/* Header azul */}
          <div style={{ background: BLUE, padding: "1.25rem 1.5rem", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".5rem" }}>
              <div style={{ width: 32, height: 32, background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>♥</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Propuesta de implementación</div>
                <div style={{ fontSize: 12, opacity: .75 }}>ASISTIR IPS Y HSE · F-MP-002 v2 · {hoy}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, opacity: .85 }}>
              🏢 {d.empresa}{d.sector ? " · " + d.sector : ""}{d.workers ? " · " + d.workers + " trabajadores" : ""}{d.ciudad ? " · " + d.ciudad : ""}
            </div>
            {d.responsable && <div style={{ fontSize: 12, opacity: .7, marginTop: 3 }}>Responsable SST: {d.responsable} · {d.correo}</div>}
          </div>

          <div style={{ padding: "1.5rem" }}>

            {nosIdx.length === 0 ? (
              <div style={{ background: "#E8F8F2", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: "#0F6E56", marginBottom: "1.25rem" }}>
                ✅ El programa cumple con todos los ítems verificados.
              </div>
            ) : (
              <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: BLUE, marginBottom: "1.25rem", lineHeight: 1.6 }}>
                ⓘ Se identificaron <strong>{nosIdx.length}</strong> oportunidad{nosIdx.length !== 1 ? "es" : ""} de mejora. Cumplimiento global: <strong>{d.cumplimiento_total || 0}%</strong>.
              </div>
            )}

            {/* Métricas PHVA */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "0 0 .75rem", display: "flex", alignItems: "center", gap: 7 }}>📊 Cumplimiento por etapa PHVA</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px,1fr))", gap: 10, marginBottom: "1rem" }}>
              {["P","H","V","A"].map(e => (
                <div key={e} style={{ background: "#f5f7fa", borderRadius: 8, padding: ".75rem", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{ETAPA_NOMBRE[e]}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: semaforo(stats[e]?.pct || 0) }}>{stats[e]?.pct || 0}%</div>
                </div>
              ))}
              <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Total</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: semaforo(d.cumplimiento_total || 0) }}>{d.cumplimiento_total || 0}%</div>
              </div>
            </div>

            {/* Barras */}
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
              {["P","H","V","A"].map(e => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, width: 64, color: "#666", flexShrink: 0 }}>{ETAPA_NOMBRE[e]}</div>
                  <div style={{ flex: 1, height: 16, background: "#e0e6f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: (stats[e]?.pct || 0) + "%", height: "100%", background: BAR_COLOR[e], borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{stats[e]?.pct || 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {nosIdx.length > 0 && (
              <>
                {/* Servicios */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .5rem", display: "flex", alignItems: "center", gap: 7 }}>
                  🏥 Servicios recomendados ({nosIdx.length})
                </h3>
                {nosIdx.map(i => {
                  const q = PREGUNTAS[i];
                  const prioBg = q.e==="P" ? "#FCEBEB" : q.e==="H" ? "#FFF8EC" : "#E8F8F2";
                  const prioC  = q.e==="P" ? "#A32D2D" : q.e==="H" ? "#854F0B" : "#0F6E56";
                  const prioL  = q.e==="P" ? "Alta"    : q.e==="H" ? "Media"   : "Baja";
                  return (
                    <div key={i} style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 10, padding: "1rem 1.1rem", marginBottom: ".6rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{q.icono}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>{q.servicio}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: prioBg, color: prioC }}>Prioridad {prioL}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 5 }}>{q.desc_servicio}</div>
                        <span style={{ fontSize: 11, color: "#999", background: "#f5f7fa", borderRadius: 4, padding: "2px 8px" }}>📋 {q.n}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Plan de trabajo */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>
                  📅 Plan de trabajo — {plazo} meses
                </h3>
                <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: ".75rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid #eee" }}>
                    <div/><div>Actividad</div><div>Fecha</div><div>Prioridad</div>
                  </div>
                  {acts.slice(0, 16).map((a, idx) => {
                    const prioBg = a.prio==="Alta" ? "#FCEBEB" : a.prio==="Media" ? "#FFF8EC" : "#E8F8F2";
                    const prioC  = a.prio==="Alta" ? "#A32D2D" : a.prio==="Media" ? "#854F0B" : "#0F6E56";
                    return (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 72px", gap: 8, padding: ".5rem 0", borderBottom: "1px solid #f5f7fa", fontSize: 13 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: BLUE }}>{idx+1}</div>
                        <div style={{ lineHeight: 1.5 }}>{a.doc}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{a.mes}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: prioBg, color: prioC, textAlign: "center" }}>{a.prio}</div>
                      </div>
                    );
                  })}
                  {acts.length > 16 && <p style={{ fontSize: 12, color: "#999", paddingTop: 6 }}>+ {acts.length - 16} actividades adicionales.</p>}
                </div>

                {/* Marco normativo */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>📜 Marco normativo</h3>
                <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: ".75rem" }}>
                  {Object.entries(normSet).map(([n, c]) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                      <span style={{ color: BLUE }}>📋</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{n}</span>
                      <span style={{ fontSize: 11, background: "#e8f0fb", color: BLUE, borderRadius: 4, padding: "2px 7px" }}>{c} ítem{c > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>

                {/* ── COTIZACIÓN ADMIN (con valor mínimo y máximo) ── */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>
                  💰 Cotización — Herramienta de negociación
                </h3>

                {/* Tarjetas resumen */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: ".75rem" }}>
                  <div style={{ background: "#FFF8EC", border: "1px solid #F5C842", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#854F0B", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>🔒 Valor mínimo (negociación)</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#854F0B" }}>${cotizacion.totalMin.toLocaleString("es-CO")}</div>
                    <div style={{ fontSize: 11, color: "#854F0B", marginTop: 4 }}>Solo visible para el asesor</div>
                  </div>
                  <div style={{ background: "#e8f0fb", border: "1px solid #b8cfe8", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: BLUE, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>💼 Valor de referencia (cliente)</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: BLUE }}>${cotizacion.totalMax.toLocaleString("es-CO")}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Visible en la propuesta del cliente</div>
                  </div>
                </div>

                {/* Detalle por ítem */}
                <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: ".75rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 8, fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid #eee" }}>
                    <div>Servicio</div>
                    <div style={{ textAlign: "right" }}>Mín. negoc.</div>
                    <div style={{ textAlign: "right" }}>Ref. cliente</div>
                  </div>
                  {cotizacion.items.length > 0 ? cotizacion.items.map((item, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 8, padding: ".55rem 0", borderBottom: "1px solid #f5f7fa", fontSize: 13, alignItems: "start" }}>
                      <div>
                        <div style={{ lineHeight: 1.5 }}>{item.nombre}</div>
                        {item.nota && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.nota}</div>}
                      </div>
                      <div style={{ textAlign: "right", fontWeight: 600, color: "#854F0B", whiteSpace: "nowrap" }}>
                        ${item.min.toLocaleString("es-CO")}
                      </div>
                      <div style={{ textAlign: "right", fontWeight: 600, color: BLUE, whiteSpace: "nowrap" }}>
                        ${item.max.toLocaleString("es-CO")}
                      </div>
                    </div>
                  )) : (
                    <p style={{ fontSize: 13, color: "#999", padding: ".5rem 0" }}>Sin servicios cotizados en el tarifario.</p>
                  )}
                </div>

                {/* Notas */}
                <div style={{ background: "#f9fafb", border: "1px solid #e8ecf2", borderRadius: 8, padding: ".85rem 1rem", fontSize: 12, color: "#666", lineHeight: 1.8, marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, color: "#444", marginBottom: 4 }}>📌 Notas para el asesor:</div>
                  {cotizacion.notas.map((nota, i) => (
                    <div key={i} style={{ marginBottom: 3 }}>{nota}</div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ background: BLUE, borderRadius: 12, padding: "1.25rem 1.5rem", color: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: ".4rem" }}>Próximo paso</div>
                  <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.6, marginBottom: ".75rem" }}>
                    Contacte al cliente para agendar la reunión de alcance y presentar la cotización formal.
                  </div>
                  <a href={waURL} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: ".75rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactar a {d.responsable || "el cliente"} por WhatsApp
                  </a>
                  <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: 12 }}>
                    <span>📧 gestion.negocios@asistiripsyhse.com.co</span>
                    <span>📞 (310) 297-3991 · (320) 496-6084</span>
                  </div>
                </div>
              </>
            )}

            <div style={{ borderTop: "1px solid #e8ecf2", marginTop: "1.5rem", paddingTop: "1rem", fontSize: 12, color: "#aaa", textAlign: "center" }}>
              Diagnóstico generado por ASISTIR IPS Y HSE · www.asistiripsyhse.com.co · F-MP-002 v2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const check = () => { if (pw === ADMIN_PASSWORD) onLogin(); else setErr("Contraseña incorrecta."); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f9" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2.5rem 2rem", width: 340, boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
          <div style={{ width: 38, height: 38, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>♥</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: BLUE }}>ASISTIR IPS Y HSE</div>
            <div style={{ fontSize: 11, color: "#999" }}>Panel de administrador</div>
          </div>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6 }}>Contraseña</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==="Enter" && check()}
          placeholder="Ingrese la contraseña"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: "border-box" }} />
        {err && <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 8 }}>{err}</p>}
        <button onClick={check} style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Ingresar →
        </button>
      </div>
    </div>
  );
}

// ─── PANEL PRINCIPAL ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [auth, setAuth]       = useState(false);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [propuesta, setPropuesta] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());

  useEffect(() => {
    if (!auth) return;
    const fetch = async () => {
      setLoading(true);
      const { data: rows } = await supabase.from("diagnosticos").select("*").order("created_at", { ascending: false });
      setData(rows || []);
      setLoading(false);
    };
    fetch();
  }, [auth]);

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  const total    = data.length;
  const promedio = total > 0 ? Math.round(data.reduce((a, d) => a + (d.cumplimiento_total || 0), 0) / total) : 0;
  const criticos = data.filter(d => (d.cumplimiento_total || 0) < 50).length;
  const sectores = [...new Set(data.map(d => d.sector).filter(Boolean))];

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || (d.empresa||"").toLowerCase().includes(q) || (d.ciudad||"").toLowerCase().includes(q) || (d.responsable||"").toLowerCase().includes(q);
    const mf = !filtroSector || d.sector === filtroSector;
    return ms && mf;
  });

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeleccionarTodos = () => {
    const idsFiltrados = filtered.map(d => d.id);
    const todosSeleccionados = idsFiltrados.every(id => seleccionados.has(id)) && idsFiltrados.length > 0;
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (todosSeleccionados) {
        idsFiltrados.forEach(id => next.delete(id));
      } else {
        idsFiltrados.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleExportarSeleccionados = () => {
    const diagnosticosSeleccionados = data.filter(d => seleccionados.has(d.id));
    exportarCSV(diagnosticosSeleccionados);
  };

  const idsFiltrados = filtered.map(d => d.id);
  const todosFiltradosSeleccionados = idsFiltrados.length > 0 && idsFiltrados.every(id => seleccionados.has(id));

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f9" }}>
      {propuesta && <PropuestaCompleta d={propuesta} onClose={() => setPropuesta(null)} />}

      <div style={{ background: BLUE, padding: ".85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "rgba(255,255,255,.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>♥</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>ASISTIR IPS Y HSE</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>Panel de administrador · Diagnósticos F-MP-002</div>
          </div>
        </div>
        <button onClick={() => setAuth(false)} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Stat label="Total diagnósticos" value={total} sub="recibidos" />
          <Stat label="Cumplimiento promedio" value={promedio + "%"} sub="global" />
          <Stat label="Críticos (< 50%)" value={criticos} sub="requieren atención" />
          <Stat label="Sectores" value={sectores.length} sub="diferentes" />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por empresa, ciudad o responsable..."
            style={{ flex: 1, minWidth: 200, padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14 }} />
          <select value={filtroSector} onChange={e => setFiltroSector(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14, background: "#fff" }}>
            <option value="">Todos los sectores</option>
            {sectores.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Barra de exportación — aparece cuando hay algo seleccionado */}
        {seleccionados.size > 0 && (
          <div style={{ background: "#0F6E56", borderRadius: 10, padding: ".75rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              ✓ {seleccionados.size} diagnóstico{seleccionados.size !== 1 ? "s" : ""} seleccionado{seleccionados.size !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSeleccionados(new Set())}
                style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleExportarSeleccionados}
                style={{ background: "#fff", color: "#0F6E56", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                📊 Exportar CSV ({seleccionados.size})
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Cargando diagnósticos...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>No se encontraron diagnósticos.</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e6f0", overflow: "hidden" }}>
            {/* Fila de "seleccionar todos" */}
            <div style={{ padding: ".65rem 1.25rem", borderBottom: "1px solid #f0f2f5", background: "#f9fafb", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={todosFiltradosSeleccionados}
                onChange={toggleSeleccionarTodos}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>Seleccionar todos los visibles ({filtered.length})</span>
            </div>

            {filtered.map((d, idx) => (
              <div key={d.id} style={{ padding: "1rem 1.25rem", borderBottom: idx < filtered.length-1 ? "1px solid #f0f2f5" : "none", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: seleccionados.has(d.id) ? "#f0f9f6" : "transparent" }}>
                <input
                  type="checkbox"
                  checked={seleccionados.has(d.id)}
                  onChange={() => toggleSeleccion(d.id)}
                  style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
                />
                <div style={{ flex: "2 1 200px" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{d.empresa || "—"}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{d.responsable || ""} {d.correo ? "· " + d.correo : ""}</div>
                </div>
                <div style={{ flex: "1 1 100px", fontSize: 13, color: "#555" }}>
                  <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", marginBottom: 2 }}>Sector</div>
                  {d.sector || "—"}
                </div>
                <div style={{ flex: "1 1 80px", fontSize: 13, color: "#555" }}>
                  <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", marginBottom: 2 }}>Ciudad</div>
                  {d.ciudad || "—"}
                </div>
                <div style={{ flex: "0 0 90px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", marginBottom: 4 }}>Cumplimiento</div>
                  <Badge pct={d.cumplimiento_total || 0} />
                </div>
                <div style={{ flex: "0 0 80px", fontSize: 12, color: "#aaa", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", marginBottom: 2 }}>Fecha</div>
                  {fmt(d.created_at)}
                </div>
                <div style={{ flex: "0 0 auto", marginLeft: "auto" }}>
                  <button onClick={() => setPropuesta(d)}
                    style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                    📄 Ver propuesta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 12, color: "#aaa", marginTop: "1rem", textAlign: "center" }}>
          Mostrando {filtered.length} de {total} diagnósticos · Marca las casillas para seleccionar y exportar a CSV
        </p>
      </div>
    </div>
  );
}
