import { useState, useRef, useEffect } from "react";

const BLUE = "#1a4480";

const SYSTEM_PROMPT = `Eres el asistente virtual de ASISTIR IPS Y HSE, empresa colombiana con 30 años de experiencia en Medicina Preventiva y del Trabajo, con sede en Yopal, Casanare.

Tu rol principal en este momento es GUIAR al usuario mientras diligencia el formulario de diagnóstico F-MP-002 (Lista de verificación del Programa de Medicina Preventiva y del Trabajo).

CÓMO RESPONDER PREGUNTAS DEL FORMULARIO:
Cuando el usuario pregunte qué significa una pregunta del formulario, explícasela en lenguaje sencillo. Por ejemplo:
- "¿Qué es el SVE Biomecánico?" → Explica que es el Sistema de Vigilancia Epidemiológica para prevenir lesiones musculares y de columna por posturas o esfuerzos repetitivos en el trabajo.
- "¿Qué es el diagnóstico de condiciones de salud?" → Es un documento que resume el estado de salud de todos los trabajadores basado en los exámenes médicos.
- "¿Qué significa perfil de cargo con médico SST?" → Es el documento que describe las funciones de cada cargo y que un médico especialista en SST revisó y firmó, validando los riesgos del puesto.
- "No sé si cumplimos" → Oriéntalo: si no tienen el documento o programa, responden NO. Si lo tienen pero no está actualizado, también NO. Si la pregunta no aplica a su actividad económica, responden N/A.

CRITERIOS PARA RESPONDER SI/NO/NA:
- SÍ CUMPLE: Tienen el documento, programa o actividad implementada y actualizada
- NO CUMPLE: No lo tienen, o lo tienen desactualizado, o nunca lo han hecho
- NO APLICA: La pregunta no es relevante para su tipo de empresa o actividad económica

SERVICIOS DE ASISTIR IPS Y HSE:
- Medicina Ocupacional: Exámenes médicos (pre-ingreso, periódico, egreso, post-incapacidad, medicina laboral). Énfasis: osteomuscular, alturas, espacios confinados, manipulación alimentos, dermatológico, seguridad vial, químicos, riesgo eléctrico.
- Medicina Preventiva: Perfiles de cargo, diagnóstico condiciones salud, SVE Cardiovascular (tamizaje, Test Ruffier, bioimpedancia), SVE Biomecánico (análisis puesto trabajo, pausas activas, rumboterapia), SVE Psicosocial (batería riesgo, protocolo, intervención), SVE Visual, SVE Auditivo, programa alcohol/drogas, salud pública, rehabilitación Res. 3050/2022.
- Jornadas Salud SST: Audiometría, optometría, electrocardiograma, psicología, pruebas psicotécnicas, radiografías, ecografías, espirometría.
- Óptica: Visiometría, monturas, gafas de seguridad, gafas formuladas.
- Laboratorio Clínico: Química clínica, hematología, microscopía, inmunología, pruebas drogas (x1 a x10), paquete sexualidad segura, paquete cáncer.
- Vacunación: Triple viral, tétano, influenza, hepatitis A/B/A+B, varicela, DPT, fiebre amarilla, dengue.
- Talleres: Psicosociales, biomecánicos, cardiovasculares, salud pública.
- Programas MP: Elaboración SVE, protocolos, indicadores, planes mejoramiento, análisis PHVA.

NORMATIVA CLAVE:
- Dec. 1072/2015: Marco general SG-SST
- Res. 1843/2025: Exámenes médicos ocupacionales
- Res. 312/2019: Estándares mínimos SG-SST
- Res. 2646/2008: Riesgo psicosocial
- Res. 3050/2022: Rehabilitación y reincorporación
- Ley 1562/2012: Riesgos laborales

CONTACTO ASISTIR:
- Centro de Negocios: (310) 297-3991 / (300) 180-7393 / (320) 496-6084
- gestion.negocios@asistiripsyhse.com.co
- Calle 17 N° 27-56, Yopal, Casanare

INSTRUCCIONES:
- Responde en español, amable y MUY conciso (máximo 2 párrafos)
- Si el usuario pregunta por una pregunta específica del formulario, explícala en términos simples
- Siempre termina orientando sobre si deben responder SI, NO o N/A cuando sea relevante
- Nunca inventes información`;

