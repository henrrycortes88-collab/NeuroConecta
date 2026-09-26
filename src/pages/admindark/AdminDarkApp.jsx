import React, { useState } from 'react';
import DarkTopbar    from '../../components/DarkTopbar';
import AdminDarkPanel    from './AdminDarkPanel';
import AdminDarkUsuarios from './AdminDarkUsuarios';
import AdminDarkSistema  from './AdminDarkSistema';

const TABS = [
  { id:'panel',    icon:'🛡️', label:'Panel'    },
  { id:'usuarios', icon:'👥', label:'Usuarios' },
  { id:'sistema',  icon:'⚙️', label:'Sistema'  },
];

export default function AdminDarkApp() {
  const [tab, setTab] = useState('panel');

  const screen = {
    panel:    <AdminDarkPanel onNav={setTab}/>,
    usuarios: <AdminDarkUsuarios />,
    sistema:  <AdminDarkSistema />,
  };

  return (
    <div className="dark-shell" style={{ display:'flex', flexDirection:'column' }}>
      <DarkTopbar />
      {/* Banda roja de advertencia */}
      <div style={{
        background:'rgba(248,81,73,.1)', borderBottom:'1px solid rgba(248,81,73,.3)',
        padding:'5px 16px', display:'flex', alignItems:'center', gap:6,
        fontSize:11, color:'#F85149', fontWeight:700, flexShrink:0,
      }}>
        🔒 Modo administrador — acceso restringido
      </div>
      <div className="dark-content">{screen[tab]}</div>
      <nav className="dark-navbar">
        {TABS.map(t => (
          <button key={t.id}
            className={`dark-nav-btn ${tab===t.id?'active':''}`}
            style={tab===t.id ? { color:'#F85149' } : {}}
            onClick={() => setTab(t.id)}>
            <span className="icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
