/**
 * LoginPage.jsx - NeuroConecta
 * Pantalla de inicio de sesión de la aplicación.
 *
 * Funcionalidad:
 *  - El usuario selecciona un perfil: Paciente, Cuidador o Médico.
 *  - Inicia sesión con Google OAuth a través de `loginWithGoogle`.
 *  - Redirige a la ruta correspondiente según el rol seleccionado:
 *     · Paciente  → /paciente
 *     · Cuidador  → /cuidador
 *     · Médico    → /medico
 *
 * Nota: El nombre "NeuroConecta" se muestra con gradiente animado
 *       usando -webkit-background-clip y un gradiente lineal CSS.
 */
// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'patient', emoji: '😊', label: 'Soy Paciente', desc: 'Comunicación, juegos y ejercicios', badge: 'badge-p' },
  { id: 'caregiver', emoji: '🤝', label: 'Soy Cuidador', desc: 'Rutinas, alertas y comunicación', badge: 'badge-c' },
  { id: 'doctor', emoji: '👨‍⚕️', label: 'Soy Médico', desc: 'Panel clínico y reportes', badge: 'badge-m' },
];

const ROUTE = { patient: '/paciente', caregiver: '/cuidador', doctor: '/medico' };

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    if (!selected) { setError('Elige tu perfil primero'); return; }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(selected);
      navigate(ROUTE[selected]);
    } catch (e) {
      console.error("Login Error: ", e);
      setError(`Error al iniciar sesión: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '30px 24px', gap: 24,
      background: 'radial-gradient(ellipse at 30% 20%,rgba(124,111,224,.15) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(45,207,179,.1) 0%,transparent 60%),var(--bg)'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{
            fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: 72,
            color: '#0b3273', letterSpacing: '-1px', lineHeight: 1
          }}>Auds</div>
          <div className="emoji-anim" style={{ marginLeft: 10, display: 'flex', alignItems: 'center' }}>
            <AppleLogo />
          </div>
        </div>
        <div style={{ 
          fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16, marginTop: 16,
          display: 'flex', justifyContent: 'center', gap: '8px', letterSpacing: '1px'
        }}>
          <span style={{ color: '#00b894' }}>JUEGA</span>
          <span style={{ color: '#0b3273' }}>•</span>
          <span style={{ color: '#ff7675' }}>COMUNICA</span>
          <span style={{ color: '#0b3273' }}>•</span>
          <span style={{ color: '#fdcb6e' }}>APRENDE</span>
        </div>
      </div>

      {/* Role selector */}
      <div style={{ width: '100%' }}>
        <p style={{
          color: 'var(--muted)', fontSize: 11, textAlign: 'center', marginBottom: 14,
          letterSpacing: '.5px', textTransform: 'uppercase'
        }}>
          Selecciona tu perfil
        </p>
        {ROLES.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id)}
            style={{
              background: selected === r.id ? 'rgba(124,111,224,.12)' : 'var(--card)',
              border: `1px solid ${selected === r.id ? 'var(--purple)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', padding: '18px 16px',
              display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', marginBottom: 8, transition: 'all .15s'
            }}
          >
            <div className="avatar" style={{
              background: r.id === 'patient' ? 'rgba(124,111,224,.2)' : r.id === 'caregiver' ? 'rgba(45,207,179,.2)' : 'rgba(74,159,255,.2)',
              color: r.id === 'patient' ? 'var(--purple)' : r.id === 'caregiver' ? 'var(--teal)' : 'var(--blue)',
              fontSize: 22
            }}>{r.emoji}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</div>
            </div>
            {selected === r.id && (
              <div style={{ marginLeft: 'auto', color: 'var(--teal)', fontSize: 20 }}>✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Google login button */}
      <div style={{ width: '100%' }}>
        {error && <p style={{ color: 'var(--coral)', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{error}</p>}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            background: 'white', color: '#1A1A2E',
            borderRadius: 10, padding: '13px 20px', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            border: 'none', fontFamily: "'Nunito',sans-serif",
            opacity: loading ? .7 : 1, transition: 'transform .15s'
          }}
        >
          {loading ? '⏳ Conectando...' : (
            <>
              <GoogleIcon />
              Continuar con Google
            </>
          )}
        </button>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 11, textAlign: 'center' }}>
        Auds v1.0 · Datos cifrados y seguros 🔒
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.682 14.015 17.64 11.708 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="85" height="85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {/* Leaves */}
      <path d="M 49 26 C 35 26, 30 8, 40 4 C 45 4, 49 15, 49 26 Z" fill="#00b894" stroke="#0b3273" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M 51 26 C 65 26, 70 8, 60 4 C 55 4, 51 15, 51 26 Z" fill="#00b894" stroke="#0b3273" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Apple Body */}
      <path d="M 50 25 C 30 15, 15 30, 15 55 C 15 85, 35 90, 50 90 C 65 90, 85 85, 85 55 C 85 30, 70 15, 50 25 Z" fill="#ff5c5c" stroke="#0b3273" strokeWidth="4" strokeLinejoin="round" />
      
      {/* Eyes */}
      <ellipse cx="35" cy="53" rx="4" ry="6" fill="#0b3273" />
      <ellipse cx="65" cy="53" rx="4" ry="6" fill="#0b3273" />
      
      {/* Blush */}
      <circle cx="25" cy="62" r="5" fill="#ff4757" opacity="0.8" />
      <circle cx="75" cy="62" r="5" fill="#ff4757" opacity="0.8" />
      
      {/* Happy Mouth */}
      <path d="M 42 58 C 42 74, 58 74, 58 58 Z" fill="#0b3273" />
      <path d="M 45 63 C 45 69, 55 69, 55 63 Z" fill="#ff7675" />

      {/* Speech Bubble */}
      <g transform="translate(65, 0)">
        <path d="M 5 30 C -8 30, -8 5, 15 5 C 38 5, 38 30, 25 30 L 18 40 L 15 30 Z" fill="white" stroke="#0b3273" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="8" cy="17" r="2.5" fill="#00b894" />
        <circle cx="15" cy="17" r="2.5" fill="#00b894" />
        <circle cx="22" cy="17" r="2.5" fill="#00b894" />
      </g>
    </svg>
  );
}