const SUGERENCIAS_FORMULARIO = [
  "¿Qué significa esta pregunta?",
  "¿Cuándo respondo No Aplica?",
  "¿Qué es un SVE?",
  "¿Qué es el perfil de cargo con médico SST?",
  "¿Qué es el diagnóstico de condiciones de salud?",
  "¿Qué dice la Res. 1843/2025?",
];

const SUGERENCIAS_PROPUESTA = [
  "¿Por dónde empiezo a implementar?",
  "¿Qué es el SVE Biomecánico?",
  "¿Qué incluye el SVE Psicosocial?",
  "¿Cuánto tiempo toma implementar?",
  "¿Cómo contacto a un asesor de Asistir?",
];

export default function FloatingBot({ preguntaActual, enFormulario, empresa, nosIdx, stats }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      rol: "bot",
      texto: enFormulario
        ? "¡Hola! 👋 Soy el asistente de Asistir IPS y HSE.\n\nEstoy aquí para ayudarle mientras diligencia el formulario. Si tiene dudas sobre alguna pregunta, qué significa o cómo responderla, ¡pregúnteme!"
        : `¡Hola${empresa?.responsable ? " " + empresa.responsable.split(" ")[0] : ""}! 👋 Soy el asistente de Asistir IPS y HSE.\n\n¿Tiene alguna pregunta sobre los resultados del diagnóstico, los servicios recomendados o cómo implementar los programas?`
    }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [noLeido, setNoLeido] = useState(false);
  const bottomRef = useRef(null);

  // Escucha el evento del botón "¿Qué significa esta pregunta?"
  useEffect(() => {
    const handler = (e) => {
      const { pregunta } = e.detail;
      setAbierto(true);
      setNoLeido(false);
      // Envía automáticamente la pregunta al bot
      setTimeout(() => enviarAuto(`¿Qué significa esta pregunta del formulario?: "${pregunta}"`), 300);
    };
    window.addEventListener("abrirBot", handler);
    return () => window.removeEventListener("abrirBot", handler);
  }, []);

  useEffect(() => {
    if (abierto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNoLeido(false);
    }
  }, [mensajes, abierto]);

  // Cuando cambia la pregunta, sugerir ayuda
  useEffect(() => {
    if (enFormulario && preguntaActual && !abierto) {
      setNoLeido(true);
    }
  }, [preguntaActual]);

  const enviarAuto = async (msg) => {
    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: msg }];
    setMensajes(nuevosMensajes);
    setCargando(true);
    try {
      const historial = nuevosMensajes.map(m => ({ role: m.rol === "usuario" ? "user" : "assistant", content: m.texto }));
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: historial }),
      });
      const data = await response.json();
      const respuesta = data.text || "No pude procesar su pregunta. Contáctenos: (310) 297-3991.";
      setMensajes(prev => [...prev, { rol: "bot", texto: respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { rol: "bot", texto: "Error de conexión. Intente de nuevo o llámenos: (310) 297-3991." }]);
    } finally { setCargando(false); }
  };

  const enviar = async (textoDirecto) => {
    const msg = textoDirecto || input.trim();
    if (!msg || cargando) return;
    setInput("");

    const contexto = enFormulario && preguntaActual
      ? `\n\n[CONTEXTO: El usuario está respondiendo la pregunta del formulario: "${preguntaActual}"]`
      : "";

    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: msg }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const historial = nuevosMensajes.map(m => ({
        role: m.rol === "usuario" ? "user" : "assistant",
        content: m.texto,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT + contexto,
          messages: historial,
        }),
      });

      const data = await response.json();
      const respuesta = data.text || "Lo siento, no pude procesar su pregunta. Contáctenos: (310) 297-3991.";
      setMensajes(prev => [...prev, { rol: "bot", texto: respuesta }]);
      if (!abierto) setNoLeido(true);
    } catch {
      setMensajes(prev => [...prev, {
        rol: "bot",
        texto: "Error de conexión. Intente de nuevo o llámenos: (310) 297-3991."
      }]);
    } finally {
      setCargando(false);
    }
  };

  const sugerencias = enFormulario ? SUGERENCIAS_FORMULARIO : SUGERENCIAS_PROPUESTA;

  return (
    <>
      {/* Chat flotante */}
      {abierto && (
        <div style={{
          position: "fixed", bottom: 90, right: 20, width: 340, maxHeight: "70vh",
          background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,.18)",
          display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden",
          border: "1px solid #e0e6f0"
        }}>
          {/* Header */}
          <div style={{ background: BLUE, padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>♥</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Asistente Asistir IPS y HSE</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 10 }}>
                {enFormulario ? "Ayuda con el formulario" : "Consultas sobre el diagnóstico"}
              </div>
            </div>
            <button onClick={() => setAbierto(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", fontSize: 18, padding: "0 4px", lineHeight: 1 }}>×</button>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: "auto", padding: ".75rem", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10, minHeight: 0, maxHeight: 320 }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 6 }}>
                {m.rol === "bot" && (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginTop: 2 }}>♥</div>
                )}
                <div style={{
                  maxWidth: "82%",
                  background: m.rol === "usuario" ? BLUE : "#fff",
                  color: m.rol === "usuario" ? "#fff" : "#222",
                  border: m.rol === "bot" ? "1px solid #e0e6f0" : "none",
                  borderRadius: m.rol === "usuario" ? "12px 12px 3px 12px" : "3px 12px 12px 12px",
                  padding: ".6rem .85rem",
                  fontSize: 12,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  boxShadow: "0 1px 3px rgba(0,0,0,.05)"
                }}>
                  {m.texto}
                </div>
              </div>
            ))}

            {cargando && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>♥</div>
                <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: "3px 12px 12px 12px", padding: ".6rem .85rem" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: `pulse 1.2s ${j*0.2}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Sugerencias */}
          {mensajes.length <= 2 && (
            <div style={{ padding: ".5rem .75rem", background: "#f0f4f9", borderTop: "1px solid #e8ecf2" }}>
              <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Preguntas frecuentes</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {sugerencias.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => enviar(s)} style={{
                    fontSize: 11, padding: "4px 10px", border: "1px solid #c8d5e8",
                    borderRadius: 20, background: "#fff", color: BLUE, cursor: "pointer", fontWeight: 500
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ display: "flex", gap: 6, padding: ".6rem .75rem", borderTop: "1px solid #e8ecf2", background: "#fff" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              placeholder={enFormulario ? "Pregunte sobre esta pregunta..." : "Escriba su pregunta..."}
              disabled={cargando}
              style={{ flex: 1, padding: "8px 10px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={() => enviar()} disabled={cargando || !input.trim()}
              style={{ background: input.trim() && !cargando ? BLUE : "#d0d7e3", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: input.trim() && !cargando ? "pointer" : "default" }}>
              →
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => { setAbierto(!abierto); setNoLeido(false); }}
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
        {abierto ? <span style={{ color: "#fff", fontSize: 20 }}>×</span> : <span style={{ color: "#fff" }}>💬</span>}
        {noLeido && !abierto && (
          <div style={{
            position: "absolute", top: 2, right: 2, width: 14, height: 14,
            background: "#ef4444", borderRadius: "50%", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center"
          }} />
        )}
      </button>

      {/* Tooltip primera vez */}
      {!abierto && mensajes.length <= 1 && (
        <div style={{
          position: "fixed", bottom: 85, right: 20, background: BLUE, color: "#fff",
          borderRadius: 10, padding: ".6rem .9rem", fontSize: 12, fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,.15)", zIndex: 1001, whiteSpace: "nowrap",
          animation: "fadeIn .3s ease"
        }}>
          ¿Tiene dudas? ¡Pregúnteme! 👋
          <div style={{ position: "absolute", bottom: -6, right: 22, width: 12, height: 12, background: BLUE, transform: "rotate(45deg)" }} />
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.4);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}
