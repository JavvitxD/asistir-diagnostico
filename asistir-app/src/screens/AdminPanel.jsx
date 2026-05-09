import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PREGUNTAS, ETAPA_NOMBRE, BAR_COLOR } from "../data/preguntas";
import { semaforo } from "../utils/stats";

const BLUE = "#1a4480";
const ADMIN_PASSWORD = "asistir2025";

// ─── helpers ───────────────────────────────────────────────────────────────
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

// ─── LOGIN ──────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const check = () => {
    if (pw === ADMIN_PASSWORD) onLogin();
    else setErr("Contraseña incorrecta.");
  };
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
        <input
          type="password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Ingrese la contraseña"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: "border-box" }}
        />
        {err && <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 8 }}>{err}</p>}
        <button onClick={check} style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Ingresar →
        </button>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ───────────────────────────────────────────────────────────
function DetailModal({ d, onClose }) {
  if (!d) return null;
  const resp = d.respuestas || [];
  const stats = d.stats || {};
  const nosIdx = PREGUNTAS.map((q, i) => resp[i]?.val === "NO" ? i : -1).filter(i => i >= 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, boxShadow: "0 8px 40px rgba(0,0,0,.18)" }}>
        {/* Header */}
        <div style={{ background: BLUE, borderRadius: "16px 16px 0 0", padding: "1.25rem 1.5rem", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{d.empresa}</div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>{d.sector} · {d.workers} trabajadores · {d.ciudad}</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>{d.responsable} · {d.correo}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>✕ Cerrar</button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {/* Metrics */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {["P","H","V","A"].map(e => (
              <div key={e} style={{ background: "#f5f7fa", borderRadius: 8, padding: ".75rem 1rem", textAlign: "center", flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{ETAPA_NOMBRE[e]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: semaforo(stats[e]?.pct || 0) }}>{stats[e]?.pct || 0}%</div>
              </div>
            ))}
            <div style={{ background: "#e8f0fb", borderRadius: 8, padding: ".75rem 1rem", textAlign: "center", flex: 1, minWidth: 80 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: semaforo(d.cumplimiento_total || 0) }}>{d.cumplimiento_total || 0}%</div>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
            {["P","H","V","A"].map(e => (
              <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 12, width: 60, color: "#666" }}>{ETAPA_NOMBRE[e]}</div>
                <div style={{ flex: 1, height: 16, background: "#e8ecf2", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: (stats[e]?.pct || 0) + "%", height: "100%", background: BAR_COLOR[e], borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{stats[e]?.pct || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Items faltantes */}
          {nosIdx.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: ".65rem" }}>📁 Ítems sin cumplir ({nosIdx.length})</div>
              <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: 10, padding: ".75rem 1rem", maxHeight: 220, overflowY: "auto" }}>
                {nosIdx.map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f0f2f5", fontSize: 13 }}>
                    <span style={{ color: "#E24B4A" }}>✗</span>
                    <span style={{ flex: 1 }}>{PREGUNTAS[i].d}</span>
                    <span style={{ fontSize: 11, background: "#f0f2f5", borderRadius: 4, padding: "2px 6px", color: "#666", whiteSpace: "nowrap" }}>{PREGUNTAS[i].n}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 12, color: "#aaa", marginTop: "1rem" }}>
            Diagnóstico recibido el {fmt(d.created_at)} · Plazo solicitado: {d.plazo} meses
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PANEL ─────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [auth, setAuth] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from("diagnosticos")
        .select("*")
        .order("created_at", { ascending: false });
      setData(rows || []);
      setLoading(false);
    };
    fetchData();
  }, [auth]);

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  // Stats generales
  const total = data.length;
  const promedio = total > 0 ? Math.round(data.reduce((a, d) => a + (d.cumplimiento_total || 0), 0) / total) : 0;
  const criticos = data.filter(d => (d.cumplimiento_total || 0) < 50).length;
  const sectores = [...new Set(data.map(d => d.sector).filter(Boolean))];

  // Filtros
  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || (d.empresa || "").toLowerCase().includes(q) || (d.ciudad || "").toLowerCase().includes(q) || (d.responsable || "").toLowerCase().includes(q);
    const matchSector = !filtroSector || d.sector === filtroSector;
    return matchSearch && matchSector;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f9" }}>
      {selected && <DetailModal d={selected} onClose={() => setSelected(null)} />}

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

        {/* Stats generales */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Stat label="Total diagnósticos" value={total} sub="recibidos" />
          <Stat label="Cumplimiento promedio" value={promedio + "%"} sub="global" />
          <Stat label="Críticos (< 50%)" value={criticos} sub="requieren atención" />
          <Stat label="Sectores" value={sectores.length} sub="diferentes" />
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por empresa, ciudad o responsable..."
            style={{ flex: 1, minWidth: 200, padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14 }}
          />
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
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 90px 80px", gap: 8, padding: ".75rem 1.25rem", background: "#f5f7fa", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "1px solid #e0e6f0" }}>
              <div>Empresa</div>
              <div>Sector</div>
              <div>Ciudad</div>
              <div>Trabajadores</div>
              <div>Cumplimiento</div>
              <div>Fecha</div>
            </div>

            {filtered.map((d, idx) => (
              <div
                key={d.id}
                onClick={() => setSelected(d)}
                style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 90px 80px", gap: 8, padding: ".85rem 1.25rem", borderBottom: idx < filtered.length - 1 ? "1px solid #f0f2f5" : "none", cursor: "pointer", transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{d.empresa || "—"}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{d.responsable || ""}</div>
                </div>
                <div style={{ fontSize: 13, color: "#555", alignSelf: "center" }}>{d.sector || "—"}</div>
                <div style={{ fontSize: 13, color: "#555", alignSelf: "center" }}>{d.ciudad || "—"}</div>
                <div style={{ fontSize: 13, color: "#555", alignSelf: "center" }}>{d.workers || "—"}</div>
                <div style={{ alignSelf: "center" }}><Badge pct={d.cumplimiento_total || 0} /></div>
                <div style={{ fontSize: 12, color: "#aaa", alignSelf: "center" }}>{fmt(d.created_at)}</div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 12, color: "#aaa", marginTop: "1rem", textAlign: "center" }}>
          Mostrando {filtered.length} de {total} diagnósticos · Haz clic en cualquier fila para ver el detalle completo
        </p>
      </div>
    </div>
  );
}
