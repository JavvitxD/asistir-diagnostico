bash

cat /home/claude/tarifario_v2.js
Salida

// TARIFARIO MEDICINA PREVENTIVA - ASISTIR IPS Y HSE
// min = valor mínimo de negociación (solo visible para el asesor/admin)
// max = valor de referencia visible al cliente

const TARIFARIO = {

  rangoTrabajadores: (workers) => {
    if (!workers) return "1-10";
    if (workers === "1 – 10")    return "1-10";
    if (workers === "11 – 50")   return "11-25";
    if (workers === "51 – 200")  return "26-50";
    if (workers === "201 – 500") return "51-99";
    return "100+";
  },

  numTrabajadores: (workers) => {
    if (!workers) return 5;
    if (workers === "1 – 10")    return 5;
    if (workers === "11 – 50")   return 25;
    if (workers === "51 – 200")  return 100;
    if (workers === "201 – 500") return 300;
    return 500;
  },

  paquetes: {
    perfil_cargo: {
      nombre: "Elaboración y diseño de Perfil del Cargo",
      categoria: "programa",
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
      categoria: "programa",
      precios: { "todos": { min: 380000, max: 450000 } }
    },
    sve_elaboracion: {
      nombre: "SVE — Elaboración desde cero",
      categoria: "programa",
      precios: { "todos": { min: 328000, max: 362100 } }
    },
    sve_asesoria: {
      nombre: "SVE — Asesoría y actualización",
      categoria: "programa",
      precios: { "todos": { min: 126800, max: 157500 } }
    },
    bateria_psicosocial: {
      nombre: "Aplicación batería de riesgo psicosocial",
      categoria: "programa",
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
      categoria: "programa",
      precios: { "todos": { min: 191700, max: 203000 } }
    },
    tamizaje_cardiovascular: {
      nombre: "Tamizaje cardiovascular",
      categoria: "programa",
      precios: { "todos": { min: 23000, max: 23000 } }
    },
    rumboterapia: {
      nombre: "Rumboterapia",
      categoria: "programa",
      precios: { "todos": { min: 265000, max: 299000 } }
    },
    pausas_activas: {
      nombre: "Programa de pausas activas",
      categoria: "programa",
      precios: { "todos": { min: 147400, max: 181500 } }
    },
    programa_3050: {
      nombre: "Asesoría Programa de Rehabilitación (Res. 3050/2022)",
      categoria: "programa",
      precios: { "todos": { min: 191700, max: 225800 } }
    },
    apt_reubicacion: {
      nombre: "Análisis de puesto de trabajo — Reubicación",
      categoria: "programa",
      precios: { "todos": { min: 785000, max: 819200 } }
    },
    apt_el: {
      nombre: "Análisis de puesto de trabajo — Determinación Enfermedad Laboral",
      categoria: "programa",
      precios: { "todos": { min: 922000, max: 956000 } }
    },
    matriz_inclusion: {
      nombre: "Asesoría y elaboración Matriz de Inclusión",
      categoria: "programa",
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
      categoria: "programa",
      precios: { "todos": { min: 4700, max: 5500 } }
    },
    inspeccion_puesto: {
      nombre: "Inspección de puesto de trabajo — Preventivo",
      categoria: "programa",
      precios: { "todos": { min: 191800, max: 225800 } }
    },
    taller_psicosocial: {
      nombre: "Taller psicosocial",
      categoria: "programa",
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
      categoria: "programa",
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
      categoria: "programa",
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
      categoria: "programa",
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
      categoria: "programa",
      precios: {
        "1-10":  { min: 194200, max: 228200 },
        "11-25": { min: 240800, max: 274900 },
        "26-50": { min: 287500, max: 321500 },
        "51-99": { min: 287500, max: 321500 },
        "100+":  { min: 287500, max: 321500 },
      }
    },
  },

  // Exámenes médicos — precio por persona
  examenes: [
    { id: "emg", nombre: "Evaluación médica ocupacional énfasis osteomuscular", cups: "890262", precioUnitario: 31500, categoria: "Exámenes médicos ocupacionales" },
    { id: "ema", nombre: "Evaluación médica ocupacional énfasis en alturas", cups: "890262", precioUnitario: 31500, categoria: "Exámenes médicos ocupacionales" },
    { id: "emac", nombre: "Evaluación médica ocupacional alturas y espacios confinados", cups: "890262", precioUnitario: 31500, categoria: "Exámenes médicos ocupacionales" },
    { id: "postinc", nombre: "Consulta post incapacidad", cups: "890262", precioUnitario: 55750, categoria: "Exámenes médicos ocupacionales" },
    { id: "medlab", nombre: "Valoración control medicina laboral", cups: "890362", precioUnitario: 98700, categoria: "Exámenes médicos ocupacionales" },
    { id: "audio", nombre: "Audiometría ocupacional", cups: "954107", precioUnitario: 20000, categoria: "Valoraciones especializadas" },
    { id: "opto", nombre: "Optometría ocupacional", cups: "890207", precioUnitario: 20000, categoria: "Valoraciones especializadas" },
    { id: "optoc", nombre: "Optometría clínica", cups: "-", precioUnitario: 50000, categoria: "Valoraciones especializadas" },
    { id: "ecg", nombre: "Electrocardiograma", cups: "895100", precioUnitario: 40700, categoria: "Valoraciones especializadas" },
    { id: "espi", nombre: "Espirometría", cups: "893700", precioUnitario: 27500, categoria: "Valoraciones especializadas" },
    { id: "fisio", nombre: "Evaluación por fisioterapia", cups: "890211", precioUnitario: 46000, categoria: "Valoraciones especializadas" },
    { id: "psico1", nombre: "Consulta primera vez psicología ocupacional", cups: "890208", precioUnitario: 61200, categoria: "Psicología" },
    { id: "psicotest", nombre: "Prueba psicotécnica (Wartegg / Hamilton / Estrés / Beck)", cups: "930102", precioUnitario: 30700, categoria: "Psicología" },
    { id: "rxcerv", nombre: "Radiografía columna cervical", cups: "871010", precioUnitario: 107000, categoria: "Imágenes diagnósticas" },
    { id: "rxlumb", nombre: "Radiografía columna lumbo-sacra", cups: "871040", precioUnitario: 131000, categoria: "Imágenes diagnósticas" },
    { id: "rxtorax", nombre: "Radiografía de tórax", cups: "871121", precioUnitario: 93400, categoria: "Imágenes diagnósticas" },
  ],

  notas: [
    "* Intervención Terapéutica y Mindfulness: el valor depende del profesional asignado. Su asesor le informará el costo exacto.",
    "* Test de Harvard: el valor se define en la evaluación de alcance con su asesor.",
    "* Higiene industrial (luxometrías, mediciones de ruido, etc.): rango aproximado entre $190.000 y $300.000 por sesión.",
    "* Los precios de exámenes médicos son por persona. El total varía según el número de trabajadores a evaluar.",
    "* Los servicios de seguimiento, verificación y mejoramiento continuo pueden tener costo adicional.",
  ]
};

