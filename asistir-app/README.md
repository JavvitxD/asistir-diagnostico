# 🏥 Asistir IPS y HSE — Diagnóstico de Medicina Preventiva

App web para que los clientes de Asistir realicen el diagnóstico F-MP-002 y reciban una propuesta automática de implementación.

---

## ¿Qué hace esta app?

1. El cliente ingresa sus datos de empresa
2. Responde las 37 preguntas del ciclo PHVA (F-MP-002 v2)
3. Ingresa fechas para el plan de trabajo
4. Recibe una propuesta con:
   - % de cumplimiento por etapa PHVA
   - Documentos faltantes con referencia normativa
   - Plan de trabajo con fechas y prioridades
   - Estimado de inversión
   - Opción de descargar/imprimir como PDF

---

## Cómo publicar en Vercel (sin conocimientos técnicos)

### Opción A — Subir la carpeta directamente (más fácil)

1. Ve a **https://vercel.com** y crea una cuenta gratuita (usa tu correo)
2. En el panel, haz clic en **"Add New Project"**
3. Selecciona **"Upload"** (subir archivos)
4. Arrastra y suelta esta carpeta completa `asistir-app`
5. En "Framework Preset" selecciona **Vite**
6. Haz clic en **Deploy**
7. En ~1 minuto tendrás un link como: `https://asistir-diagnostico.vercel.app`

### Opción B — Con GitHub (recomendada para actualizaciones futuras)

1. Crea cuenta en **https://github.com**
2. Crea un repositorio nuevo llamado `asistir-diagnostico`
3. Sube esta carpeta al repositorio
4. En Vercel, conecta tu cuenta de GitHub
5. Selecciona el repositorio y haz clic en Deploy
6. Cada vez que actualices el código, Vercel re-despliega automáticamente

---

## Estructura de archivos

```
asistir-app/
├── index.html                    # Punto de entrada
├── package.json                  # Dependencias
├── vite.config.js               # Configuración
├── vercel.json                  # Config de deploy
└── src/
    ├── App.jsx                  # App principal (maneja navegación)
    ├── data/
    │   └── preguntas.js         # Las 37 preguntas PHVA
    ├── utils/
    │   └── stats.js             # Cálculos de cumplimiento
    ├── components/
    │   └── HeaderBar.jsx        # Encabezado con logo Asistir
    └── screens/
        ├── Screen1Datos.jsx     # Formulario de datos empresa
        ├── Screen2Cuestionario.jsx  # Las 37 preguntas
        ├── Screen3Fechas.jsx    # Fechas del plan
        └── Screen4Propuesta.jsx # Propuesta + PDF
```

---

## Para correr localmente (si tiene Node.js instalado)

```bash
cd asistir-app
npm install
npm run dev
```

Abre http://localhost:5173

---

## Próximas funcionalidades planeadas

- [ ] Envío automático de propuesta al correo del cliente
- [ ] Notificación interna a Asistir cuando llega un diagnóstico
- [ ] Panel de administrador con todos los diagnósticos
- [ ] Descarga PDF con diseño completo
- [ ] Links personalizados por asesor de ventas

---

## Contacto técnico

Para soporte técnico o actualizaciones, compartir este proyecto con el desarrollador asignado.

**ASISTIR IPS Y HSE**  
Calle 17 N° 27-56, Yopal  
gestion.negocios@asistiripsyhse.com.co  
3204966084 · 3102793991
