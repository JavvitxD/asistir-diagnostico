import { useState, useRef, useEffect } from "react";

const BLUE = "#1a4480";

const SYSTEM_PROMPT = `Eres el asistente virtual de ASISTIR IPS Y HSE, empresa colombiana con 30 años de experiencia en Medicina Preventiva y del Trabajo, con sede en Yopal, Casanare.

Tu rol es responder preguntas sobre: el diagnóstico F-MP-002, los servicios de Asistir, la normativa colombiana SST y cómo implementar los programas faltantes.

SERVICIOS DE ASISTIR IPS Y HSE:
- Medicina Ocupacional: Exámenes médicos pre-ingreso, periódico, egreso, post-incapacidad, medicina laboral. Énfasis en osteomuscular, trabajo en alturas, espacios confinados, manipulación de alimentos, dermatológico, seguridad vial, productos químicos, riesgo eléctrico.
- Medicina Preventiva: Perfiles de cargo, diagnóstico de condiciones de salud, SVE Cardiovascular (tamizaje, Test de Ruffier, bioimpedancia), SVE Biomecánico (análisis puesto de trabajo, pausas activas, rumboterapia), SVE Psicosocial (batería de riesgo psicosocial, protocolo, planes de intervención, pruebas psicotécnicas), SVE Visual, SVE Auditivo, programa de alcohol/tabaco/drogas, salud pública, programa integral de rehabilitación y reincorporación (Res. 3050/2022), matriz de inclusión.
- Jornadas de Salud SST: Audiometría, optometría, electrocardiograma, psicología, prueba psicomotriz, pruebas psicotécnicas, radiografías, ecografías, espirometría y exámenes complementarios.
- Óptica: Consulta especializada, optometría, visiometría, monturas y lentes, gafas de seguridad, gafas formuladas, gafas de sol.
- Laboratorio Clínico: Química clínica (perfil lipídico, triglicéridos, colesterol, HDL/LDL, glucosa, transaminasas, creatinina, colinesterasa, fosfatasa alcalina), hematología (cuadro hemático, reticulocitos, plaquetas), microscopía (parasitología, coprológico, uroanálisis, GRAM), inmunología (pruebas de drogas x1/x2/x5/x10, anticuerpos H. pylori, embarazo, paquete sexualidad segura: HIV/Hepatitis B/Sífilis, paquete cáncer: PSA/H. pylori/CEA).
- Vacunación: Triple viral, tétano, influenza, hepatitis A, hepatitis B, hepatitis A+B, varicela, DPT, fiebre amarilla, dengue.
- Talleres psicosociales: Comunicación, resolución de conflictos, trabajo en equipo, liderazgo, relaciones interpersonales, manejo de estrés, manejo del tiempo, salud mental, resiliencia, inteligencia emocional, prevención acoso laboral, mindfulness, primeros auxilios psicológicos.
- Talleres biomecánicos: Manipulación y manejo de cargas, control de trastornos musculoesqueléticos, higiene postural, ergonomía en teletrabajo, fatiga física y recuperación, espalda sana.
- Programas de Medicina Preventiva: Elaboración y actualización de SVE, diseño de protocolos, asesoría en actividades de promoción y prevención, manejo de indicadores, evaluación y planes de mejoramiento, intervención terapéutica, diagnóstico de condiciones de salud.

NORMATIVA CLAVE COLOMBIA:
- Decreto 1072/2015: Marco general del SG-SST, obligaciones del empleador
- Resolución 1843/2025: Exámenes médicos ocupacionales (reemplaza Res. 2346/2007) - nueva norma vigente
- Resolución 312/2019: Estándares mínimos del SG-SST según tamaño empresa
- Resolución 2646/2008: Identificación, evaluación e intervención de factores de riesgo psicosocial
- Resolución 3050/2022: Programa de rehabilitación integral y reincorporación laboral
- Ley 1562/2012: Sistema general de riesgos laborales
- Resolución 0144/2020: Adopción del formulario para afiliación al SGRL

VENTAJAS COMPETITIVAS DE ASISTIR:
- 30 años de trayectoria en el mercado
- Certificación integral ISO 9001 - 14001 - 45001
- Soporte médico legal
- Expertos en medicina preventiva y del trabajo
- Oportunidad y calidad en la prestación de servicios
- Acompañamiento y enfoque en el SG-SST

CONTACTO ASISTIR:
- Centro de Negocios / Medicina Preventiva: (310) 297-3991 / (300) 180-7393 / (320) 496-6084
- Correo negocios: auxiliar.negocios@asistiripsyhse.com.co
- Sede IPS: (313) 816-3434 / (312) 391-8667
- Correo citas: citas@asistiripsyhse.com.co
- Dirección: Calle 17 N° 27-56, B. Juan Pablo II, Yopal, Casanare

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde siempre en español, tono amable y profesional
- Máximo 3 párrafos por respuesta, sé conciso y práctico
- Cuando sea relevante menciona el servicio específico de Asistir que resuelve la necesidad
- Si preguntan por precios o cotizaciones: indica que un asesor los contactará para una propuesta formal personalizada
- Si la pregunta es muy específica o de índole legal: recomienda contactar directamente a Asistir
- Al final de respuestas sobre implementación o servicios, invita a contactar a Asistir
- Nunca inventes información que no esté en este prompt`;

