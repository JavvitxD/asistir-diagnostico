import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { semaforo, getPrioridad, mesDesde } from "../utils/stats";

const BLUE = "#1a4480";
const ADMIN_PASSWORD = "asistir2025";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
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
  const resp    = d.respuestas || [];
  const stats   = d.stats || {};
  const nosIdx  = PREGUNTAS.map((q, i) => resp[i]?.val === "NO" ? i : -1).filter(i => i >= 0);
  const plazo   = parseInt(d.plazo) || 6;
  const hoy     = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const costo   = (nosIdx.length * 180000).toLocaleString("es-CO");

  const acts = nosIdx.map((qi, idx) => ({
    doc:  PREGUNTAS[qi].d,
    norma: PREGUNTAS[qi].n,
    prio: getPrioridad(PREGUNTAS[qi].e),
    mes:  mesDesde(d.fecha_inicio, Math.floor(idx / (Math.max(nosIdx.length, 1) / plazo))),
  }));

  const normSet = {};
  nosIdx.forEach(i => { normSet[PREGUNTAS[i].n] = (normSet[PREGUNTAS[i].n] || 0) + 1; });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, overflowY: "auto", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>

        {/* Barra acciones */}
        <div className="no-print" style={{ background: "#f5f7fa", padding: ".75rem 1.5rem", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #e0e6f0" }}>
          <button onClick={() => window.print()} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            ⬇ Imprimir / PDF
          </button>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>
            ✕ Cerrar
          </button>
          <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>Diagnóstico recibido: {fmt(d.created_at)}</span>
        </div>

        {/* Propuesta */}
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
            {/* Banner */}
            {nosIdx.length === 0 ? (
              <div style={{ background: "#E8F8F2", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: "#0F6E56", marginBottom: "1.25rem" }}>
                ✅ El programa cumple con todos los ítems verificados.
              </div>
            ) : (
              <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem 1rem", fontSize: 13, color: BLUE, marginBottom: "1.25rem", lineHeight: 1.6 }}>
                ⓘ Se identificaron <strong>{nosIdx.length}</strong> oportunidad{nosIdx.length !== 1 ? "es" : ""} de mejora. Cumplimiento global: <strong>{stats.total || d.cumplimiento_total}%</strong>. Un asesor de Asistir validará estos resultados con la empresa.
              </div>
            )}

            {/* Métricas */}
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
                {/* Servicios Asistir */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .5rem", display: "flex", alignItems: "center", gap: 7 }}>
                  🏥 Servicios de Asistir recomendados ({nosIdx.length})
                </h3>
                <p style={{ fontSize: 13, color: "#555", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Basado en el diagnóstico, Asistir IPS y HSE puede acompañar a la empresa en la implementación de los siguientes servicios especializados:
                </p>
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
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>📜 Marco normativo a fortalecer</h3>
                <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: ".75rem" }}>
                  {Object.entries(normSet).map(([n, c]) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                      <span style={{ color: BLUE }}>📋</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{n}</span>
                      <span style={{ fontSize: 11, background: "#e8f0fb", color: BLUE, borderRadius: 4, padding: "2px 7px" }}>{c} ítem{c > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>

                {/* Estimado */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "1.5rem 0 .65rem", display: "flex", alignItems: "center", gap: 7 }}>💰 Estimado de inversión</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: ".5rem" }}>
                  <div style={{ background: "#f5f7fa", borderRadius: 8, padding: ".9rem", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Ítems a implementar</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>{nosIdx.length}</div>
                  </div>
                  <div style={{ background: "#f5f7fa", borderRadius: 8, padding: ".9rem", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Estimado referencial</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>${costo}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#999", lineHeight: 1.5, marginBottom: "1rem" }}>
                  * Valor estimado de referencia. Cotización formal tras reunión de alcance con el equipo SST.
                </p>

                {/* CTA */}
                <div style={{ background: BLUE, borderRadius: 12, padding: "1.25rem 1.5rem", color: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: ".4rem" }}>Próximo paso</div>
                  <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.6, marginBottom: ".75rem" }}>
                    Un asesor de Asistir IPS y HSE se reunirá con la empresa para validar los resultados y presentar la cotización formal.
                  </div>
                  <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: 13 }}>
                    <span>📧 gestion.negocios@asistiripsyhse.com.co</span>
                    <span>📞 310 297-3991 · 320 496-6084</span>
                    <span>📍 Calle 17 con Cra. 27, Yopal</span>
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
  const [auth, setAuth]         = useState(false);
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [propuesta, setPropuesta] = useState(null); // diagnóstico seleccionado para ver propuesta

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

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f9" }}>
      {propuesta && <PropuestaCompleta d={propuesta} onClose={() => setPropuesta(null)} />}

      {/* Top bar */}
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
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Stat label="Total diagnósticos" value={total} sub="recibidos" />
          <Stat label="Cumplimiento promedio" value={promedio + "%"} sub="global" />
          <Stat label="Críticos (< 50%)" value={criticos} sub="requieren atención" />
          <Stat label="Sectores" value={sectores.length} sub="diferentes" />
        </div>

        {/* Filtros */}
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

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Cargando diagnósticos...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>No se encontraron diagnósticos.</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e6f0", overflow: "hidden" }}>
            {filtered.map((d, idx) => (
              <div key={d.id} style={{
                padding: "1rem 1.25rem",
                borderBottom: idx < filtered.length-1 ? "1px solid #f0f2f5" : "none",
                display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
              }}>
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
          Mostrando {filtered.length} de {total} diagnósticos · Haz clic en "Ver propuesta" para la propuesta completa con servicios de Asistir
        </p>
      </div>
    </div>
  );
}
