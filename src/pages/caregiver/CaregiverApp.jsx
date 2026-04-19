/**
 * CaregiverApp.jsx - NeuroConecta
 * -----------------------------------------------
 * Aplicación principal del rol CUIDADOR.
 *
 * Funcionalidades:
 *  - Barra de navegación inferior con todas las secciones del cuidador.
 *  - Pantalla de emergencia en overlay cuando un paciente presiona el botón de auxilio.
 *  - Renderiza el componente activo según la pestaña seleccionada.
 *
 * Pestañas disponibles:
 *  - Inicio    : Panel resumen con estado de los pacientes
 *  - Mensajes  : Chat con el paciente (lee pictogramas AAC)
 *  - Rutinas   : Rutinas asignadas al paciente
 *  - Reportes  : Gráficos y estado emocional del paciente
 *  - Alertas   : Historial de alertas de emergencia
 *  - Recetas   : Recetas médicas enviadas por el doctor
 *  - Citas     : Agenda de citas médicas
 *  - Vincular  : Vinculación de nuevos pacientes por email
 *  - Doctores  : Administración de acceso a doctores
 */

import React, { useState, useEffect } from 'react';
import {
  query, collection, where, orderBy,
  limit, onSnapshot, updateDoc, doc, arrayUnion
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/Topbar';

// Componentes de cada sección del cuidador
import CaregiverHome      from './CaregiverHome';
import CaregiverComunica  from './CaregiverComunica';
import CaregiverRutinas   from './CaregiverRutinas';
import CaregiverReportes  from './CaregiverReportes';
import CaregiverAlertas   from './CaregiverAlertas';
import CaregiverCitas     from './CaregiverCitas';
import CaregiverDoctores  from './CaregiverDoctores';
import CaregiverRecetas   from './CaregiverRecetas';
import CaregiverVincular  from './CaregiverVincular';  // 🔗 Nueva sección de vinculación

// Definición de las pestañas de la barra inferior
const TABS = [
  { id:'home',         icon:'🏠', label:'Inicio'    },
  { id:'comunicacion', icon:'💬', label:'Mensajes'  },
  { id:'rutinas',      icon:'📋', label:'Rutinas'   },
  { id:'reportes',     icon:'📊', label:'Reportes'  },
  { id:'alertas',      icon:'🔔', label:'Alertas'   },
  { id:'recetas',      icon:'💊', label:'Recetas'   },
  { id:'citas',        icon:'📅', label:'Citas'     },
  { id:'vincular',     icon:'🔗', label:'Vincular'  }, // Nueva pestaña de vinculación
  { id:'doctores',     icon:'👨‍⚕️', label:'Doctores'  },
];

export default function CaregiverApp() {
  const { user, userData } = useAuth();

  // Pestaña activa actualmente
  const [tab, setTab] = useState('home');

  // Datos de la alerta de emergencia activa (si existe)
  const [emergency, setEmergency] = useState(null);

  /**
   * useEffect: escucha en tiempo real las alertas de emergencia
   * de los pacientes vinculados al cuidador.
   * Si hay una alerta nueva no vista, la muestra como overlay.
   */
  useEffect(() => {
    if (!user || !userData?.linkedPatients || userData.linkedPatients.length === 0) return;

    // Query para obtener la alerta más reciente de los pacientes vinculados
    const q = query(
      collection(db, 'alerts'),
      where('patientId', 'in', userData.linkedPatients),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const alertData = snap.docs[0].data();
        const alertId   = snap.docs[0].id;

        // Solo mostrar si el cuidador no la ha visto aún
        if (!alertData.viewedBy?.includes(user.uid)) {
          setEmergency({ id: alertId, ...alertData });
        }
      }
    });

    return unsub; // Limpia el listener al salir
  }, [user, userData]);

  /**
   * dismissEmergency
   * Marca la alerta como "vista" por el cuidador en Firestore
   * y cierra el overlay de emergencia.
   */
  const dismissEmergency = async () => {
    if (!emergency) return;
    try {
      await updateDoc(doc(db, 'alerts', emergency.id), {
        viewedBy: arrayUnion(user.uid)
      });
      setEmergency(null);
    } catch (e) {
      console.error('Error al marcar emergencia como vista:', e);
      setEmergency(null);
    }
  };

  // Mapa de pestañas → componentes renderizados
  const screen = {
    home:         <CaregiverHome />,
    comunicacion: <CaregiverComunica />,
    rutinas:      <CaregiverRutinas />,
    reportes:     <CaregiverReportes />,
    alertas:      <CaregiverAlertas />,
    recetas:      <CaregiverRecetas />,
    citas:        <CaregiverCitas />,
    vincular:     <CaregiverVincular />, // 🔗 Nueva pantalla de vinculación
    doctores:     <CaregiverDoctores />,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }} className="fade-in">
      {/* Barra superior con logo y datos del usuario */}
      <Topbar />

      {/* ────── Overlay de emergencia ────── */}
      {/* Se muestra encima de todo si un paciente vinculado presionó el botón de auxilio */}
      {emergency && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(220,38,38,.9)', zIndex:9999,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:20, color:'white', textAlign:'center'
        }}>
          <div className="fade-in">
            <div style={{ fontSize:80, marginBottom:20 }} className="emoji-anim">🚨</div>
            <div style={{ fontSize:28, fontWeight:900, marginBottom:10 }}>¡AUXILIO! EMERGENCIA</div>
            <div style={{ fontSize:18, marginBottom:30 }}>
              Tu paciente <strong>{emergency.patientName}</strong> necesita ayuda urgente.
            </div>
            <div style={{ display:'flex', gap:15, justifyContent:'center' }}>
              {/* Botón para marcar como vista y cerrar el overlay */}
              <button
                onClick={dismissEmergency}
                style={{ background:'white', color:'var(--coral)', border:'none', borderRadius:12, padding:'12px 30px', fontWeight:800, cursor:'pointer' }}>
                ENTENDIDO
              </button>
              {/* Enlace a servicios de emergencia */}
              <a href={`tel:911`} style={{ background:'black', color:'white', textDecoration:'none', borderRadius:12, padding:'12px 30px', fontWeight:800 }}>
                LLAMAR 911
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ────── Contenido de la pestaña activa ────── */}
      <div className="content">{screen[tab]}</div>

      {/* ────── Barra de navegación inferior ────── */}
      <nav className="navbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
