// PatientApp.jsx – Shell principal del PACIENTE con barra de navegación inferior.
import React, { useState } from 'react';
import { useAuth }          from '../../context/AuthContext';
import Topbar               from '../../components/Topbar';
import PatientHome          from './PatientHome';
import PatientComunica      from './PatientComunica';   // Sistema AAC de pictogramas
import PatientEjercicios    from './PatientEjercicios'; // Rutinas de ejercicio
import PatientJuegos        from './PatientJuegos';     // Juegos terapéuticos
import PatientEstado        from './PatientEstado';     // Registro de estado de ánimo

// Pestañas de la barra inferior
const TABS = [
  { id:'home',         icon:'🏠', label:'Inicio'    },
  { id:'comunicacion', icon:'💬', label:'Comunicar' },
  { id:'ejercicios',   icon:'🏃', label:'Ejercicio' },
  { id:'juegos',       icon:'🎮', label:'Juegos'    },
  { id:'estado',       icon:'🌟', label:'Estado'    },
];

export default function PatientApp() {
  const [tab, setTab] = useState('home'); // Pestaña activa
  const { user }      = useAuth();
  const name          = user?.displayName?.split(' ')[0] || 'Usuario'; // Solo primer nombre

  // Mapa pestaña → componente
  const screen = {
    home:         <PatientHome name={name} onNav={setTab} />,
    comunicacion: <PatientComunica />,
    ejercicios:   <PatientEjercicios />,
    juegos:       <PatientJuegos />,
    estado:       <PatientEstado />,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }} className="fade-in">
      <Topbar />
      <div className="content">{screen[tab]}</div> {/* Renderiza la sección activa */}
      <nav className="navbar">
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
