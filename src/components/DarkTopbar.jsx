// src/components/DarkTopbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BADGES = {
  directivo:  { label:'Director',       cls:'badge-directivo' },
  docente:    { label:'Docente',         cls:'badge-docente'   },
  admindark:  { label:'Admin',           cls:'badge-admindark' },
};

export default function DarkTopbar({ subtitle }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const b = BADGES[role] || { label: role, cls: 'badge-docente' };

  return (
    <div className="dark-topbar">
      <span className="dark-logo">NeuroAuds</span>
      {subtitle && (
        <span style={{ fontSize:11, color:'var(--dark-muted)', flex:1,
          textTransform:'uppercase', letterSpacing:'.5px' }}>{subtitle}</span>
      )}
      {!subtitle && <div style={{ flex:1 }}/>}
      {user?.photoURL && (
        <img src={user.photoURL} alt="av"
          style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover' }}/>
      )}
      <span className={`dark-badge ${b.cls}`}>{b.label}</span>
      <button onClick={async()=>{ await logout(); navigate('/login'); }}
        style={{ background:'none', border:'none', cursor:'pointer',
          fontSize:16, marginLeft:4, color:'var(--dark-muted)' }}>
        🚪
      </button>
    </div>
  );
}
