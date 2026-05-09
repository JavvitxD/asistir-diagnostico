import { PREGUNTAS } from "../data/preguntas";

export function calcStats(respuestas) {
  const etapas = ["P", "H", "V", "A"];
  const st = {};
  etapas.forEach((e) => { st[e] = { si: 0, no: 0, na: 0, total: 0 }; });

  PREGUNTAS.forEach((q, i) => {
    const r = respuestas[i]?.val;
    st[q.e].total++;
    if (r === "SI") st[q.e].si++;
    else if (r === "NO") st[q.e].no++;
    else if (r === "NA") st[q.e].na++;
  });

  etapas.forEach((e) => {
    const s = st[e];
    const ap = s.total - s.na;
    s.pct = ap > 0 ? Math.round((s.si / ap) * 100) : 100;
  });

  const tSi = etapas.reduce((a, e) => a + st[e].si, 0);
  const tAp = etapas.reduce((a, e) => a + (st[e].total - st[e].na), 0);
  st.total = tAp > 0 ? Math.round((tSi / tAp) * 100) : 0;
  return st;
}

export function getNosIdx(respuestas) {
  return PREGUNTAS.map((q, i) => (respuestas[i]?.val === "NO" ? i : -1)).filter((i) => i >= 0);
}

export function getPrioridad(etapa) {
  return etapa === "P" ? "Alta" : etapa === "H" ? "Media" : "Baja";
}

export function mesDesde(inicio, offset) {
  if (!inicio) return `Mes ${offset + 1}`;
  const [y, m] = inicio.split("-").map(Number);
  return new Date(y, m - 1 + offset, 1).toLocaleDateString("es-CO", { month: "short", year: "numeric" });
}

export function semaforo(pct) {
  return pct >= 80 ? "#1D9E75" : pct >= 50 ? "#EF9F27" : "#E24B4A";
}
