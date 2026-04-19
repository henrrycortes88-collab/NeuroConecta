// src/components/Topbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BADGE = { patient: 'badge-p', caregiver: 'badge-c', doctor: 'badge-m' };
const LABEL = { patient: 'Paciente', caregiver: 'Cuidador', doctor: 'Médico' };

export default function Topbar({ title }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <span className="topbar-logo">NeuroConecta</span>
      {title && <span style={{ fontSize:13, fontWeight:700, color:'var(--muted)', flex:1 }}>{title}</span>}
      {!title && <div style={{ flex:1 }} />}
      {user?.photoURL && (
        <img src={user.photoURL} alt="avatar"
          style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} />
      )}
      <span className={`badge ${BADGE[role]}`}>{LABEL[role]}</span>
      <button onClick={handleLogout}
        style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, marginLeft:4 }}
        title="Cerrar sesión">🚪</button>
    </div>
  );
}
