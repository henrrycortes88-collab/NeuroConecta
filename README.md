# 🧠 Auds — Plataforma Integral de Atención Neurológica

Aplicación React con autenticación Google OAuth (Firebase), tres roles y panel clínico completo.

---

## 🚀 Instalación rápida

```bash
# 1. Entra al proyecto
cd neuroauds

# 2. Instala dependencias
npm install

# 3. Configura Firebase (ver abajo)

# 4. Inicia el servidor de desarrollo
npm start

## 📁 Estructura del proyecto

neuroauds/
├── public/
│   └── index.html
├── src/
│   ├── firebase.js              ← Config Firebase (¡editar!)
│   ├── App.jsx                  ← Router principal
│   ├── index.js                 ← Entry point
│   ├── context/
│   │   └── AuthContext.jsx      ← Auth + roles
│   ├── components/
│   │   ├── Charts.jsx           ← Bar, Line, HBar, Multi, Donut
│   │   └── Topbar.jsx           ← Barra superior compartida
│   ├── styles/
│   │   └── global.css           ← Variables CSS + estilos globales
│   └── pages/
│       ├── LoginPage.jsx        ← Login Google + selector de rol
│       ├── patient/
│       │   ├── PatientApp.jsx   ← Shell paciente (tabs)
│       │   ├── PatientHome.jsx  ← Inicio + ánimo + acciones
│       │   ├── PatientComunica.jsx ← Pictogramas + mensajes
│       │   ├── PatientEjercicios.jsx
│       │   ├── PatientJuegos.jsx
│       │   └── PatientEstado.jsx    ← Gráficas de estado
│       ├── caregiver/
│       │   ├── CaregiverApp.jsx
│       │   ├── CaregiverHome.jsx
│       │   ├── CaregiverComunica.jsx
│       │   ├── CaregiverRutinas.jsx ← Checklist interactivo
│       │   ├── CaregiverReportes.jsx
│       │   ├── CaregiverAlertas.jsx ← Dismissible alerts
│       │   └── CaregiverCitas.jsx
       └── doctor/
           ├── DoctorApp.jsx
           ├── DoctorPacientes.jsx  ← Lista con score de salud
           ├── DoctorDetalle.jsx    ← 7 tabs clínicos con gráficas
           ├── DoctorCitas.jsx      ← Aceptar/rechazar citas
           └── DoctorReportes.jsx   ← Comparativa 3 pacientes
└── package.json


## 📦 Dependencias principales

| Paquete           | Versión  | Uso                          |
|-------------------|----------|------------------------------|
| react             | ^18.2.0  | UI framework                 |
| react-router-dom  | ^6.22.0  | Navegación por rutas         |
| firebase          | ^10.8.0  | Auth Google + Firestore DB   |
| chart.js          | ^4.4.1   | Motor de gráficas            |
| react-chartjs-2   | ^5.2.0   | Wrapper React para Chart.js  |

# Build
npm run build

