import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DirectivoConfig() {
  const { user } = useAuth();
  const [notifSOS,    setNotifSOS]    = useState(true);
  const [modoOscuro,  setModoOscuro]  = useState(true);
  const [notifReporte,setNotifReporte]= useState(false);

  const SETTINGS = [
    { label:'Notificaciones de SOS',     val:notifSOS,     set:setNotifSOS     },
    { label:'Modo Oscuro',               val:modoOscuro,   set:setModoOscuro   },
    { label:'Avisos de nuevos reportes', val:notifReporte, set:setNotifReporte },
  ];

  return (
    <>
      {/* Cuenta institucional */}
      <div className="dark-card">
        <div className="dark-card-title">Cuenta Institucional</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:10,
            background:'rgba(46,160,67,.15)', border:'1px solid rgba(46,160,67,.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>
            🏫
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--dark-text)' }}>
              Centro NeuroAuds
            </div>
            <div style={{ fontSize:12, color:'var(--dark-muted)' }}>Cuautla, Morelos</div>
          </div>
        </div>
      </div>

      {/* Perfil del directivo */}
      <div className="dark-card">
        <div className="dark-card-title">Mi perfil</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="av"
                style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover' }}/>
            : <div style={{ width:46, height:46, borderRadius:'50%', fontSize:22,
                background:'rgba(139,92,246,.2)', color:'#8B5CF6',
                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>
                {user?.displayName?.[0] || 'D'}
              </div>
          }
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>{user?.displayName || 'Director'}</div>
            <div style={{ fontSize:11, color:'var(--dark-muted)' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="dark-card">
        <div className="dark-card-title">Preferencias</div>
        {SETTINGS.map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center',
            justifyContent:'space-between', padding:'10px 0',
            borderBottom:'1px solid var(--dark-border)' }}>
            <span style={{ fontSize:13, color:'var(--dark-text)' }}>{s.label}</span>
            <button
              className={`dark-toggle ${s.val ? 'on' : 'off'}`}
              onClick={() => s.set(v => !v)}>
              <div className="knob"/>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
