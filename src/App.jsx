// App.jsx – NeuroConecta
// Raíz de la aplicación: configura el router y el proveedor de autenticación.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Páginas principales según el rol
import LoginPage    from './pages/LoginPage';
import PatientApp   from './pages/patient/PatientApp';
import CaregiverApp from './pages/caregiver/CaregiverApp';
import DoctorApp    from './pages/doctor/DoctorApp';

// Redirige al usuario a la ruta de su rol o al login si no está autenticado
function RoleRouter() {
  const { user, role, loading } = useAuth();

  // Pantalla de carga mientras Firebase resuelve el estado de auth
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:56 }}>🧠</div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:24,
        background:'linear-gradient(90deg,#7C6FE0,#2DCFB3)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        NeuroConecta
      </div>
      <div style={{ color:'#7A8FB0', fontSize:13 }}>Cargando...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />; // No autenticado → login

  // Redirección según rol del usuario
  if (role === 'patient')   return <Navigate to="/paciente"  replace />;
  if (role === 'caregiver') return <Navigate to="/cuidador"  replace />;
  if (role === 'doctor')    return <Navigate to="/medico"    replace />;

  return <Navigate to="/login" replace />; // Rol desconocido → login
}

export default function App() {
  return (
    // AuthProvider envuelve toda la app para acceso global al contexto de auth
    <AuthProvider>
      <div className="app-shell">
        <BrowserRouter>
          <Routes>
            <Route path="/login"      element={<LoginPage />}     /> {/* Pantalla de login */}
            <Route path="/paciente/*" element={<PatientApp />}    /> {/* App del paciente */}
            <Route path="/cuidador/*" element={<CaregiverApp />}  /> {/* App del cuidador */}
            <Route path="/medico/*"   element={<DoctorApp />}     /> {/* App del doctor */}
            <Route path="*"           element={<RoleRouter />}    /> {/* Ruta wildcard */}
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}
