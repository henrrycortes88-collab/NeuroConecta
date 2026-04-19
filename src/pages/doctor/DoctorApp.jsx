// DoctorApp.jsx – Shell principal del MÉDICO. Verifica acceso, escucha alertas y renderiza secciones.
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, query, collection, where, orderBy, limit, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import DoctorPacientes from './DoctorPacientes'; // Lista y vinculación de pacientes
import DoctorDetalle from './DoctorDetalle';   // Detalle individual del paciente
import DoctorCitas from './DoctorCitas';      // Gestión de citas y recetas
import DoctorReportes from './DoctorReportes';  // Reportes y gráficos clínicos

// Pestañas de la barra inferior del doctor
const TABS = [
  { id: 'pacientes', icon: '👥', label: 'Pacientes' },
  { id: 'citas', icon: '📅', label: 'Citas' },
  { id: 'reportes', icon: '📊', label: 'Reportes' },
];

export default function DoctorApp() {
  const { user, loading } = useAuth();
  const [accessGranted, setAccessGranted] = useState(null);
  const [tab, setTab] = useState('pacientes');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [emergency, setEmergency] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Verificar acceso
    const unsubAccess = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setAccessGranted(!!docSnap.data().accessGranted);
      } else {
        setAccessGranted(false);
      }
    });

    // 2. Escuchar Alertas de Emergencia
    const q = query(
      collection(db, 'alerts'),
      where('targetDoctorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubAlerts = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const alertData = snap.docs[0].data();
        const alertId = snap.docs[0].id;
        // Solo mostrar si no ha sido visto por este usuario
        if (!alertData.viewedBy?.includes(user.uid)) {
          setEmergency({ id: alertId, ...alertData });
          // Opcional: Reproducir sonido de alerta
        }
      }
    });

    return () => {
      unsubAccess();
      unsubAlerts();
    };
  }, [user]);

  const dismissEmergency = async () => {
    if (!emergency) return;
    try {
      await updateDoc(doc(db, 'alerts', emergency.id), {
        viewedBy: arrayUnion(user.uid)
      });
      setEmergency(null);
    } catch (e) {
      console.error(e);
      setEmergency(null);
    }
  };

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setTab('detalle');
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setTab('pacientes');
  };

  const screen = {
    pacientes: <DoctorPacientes onSelect={handleSelectPatient} />,
    detalle: <DoctorDetalle patient={selectedPatient} onBack={handleBack} />,
    citas: <DoctorCitas />,
    reportes: <DoctorReportes />,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="fade-in">
        <Topbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 16 }}>Cargando datos de usuario...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (accessGranted === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="fade-in">
        <Topbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 16 }}>Verificando permisos del doctor...</div>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="fade-in">
        <Topbar />
        <div className="content" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="card">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Acceso Restringido</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>
              Tu cuenta de doctor está en espera de aprobación.<br />
              Un administrador (cuidador) debe concederte acceso para poder ver los pacientes.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="fade-in">
      <Topbar />

      {/* Emergency Overlay */}
      {emergency && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(220,38,38,.9)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'white', textAlign: 'center'
        }}>
          <div className="fade-in">
            <div style={{ fontSize: 80, marginBottom: 20 }} className="emoji-anim">🚨</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>EMERGENCIA SOS</div>
            <div style={{ fontSize: 18, marginBottom: 30 }}>
              El paciente <strong>{emergency.patientName}</strong> ha activado la alerta de pánico.
            </div>
            <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
              <button
                onClick={dismissEmergency}
                style={{ background: 'white', color: 'var(--coral)', border: 'none', borderRadius: 12, padding: '12px 30px', fontWeight: 800, cursor: 'pointer' }}>
                ENTENDIDO
              </button>
              <a href={`tel:911`} style={{ background: 'black', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '12px 30px', fontWeight: 800 }}>
                LLAMAR 911
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="content">{screen[tab] || screen.pacientes}</div>
      <nav className="navbar">
        {TABS.map(t => (
          <button key={t.id}
            className={`nav-btn ${(tab === t.id || (t.id === 'pacientes' && tab === 'detalle')) ? 'active' : ''}`}
            onClick={() => { setSelectedPatient(null); setTab(t.id); }}>
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
