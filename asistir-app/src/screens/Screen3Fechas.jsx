import { useState } from "react";
import HeaderBar from "../components/HeaderBar";

const BLUE = "#1a4480";
const field = { marginBottom: "1.1rem" };
const label = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 };
const input = { width: "100%", padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };

export default function Screen3Fechas({ onNext, onBack }) {
  const [form, setForm] = useState({ auditoria: "", inicio: "", limite: "", plazo: "6" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden" }}>
      <HeaderBar sub="Cronograma de implementación" />
      <div style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: BLUE, marginBottom: ".4rem" }}>Fechas del plan de trabajo</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: "1.75rem", lineHeight: 1.65 }}>
          Esta información permite a Asistir generar un cronograma ajustado a sus necesidades y tiempos reales.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={field}>
            <label style={label}>Última auditoría SST</label>
            <input style={input} type="month" value={form.auditoria} onChange={set("auditoria")} />
          </div>
          <div style={field}>
            <label style={label}>Fecha de inicio deseada</label>
            <input style={input} type="month" value={form.inicio} onChange={set("inicio")} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={field}>
            <label style={label}>Fecha límite / auditoría programada</label>
            <input style={input} type="month" value={form.limite} onChange={set("limite")} />
          </div>
          <div style={field}>
            <label style={label}>Plazo total de implementación</label>
            <select style={input} value={form.plazo} onChange={set("plazo")}>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="9">9 meses</option>
              <option value="12">12 meses</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: ".5rem" }}>
          <button onClick={onBack} style={{ background: "none", border: "1px solid #d0d7e3", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
            ← Volver
          </button>
          <button onClick={() => onNext(form)} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            ✦ Generar propuesta
          </button>
        </div>
      </div>
    </div>
  );
}
