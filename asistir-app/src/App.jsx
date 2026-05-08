import { useState } from "react";
import Screen1Datos from "./screens/Screen1Datos";
import Screen2Cuestionario from "./screens/Screen2Cuestionario";
import Screen3Fechas from "./screens/Screen3Fechas";
import Screen4Propuesta from "./screens/Screen4Propuesta";
import HeaderBar from "./components/HeaderBar";

export default function App() {
  const [screen, setScreen] = useState(1);
  const [empresa, setEmpresa] = useState({});
  const [respuestas, setRespuestas] = useState([]);
  const [fechas, setFechas] = useState({});

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      {screen === 1 && (
        <Screen1Datos onNext={(data) => { setEmpresa(data); setScreen(2); }} />
      )}
      {screen === 2 && (
        <Screen2Cuestionario
          onNext={(resp) => { setRespuestas(resp); setScreen(3); }}
          onBack={() => setScreen(1)}
        />
      )}
      {screen === 3 && (
        <Screen3Fechas
          onNext={(f) => { setFechas(f); setScreen(4); }}
          onBack={() => setScreen(2)}
        />
      )}
      {screen === 4 && (
        <Screen4Propuesta
          empresa={empresa}
          respuestas={respuestas}
          fechas={fechas}
          onReiniciar={() => { setScreen(1); setEmpresa({}); setRespuestas([]); setFechas({}); }}
          onRevisar={() => setScreen(2)}
        />
      )}
    </div>
  );
}
