bash

cat /home/claude/tarifario.js
Salida

// TARIFARIO MEDICINA PREVENTIVA - ASISTIR IPS Y HSE
// min = valor mínimo de negociación (solo visible para el asesor/admin)
// max = valor de referencia visible al cliente

const TARIFARIO = {

  rangoTrabajadores: (workers) => {
    if (!workers) return "1-10";
    if (workers === "1 – 10")   return "1-10";
    if (workers === "11 – 50")  return "11-25";
    if (workers === "51 – 200") return "26-50";
    if (workers === "201 – 500")return "51-99";
    return "100+";
  },

  paquetes: {

    perfil_cargo: {
      nombre: "Elaboración y diseño de Perfil del Cargo",
      precios: {
        "1-10":  { min: 124000,  max: 159000 },
        "11-25": { min: 147400,  max: 181500 },
        "26-50": { min: 357000,  max: 391000 },
        "51-99": { min: 426800,  max: 461000 },
        "100+":  { min: 520000,  max: 555000 },
      }
    },

    procedimiento_examenes: {
      nombre: "Actualización procedimiento exámenes médicos",
      precios: { "todos": { min: 380000, max: 450000 } }
    },

    sve_elaboracion: {
      nombre: "SVE — Elaboración desde cero",
      precios: { "todos": { min: 328000, max: 362100 } }
    },

    sve_asesoria: {
      nombre: "SVE — Asesoría y actualización",
      precios: { "todos": { min: 126800, max: 157500 } }
    },

    bateria_psicosocial: {
      nombre: "Aplicación batería de riesgo psicosocial",
      precios: {
        "1-10":  { min: 123700, max: 158000 },
        "11-25": { min: 55000,  max: 55000 },
        "26-50": { min: 52000,  max: 52000 },
        "51-99": { min: 48000,  max: 48000 },
        "100+":  { min: 48000,  max: 48000 },
      },
      porPersona: ["11-25", "26-50", "51-99", "100+"]
    },

    intervencion_psicosocial: {
      nombre: "Asesoría y plan de intervención riesgo psicosocial",
      precios: { "todos": { min: 191700, max: 203000 } }
    },

    tamizaje_cardiovascular: {
      nombre: "Tamizaje cardiovascular",
      precios: { "todos": { min: 23000, max: 23000 } }
    },

    rumboterapia: {
      nombre: "Rumboterapia",
      precios: { "todos": { min: 265000, max: 299000 } }
    },

    pausas_activas: {
      nombre: "Programa de pausas activas",
      precios: { "todos": { min: 147400, max: 181500 } }
    },

    programa_3050: {
      nombre: "Asesoría Programa de Rehabilitación (Res. 3050/2022)",
      precios: { "todos": { min: 191700, max: 225800 } }
    },

    apt_reubicacion: {
      nombre: "Análisis de puesto de trabajo — Reubicación",
      precios: { "todos": { min: 785000, max: 819200 } }
    },

    apt_el: {
      nombre: "Análisis de puesto de trabajo — Determinación Enfermedad Laboral",
      precios: { "todos": { min: 922000, max: 956000 } }
    },

    matriz_inclusion: {
      nombre: "Asesoría y elaboración Matriz de Inclusión",
      precios: {
        "1-10":  { min: 123800, max: 157800 },
        "11-25": { min: 146800, max: 180900 },
        "26-50": { min: 238700, max: 272800 },
        "51-99": { min: 284700, max: 318800 },
        "100+":  { min: 560400, max: 696400 },
      }
    },

    encuesta_morbilidad: {
      nombre: "Encuesta de morbilidad sentida",
      precios: { "todos": { min: 4700, max: 5500 } }
    },

    inspeccion_puesto: {
      nombre: "Inspección de puesto de trabajo — Preventivo",
      precios: { "todos": { min: 191800, max: 225800 } }
    },

    taller_psicosocial: {
      nombre: "Taller psicosocial",
      precios: {
        "1-10":  { min: 122600, max: 157000 },
        "11-25": { min: 145000, max: 178000 },
        "26-50": { min: 167000, max: 200300 },
        "51-99": { min: 167000, max: 200300 },
        "100+":  { min: 167000, max: 200300 },
      }
    },

    taller_cardiovascular: {
      nombre: "Taller cardiovascular — Hábitos saludables",
      precios: {
        "1-10":  { min: 194200, max: 228200 },
        "11-25": { min: 240800, max: 274900 },
        "26-50": { min: 287500, max: 321500 },
        "51-99": { min: 287500, max: 321500 },
        "100+":  { min: 287500, max: 321500 },
      }
    },

    taller_biomecanico: {
      nombre: "Taller biomecánico — Espalda sana",
      precios: {
        "1-10":  { min: 122600, max: 157000 },
        "11-25": { min: 145000, max: 178000 },
        "26-50": { min: 167000, max: 200300 },
        "51-99": { min: 167000, max: 200300 },
        "100+":  { min: 167000, max: 200300 },
      }
    },

    taller_visual: {
      nombre: "Taller visual — Cuidado de la salud visual",
      precios: {
        "1-10":  { min: 122600, max: 157000 },
        "11-25": { min: 145000, max: 178000 },
        "26-50": { min: 167000, max: 200300 },
        "51-99": { min: 167000, max: 200300 },
        "100+":  { min: 167000, max: 200300 },
      }
    },

    taller_auditivo: {
      nombre: "Taller auditivo — Cuidado de la salud auditiva",
      precios: {
        "1-10":  { min: 194200, max: 228200 },
        "11-25": { min: 240800, max: 274900 },
        "26-50": { min: 287500, max: 321500 },
        "51-99": { min: 287500, max: 321500 },
        "100+":  { min: 287500, max: 321500 },
      }
    },
  },

  notas: [
    "* Intervención Terapéutica y Mindfulness: el valor depende del profesional asignado. Su asesor le informará el costo exacto.",
    "* Test de Harvard: el valor se define en la evaluación de alcance con su asesor.",
    "* Higiene industrial (luxometrías, mediciones de ruido, etc.): rango aproximado entre $190.000 y $300.000 por sesión. Su asesor le informará el valor exacto según los puntos a evaluar.",
    "* Los servicios de seguimiento, verificación y mejoramiento continuo (indicadores, fichas técnicas, análisis PHVA, etc.) pueden tener costo adicional. Su asesor los incluirá en la cotización formal.",
  ]
};

