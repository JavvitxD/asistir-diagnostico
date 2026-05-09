import { useState } from "react";
import HeaderBar from "../components/HeaderBar";

const BLUE = "#1a4480";

const field = { marginBottom: "1.1rem" };
const label = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 };
const input = { width: "100%", padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };

export default function Screen1Datos({ onNext }) {
  const [form, setForm] = useState({ empresa: "", sector: "", workers: "", responsable: "", correo: "", ciudad: "" });
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleNext = () => {
    if (!form.empresa.trim()) { setErr("Por favor ingrese el nombre de la empresa."); return; }
    if (!form.correo.trim()) { setErr("Por favor ingrese un correo electrónico."); return; }
    setErr("");
    onNext(form);
  };

  return (
    <div style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden" }}>
      <HeaderBar sub="Diagnóstico de Medicina Preventiva" badge="F-MP-002 v2" />
      <div style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: BLUE, marginBottom: ".4rem" }}>Bienvenido al diagnóstico</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: "1.75rem", lineHeight: 1.65 }}>
          Complete este formulario para recibir una <strong>propuesta personalizada</strong> de implementación de su Programa de Medicina Preventiva y del Trabajo. El proceso toma aproximadamente 10 minutos.
        </p>

        <div style={field}>
          <label style={label}>Razón social / Nombre de la empresa *</label>
          <input style={input} placeholder="Ej: Comercializadora XYZ S.A.S." value={form.empresa} onChange={set("empresa")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={field}>
            <label style={label}>Sector económico</label>
            <select style={input} value={form.sector} onChange={set("sector")}>
              <option value="">Seleccione...</option>
              {["Manufactura / Industria","Construcción","Comercio y servicios","Salud","Transporte y logística","Minería / Energía","Tecnología","Agropecuario","Otro"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={field}>
            <label style={label}>Número de trabajadores</label>
            <select style={input} value={form.workers} onChange={set("workers")}>
              <option value="">Seleccione...</option>
              {["1 – 10","11 – 50","51 – 200","201 – 500","Más de 500"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={field}>
            <label style={label}>Nombre del responsable SST</label>
            <input style={input} placeholder="Nombre completo" value={form.responsable} onChange={set("responsable")} />
          </div>
          <div style={field}>
            <label style={label}>Correo electrónico *</label>
            <input style={input} type="email" placeholder="correo@empresa.com" value={form.correo} onChange={set("correo")} />
          </div>
        </div>

        <div style={field}>
          <label style={label}>Ciudad</label>
          <input style={input} placeholder="Ej: Yopal, Casanare" value={form.ciudad} onChange={set("ciudad")} />
        </div>

        {err && <p style={{ fontSize: 13, color: "#c0392b", marginBottom: "1rem" }}>{err}</p>}

        <button onClick={handleNext} style={{
          background: BLUE, color: "#fff", border: "none", borderRadius: 8,
          padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
        }}>
          Iniciar diagnóstico →
        </button>

        <p style={{ fontSize: 12, color: "#999", marginTop: "1rem" }}>
          Sus datos serán utilizados únicamente para generar su propuesta personalizada. Asistir IPS y HSE protege su información.
        </p>
      </div>
    </div>
  );
}
