# 🧠 NeuroAuds — Plataforma Integral de Atención Neurológica

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
```

---

## 🔥 Configuración Firebase

### Paso 1 — Crear proyecto
1. Ve a https://console.firebase.google.com/
2. Clic en **"Agregar proyecto"** → nombre: `neuroauds`
3. Desactiva Google Analytics (opcional) → **Crear proyecto**

### Paso 2 — Activar Authentication
1. En el menú izquierdo → **Authentication** → **Comenzar**
2. Pestaña **Método de inicio de sesión** → **Google** → Activar
3. Selecciona correo de soporte → **Guardar**

### Paso 3 — Crear base de datos Firestore
1. En el menú → **Firestore Database** → **Crear base de datos**
2. Modo de producción → elige región → **Listo**
3. Ve a **Reglas** y pega:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /patients/{patientId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Paso 4 — Obtener credenciales
1. ⚙️ **Configuración del proyecto** → **Tus apps** → icono Web `</>`
2. Registra la app (nombre: `neuroauds-web`)
3. Copia el objeto `firebaseConfig`
4. Pégalo en `src/firebase.js` reemplazando los valores de ejemplo

### Paso 5 — Agregar dominio autorizado
1. Authentication → **Configuración** → **Dominios autorizados**
2. Agrega `localhost` (ya viene) y tu dominio de producción

---

## 📁 Estructura del proyecto

```
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
│       └── doctor/
│           ├── DoctorApp.jsx
│           ├── DoctorPacientes.jsx  ← Lista con score de salud
│           ├── DoctorDetalle.jsx    ← 7 tabs clínicos con gráficas
│           ├── DoctorCitas.jsx      ← Aceptar/rechazar citas
│           └── DoctorReportes.jsx   ← Comparativa 3 pacientes
└── package.json






