import { useState } from "react";
import { PREGUNTAS } from "../data/preguntas";

const BLUE = "#1a4480";

// Preguntas frecuentes generales
const FAQ = [
  {
    p: "¿Qué es el ciclo PHVA?",
    r: "El ciclo PHVA (Planear, Hacer, Verificar, Actuar) es la metodología que organiza el programa de Medicina Preventiva en 4 etapas:\n\n📋 PLANEAR: Diseñar y documentar los programas, protocolos y perfiles.\n⚙️ HACER: Ejecutar e implementar las actividades planeadas.\n🔍 VERIFICAR: Medir, evaluar y analizar los resultados.\n🔄 ACTUAR: Mejorar con base en los hallazgos.\n\nCada pregunta del formulario corresponde a una de estas etapas."
  },
  {
    p: "¿Cuándo respondo 'No Aplica'?",
    r: "Responda 'No Aplica' (N/A) cuando la pregunta NO es relevante para su empresa. Por ejemplo:\n\n• SVE Auditivo: N/A si ningún cargo tiene exposición a ruido.\n• SVE Visual: N/A si no hay trabajos con pantallas o riesgo visual.\n• Enfermedades Laborales: N/A si no tienen casos calificados.\n\nEn caso de duda, consulte con su asesor de SST antes de marcar N/A. Si no está seguro, es mejor responder NO que N/A."
  },
  {
    p: "¿Qué es un SVE?",
    r: "Un SVE (Sistema de Vigilancia Epidemiológica) es un programa documentado para prevenir, detectar y controlar enfermedades relacionadas con el trabajo. Los principales SVE son:\n\n❤️ Cardiovascular: Controla factores de riesgo del corazón.\n🦴 Biomecánico: Previene lesiones musculares y de columna.\n👂 Auditivo: Protege la audición ante exposición a ruido.\n🧠 Psicosocial: Gestiona el estrés y riesgo psicosocial.\n👁️ Visual: Cuida la salud visual de los trabajadores.\n\nAsistir IPS y HSE puede diseñar e implementar todos los SVE que su empresa necesite."
  },
  {
    p: "¿Qué es el Diagnóstico de Condiciones de Salud?",
    r: "Es un documento que resume el estado de salud de todos los trabajadores, elaborado a partir de los resultados de los exámenes médicos ocupacionales. Incluye:\n\n• Perfil de morbilidad (enfermedades más frecuentes)\n• Factores de riesgo identificados\n• Condiciones de salud por cargo o área\n• Recomendaciones de intervención\n\nDebe actualizarse cada vez que se realizan exámenes ocupacionales y socializarse con la alta dirección, COPASST y Talento Humano."
  },
  {
    p: "¿Qué exige la Res. 1843/2025?",
    r: "La Resolución 1843 de 2025 regula las evaluaciones médicas ocupacionales en Colombia. Sus principales exigencias son:\n\n• Perfiles de cargo revisados y firmados por médico SST\n• Exámenes de pre-ingreso, periódicos, egreso y post-incapacidad según el riesgo de cada cargo\n• Procedimiento documentado para la realización de exámenes\n• Entrega formal de cartas de recomendaciones a los trabajadores\n• Seguimiento a las restricciones médicas\n\nAsistir IPS y HSE está certificada para realizar todos los exámenes exigidos por esta resolución."
  },
  {
    p: "¿Cómo contacto a un asesor de Asistir?",
    r: "Puede contactarnos por cualquiera de estos medios:\n\n📞 Centro de Negocios / Medicina Preventiva:\n(310) 297-3991 / (300) 180-7393 / (320) 496-6084\n\n📧 gestion.negocios@asistiripsyhse.com.co\nauxiliar.negocios@asistiripsyhse.com.co\n\n📍 Calle 17 con Cra. 27 esquina, Yopal, Casanare\n\nUn asesor se reunirá con usted para validar los resultados de este diagnóstico y presentar una propuesta formal."
  },
];