export function calcularCotizacion(nosIdx, workers) {
  const rango = TARIFARIO.rangoTrabajadores(workers);
  const numTrab = TARIFARIO.numTrabajadores(workers);
  const items = [];
  let totalMin = 0;
  let totalMax = 0;

  const getP = (paquete) => paquete.precios[rango] || paquete.precios["todos"] || null;

  const add = (nombre, precio, nota = "", categoria = "Programas") => {
    if (!precio) return;
    items.push({ nombre, min: precio.min, max: precio.max, nota, categoria, tipo: "programa", seleccionado: true });
    totalMin += precio.min;
    totalMax += precio.max;
  };

  const addExamen = (examenId, nota = "") => {
    const ex = TARIFARIO.examenes.find(e => e.id === examenId);
    if (!ex) return;
    const total = ex.precioUnitario * numTrab;
    items.push({
      nombre: `${ex.nombre}`,
      min: total,
      max: total,
      nota: `${numTrab} personas × $${ex.precioUnitario.toLocaleString("es-CO")} c/u${nota ? " · " + nota : ""}`,
      categoria: ex.categoria,
      tipo: "examen",
      precioUnitario: ex.precioUnitario,
      numPersonas: numTrab,
      seleccionado: true,
    });
    totalMin += total;
    totalMax += total;
  };

  const tiene = (idx) => nosIdx.includes(idx);

  // P1 — Perfil de cargo
  if (tiene(0)) add("Elaboración perfil de cargo", getP(TARIFARIO.paquetes.perfil_cargo), "", "Programas");

  // P2-P3 — Exámenes
  if (tiene(1) || tiene(2)) {
    add("Actualización procedimiento exámenes médicos", getP(TARIFARIO.paquetes.procedimiento_examenes), "", "Programas");
    addExamen("emg", "énfasis osteomuscular");
  }

  // P6 — SVE Cardiovascular
  if (tiene(5)) {
    add("SVE Cardiovascular — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion), "", "SVE Cardiovascular");
    add("Tamizaje cardiovascular", getP(TARIFARIO.paquetes.tamizaje_cardiovascular), "", "SVE Cardiovascular");
    add("Taller cardiovascular — Hábitos saludables", getP(TARIFARIO.paquetes.taller_cardiovascular), "", "SVE Cardiovascular");
    addExamen("ecg");
  }

  // P7 — SVE Biomecánico
  if (tiene(6)) {
    add("SVE Biomecánico — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion), "", "SVE Biomecánico");
    add("Rumboterapia", getP(TARIFARIO.paquetes.rumboterapia), "", "SVE Biomecánico");
    add("Taller biomecánico — Espalda sana", getP(TARIFARIO.paquetes.taller_biomecanico), "", "SVE Biomecánico");
    addExamen("fisio");
    addExamen("rxcerv");
    addExamen("rxlumb");
  }

  // P8 — SVE Auditivo
  if (tiene(7)) {
    add("SVE Auditivo — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion), "", "SVE Auditivo");
    add("Taller auditivo", getP(TARIFARIO.paquetes.taller_auditivo), "", "SVE Auditivo");
    addExamen("audio");
  }

  // P9 — SVE Psicosocial
  if (tiene(8)) {
    add("SVE Psicosocial — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion), "", "SVE Psicosocial");
    const bat = TARIFARIO.paquetes.bateria_psicosocial;
    const p = bat.precios[rango] || bat.precios["todos"];
    const esPorPersona = bat.porPersona?.includes(rango);
    if (p) add("Aplicación batería de riesgo psicosocial", p, esPorPersona ? "Precio por persona" : "", "SVE Psicosocial");
    add("Asesoría y plan de intervención psicosocial", getP(TARIFARIO.paquetes.intervencion_psicosocial), "", "SVE Psicosocial");
    add("Taller psicosocial", getP(TARIFARIO.paquetes.taller_psicosocial), "", "SVE Psicosocial");
    addExamen("psico1");
    addExamen("psicotest");
  }

  // P10 — SVE Visual
  if (tiene(9)) {
    add("SVE Visual — Elaboración", getP(TARIFARIO.paquetes.sve_elaboracion), "", "SVE Visual");
    add("Taller visual — Cuidado de la salud visual", getP(TARIFARIO.paquetes.taller_visual), "", "SVE Visual");
    addExamen("opto");
  }

  // P12 — Pausas activas
  if (tiene(11)) add("Programa de pausas activas", getP(TARIFARIO.paquetes.pausas_activas), "", "Programas");

  // P15 — Programa 3050
  if (tiene(14)) add("Asesoría Programa Rehabilitación (Res. 3050/2022)", getP(TARIFARIO.paquetes.programa_3050), "", "Programas");

  // P17 — Enfermedades laborales
  if (tiene(16)) add("Análisis puesto de trabajo — Determinación EL", getP(TARIFARIO.paquetes.apt_el), "", "Programas");

  // P20 — Intervención según DCS
  if (tiene(19)) add("Inspección de puesto de trabajo — Preventivo", getP(TARIFARIO.paquetes.inspeccion_puesto), "", "Programas");

  // P21 — Seguimiento SVE
  if (tiene(20)) add("Taller cardiovascular — Seguimiento SVE", getP(TARIFARIO.paquetes.taller_cardiovascular), "", "Programas");

  // P22 — PIR / Reubicación
  if (tiene(21)) {
    add("Análisis puesto de trabajo — Reubicación", getP(TARIFARIO.paquetes.apt_reubicacion), "", "Programas");
    add("Asesoría Matriz de Inclusión", getP(TARIFARIO.paquetes.matriz_inclusion), "", "Programas");
  }

  // P25 — Ausentismo / morbilidad
  if (tiene(24)) add("Encuesta de morbilidad sentida", getP(TARIFARIO.paquetes.encuesta_morbilidad), "", "Programas");

  return { items, totalMin, totalMax, notas: TARIFARIO.notas, rango, numTrab };
}

export { TARIFARIO };