export function calcularCotizacion(nosIdx, workers) {
  const rango = TARIFARIO.rangoTrabajadores(workers);
  const items = [];
  let totalMin = 0;
  let totalMax = 0;

  const getP = (paquete) => {
    return paquete.precios[rango] || paquete.precios["todos"] || null;
  };

  const add = (nombre, precio, nota = "") => {
    if (!precio) return;
    items.push({ nombre, min: precio.min, max: precio.max, nota });
    totalMin += precio.min;
    totalMax += precio.max;
  };

  const tiene = (idx) => nosIdx.includes(idx);

  // P1 — Perfil de cargo
  if (tiene(0)) add("Elaboración perfil de cargo", getP(TARIFARIO.paquetes.perfil_cargo));

  // P2-P3 — Exámenes / Procedimiento (se cobra una vez si falta cualquiera)
  if (tiene(1) || tiene(2)) add("Actualización procedimiento exámenes médicos", getP(TARIFARIO.paquetes.procedimiento_examenes));

  // P6 — SVE Cardiovascular
  if (tiene(5)) {
    add("SVE Cardiovascular — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion));
    add("Tamizaje cardiovascular", getP(TARIFARIO.paquetes.tamizaje_cardiovascular));
    add("Taller cardiovascular — Hábitos saludables", getP(TARIFARIO.paquetes.taller_cardiovascular));
  }

  // P7 — SVE Biomecánico
  if (tiene(6)) {
    add("SVE Biomecánico — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion));
    add("Rumboterapia", getP(TARIFARIO.paquetes.rumboterapia));
    add("Taller biomecánico — Espalda sana", getP(TARIFARIO.paquetes.taller_biomecanico));
  }

  // P8 — SVE Auditivo
  if (tiene(7)) {
    add("SVE Auditivo — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion));
    add("Taller auditivo", getP(TARIFARIO.paquetes.taller_auditivo));
  }

  // P9 — SVE Psicosocial
  if (tiene(8)) {
    add("SVE Psicosocial — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion));
    const bat = TARIFARIO.paquetes.bateria_psicosocial;
    const p = bat.precios[rango] || bat.precios["todos"];
    const esPorPersona = bat.porPersona?.includes(rango);
    if (p) add("Aplicación batería de riesgo psicosocial", p, esPorPersona ? "* Precio por persona según número de trabajadores" : "");
    add("Asesoría y plan de intervención psicosocial", getP(TARIFARIO.paquetes.intervencion_psicosocial));
    add("Taller psicosocial", getP(TARIFARIO.paquetes.taller_psicosocial));
  }

  // P10 — SVE Visual
  if (tiene(9)) {
    add("SVE Visual — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion));
    add("Taller visual — Cuidado de la salud visual", getP(TARIFARIO.paquetes.taller_visual));
  }

  // P12 — Pausas activas
  if (tiene(11)) add("Programa de pausas activas", getP(TARIFARIO.paquetes.pausas_activas));

  // P15 — Programa Rehabilitación 3050
  if (tiene(14)) add("Asesoría Programa Rehabilitación (Res. 3050/2022)", getP(TARIFARIO.paquetes.programa_3050));

  // P17 — Enfermedades laborales
  if (tiene(16)) add("Análisis puesto de trabajo — Determinación Enfermedad Laboral", getP(TARIFARIO.paquetes.apt_el));

  // P20 — Intervención según DCS
  if (tiene(19)) add("Inspección de puesto de trabajo — Preventivo", getP(TARIFARIO.paquetes.inspeccion_puesto));

  // P21 — Seguimiento SVE
  if (tiene(20)) add("Taller cardiovascular — Seguimiento SVE", getP(TARIFARIO.paquetes.taller_cardiovascular));

  // P22 — PIR / Reubicación
  if (tiene(21)) {
    add("Análisis puesto de trabajo — Reubicación", getP(TARIFARIO.paquetes.apt_reubicacion));
    add("Asesoría Matriz de Inclusión", getP(TARIFARIO.paquetes.matriz_inclusion));
  }

  // P25 — Ausentismo / morbilidad
  if (tiene(24)) add("Encuesta de morbilidad sentida", getP(TARIFARIO.paquetes.encuesta_morbilidad));

  return {
    items,
    totalMin,
    totalMax,
    notas: TARIFARIO.notas,
    rango,
  };
}
Listo