export default function FloatingBot({ preguntaActual, enFormulario }) {
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState("menu"); // "menu" | "faq" | "pregunta" | "detalle"
  const [respuestaActual, setRespuestaActual] = useState(null);

  // Encuentra la explicación de la pregunta actual del formulario
  const preguntaInfo = preguntaActual
    ? PREGUNTAS.find(p => p.t === preguntaActual)
    : null;

  const verDetalle = (item) => {
    setRespuestaActual(item);
    setVista("detalle");
  };

  const volver = () => {
    setRespuestaActual(null);
    setVista("menu");
  };

  return (
    <>
      {/* Chat flotante */}
      {abierto && (
        <div style={{
          position: "fixed", bottom: 90, right: 20, width: 340, maxHeight: "75vh",
          background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,.18)",
          display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden",
          border: "1px solid #e0e6f0"
        }}>
          {/* Header */}
          <div style={{ background: BLUE, padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {vista === "detalle" && (
              <button onClick={volver} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, padding: "0 4px", marginRight: 4 }}>←</button>
            )}
            <div style={{ width: 28, height: 28, background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>♥</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Asistente Asistir IPS y HSE</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 10 }}>
                {enFormulario ? "Ayuda con el formulario" : "Consultas sobre el diagnóstico"}
              </div>
            </div>
            <button onClick={() => { setAbierto(false); setVista("menu"); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", fontSize: 18, padding: "0 4px", lineHeight: 1 }}>×</button>
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, overflowY: "auto", padding: ".75rem" }}>

            {/* Vista: menú principal */}
            {vista === "menu" && (
              <>
                <p style={{ fontSize: 13, color: "#555", marginBottom: ".75rem", lineHeight: 1.6 }}>
                  👋 Hola, soy el asistente de <strong>Asistir IPS y HSE</strong>. ¿En qué puedo ayudarle?
                </p>

                {/* Si hay pregunta activa en el formulario */}
                {enFormulario && preguntaInfo && (
                  <div style={{ marginBottom: ".75rem" }}>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Pregunta actual</div>
                    <button
                      onClick={() => verDetalle({ p: "Explicación de esta pregunta", r: preguntaInfo.explicacion })}
                      style={{ width: "100%", textAlign: "left", background: "#e8f0fb", border: "1px solid #b8cfe8", borderRadius: 10, padding: ".65rem .85rem", cursor: "pointer", fontSize: 12, color: BLUE, fontWeight: 600, lineHeight: 1.4 }}>
                      💬 ¿Qué significa esta pregunta?<br />
                      <span style={{ fontWeight: 400, color: "#555", fontSize: 11 }}>{preguntaInfo.t.substring(0, 60)}...</span>
                    </button>
                  </div>
                )}

                {/* Preguntas frecuentes */}
                <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Preguntas frecuentes</div>
                {FAQ.map((item, i) => (
                  <button key={i} onClick={() => verDetalle(item)}
                    style={{ width: "100%", textAlign: "left", background: "#f8fafc", border: "1px solid #e0e6f0", borderRadius: 8, padding: ".6rem .85rem", cursor: "pointer", fontSize: 12, color: "#333", marginBottom: 5, lineHeight: 1.4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span>{item.p}</span>
                    <span style={{ color: "#aaa", flexShrink: 0 }}>→</span>
                  </button>
                ))}

                {/* Todas las preguntas del formulario */}
                {enFormulario && (
                  <>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", margin: ".75rem 0 5px" }}>Explicación de preguntas del formulario</div>
                    {PREGUNTAS.map((q, i) => (
                      <button key={i} onClick={() => verDetalle({ p: q.t, r: q.explicacion })}
                        style={{ width: "100%", textAlign: "left", background: "#f8fafc", border: "1px solid #e0e6f0", borderRadius: 8, padding: ".55rem .85rem", cursor: "pointer", fontSize: 11, color: "#444", marginBottom: 4, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{q.icono}</span>
                        <span style={{ flex: 1 }}>{q.t.substring(0, 55)}...</span>
                        <span style={{ color: "#aaa", flexShrink: 0 }}>→</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Vista: detalle de respuesta */}
            {vista === "detalle" && respuestaActual && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: ".75rem", lineHeight: 1.4 }}>
                  {respuestaActual.p}
                </div>
                <div style={{ fontSize: 13, color: "#333", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {respuestaActual.r}
                </div>
                <div style={{ marginTop: "1rem", padding: ".75rem", background: "#e8f0fb", borderRadius: 8, fontSize: 12, color: BLUE }}>
                  ¿Necesita más ayuda? Contáctenos:<br />
                  📞 (310) 297-3991<br />
                  📧 gestion.negocios@asistiripsyhse.com.co
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          position: "fixed", bottom: 20, right: 20, width: 56, height: 56,
          borderRadius: "50%", background: BLUE, border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(26,68,128,.4)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24, zIndex: 1001, transition: "transform .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="Asistente de Asistir IPS y HSE"
      >
        {abierto ? <span style={{ color: "#fff", fontSize: 20 }}>×</span> : <img src="/logo.png" alt="Asistir" style={{ width: 38, height: 38, objectFit: "contain", borderRadius: "50%" }} />}
      </button>

      {/* Tooltip */}
      {!abierto && (
        <div style={{
          position: "fixed", bottom: 85, right: 20, background: BLUE, color: "#fff",
          borderRadius: 10, padding: ".6rem .9rem", fontSize: 12, fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,.15)", zIndex: 1001, whiteSpace: "nowrap",
          pointerEvents: "none"
        }}>
          ¿Tiene dudas? ¡Pregúnteme! 👋
          <div style={{ position: "absolute", bottom: -6, right: 22, width: 12, height: 12, background: BLUE, transform: "rotate(45deg)" }} />
        </div>
      )}
    </>
  );
}