const SUGERENCIAS = [
  "¿Qué es el SVE Biomecánico?",
  "¿Qué exige la Res. 1843/2025?",
  "¿Por dónde empiezo a implementar?",
  "¿Qué incluye el SVE Psicosocial?",
  "¿Cómo contacto a un asesor de Asistir?",
  "¿Qué dice la Res. 312/2019?",
];

export default function ChatBot({ empresa, nosIdx, stats }) {
  const nombre = empresa?.responsable ? empresa.responsable.split(" ")[0] : "";
  const [mensajes, setMensajes] = useState([
    {
      rol: "bot",
      texto: `¡Hola${nombre ? " " + nombre : ""}! 👋 Soy el asistente virtual de Asistir IPS y HSE.\n\nRevisé el diagnóstico de ${empresa?.empresa || "su empresa"} y encontré un cumplimiento del ${stats?.total || 0}% con ${nosIdx?.length || 0} oportunidades de mejora.\n\n¿Tiene alguna pregunta sobre los resultados, los servicios de Asistir o cómo implementar los programas faltantes? Con gusto le ayudo.`
    }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const enviar = async (textoDirecto) => {
    const msg = textoDirecto || input.trim();
    if (!msg || cargando) return;
    setInput("");

    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: msg }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const historial = nuevosMensajes.map(m => ({
        role: m.rol === "usuario" ? "user" : "assistant",
        content: m.texto,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: historial,
        }),
      });

      const data = await response.json();
      const respuesta = data.content?.[0]?.text ||
        "Lo siento, no pude procesar su pregunta en este momento. Por favor contáctenos directamente: (310) 297-3991.";
      setMensajes(prev => [...prev, { rol: "bot", texto: respuesta }]);
    } catch {
      setMensajes(prev => [...prev, {
        rol: "bot",
        texto: "Hubo un error de conexión. Por favor intente de nuevo o comuníquese con nosotros: (310) 297-3991 / gestion.negocios@asistiripsyhse.com.co"
      }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ border: "1px solid #e0e6f0", borderRadius: 12, overflow: "hidden", marginTop: "1.5rem" }}>

      {/* Header */}
      <div style={{ background: BLUE, padding: ".85rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Asistente Asistir IPS y HSE</div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>Resuelva sus dudas sobre el diagnóstico y los servicios</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.8)" }}>En línea</span>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ height: 380, overflowY: "auto", padding: "1rem", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12 }}>
        {mensajes.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 8 }}>
            {m.rol === "bot" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>♥</div>
            )}
            <div style={{
              maxWidth: "78%",
              background: m.rol === "usuario" ? BLUE : "#fff",
              color: m.rol === "usuario" ? "#fff" : "#222",
              border: m.rol === "bot" ? "1px solid #e0e6f0" : "none",
              borderRadius: m.rol === "usuario" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              padding: ".75rem 1rem",
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              boxShadow: "0 1px 3px rgba(0,0,0,.06)"
            }}>
              {m.texto}
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {cargando && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>♥</div>
            <div style={{ background: "#fff", border: "1px solid #e0e6f0", borderRadius: "4px 16px 16px 16px", padding: ".75rem 1rem" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
                    animation: `pulse 1.2s ${j * 0.2}s ease-in-out infinite`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugerencias — solo al inicio */}
      {mensajes.length <= 2 && (
        <div style={{ padding: ".75rem 1rem", background: "#f0f4f9", borderTop: "1px solid #e8ecf2" }}>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>Preguntas frecuentes</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SUGERENCIAS.map((s, i) => (
              <button key={i} onClick={() => enviar(s)} style={{
                fontSize: 12, padding: "5px 12px", border: "1px solid #c8d5e8",
                borderRadius: 20, background: "#fff", color: BLUE, cursor: "pointer", fontWeight: 500
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: ".75rem 1rem", borderTop: "1px solid #e8ecf2", background: "#fff" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="Escriba su pregunta sobre el diagnóstico o los servicios..."
          disabled={cargando}
          style={{ flex: 1, padding: "9px 12px", border: "1px solid #d0d7e3", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
        />
        <button
          onClick={() => enviar()}
          disabled={cargando || !input.trim()}
          style={{
            background: input.trim() && !cargando ? BLUE : "#d0d7e3",
            color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px",
            fontSize: 13, fontWeight: 600, cursor: input.trim() && !cargando ? "pointer" : "default",
            transition: "background .15s", whiteSpace: "nowrap"
          }}>
          Enviar →
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: .4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
