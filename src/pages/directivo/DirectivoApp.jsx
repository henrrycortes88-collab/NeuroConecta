import React, { useState } from 'react';
import DarkTopbar        from '../../components/DarkTopbar';
import DirectivoStats    from './DirectivoStats';
import DirectivoPersonal from './DirectivoPersonal';
import DirectivoReportes from './DirectivoReportes';
import DirectivoConfig   from './DirectivoConfig';

const TABS = [
  { id:'stats',    icon:'📊', label:'Estadísticas' },
  { id:'personal', icon:'👤', label:'Personal'     },
  { id:'reportes', icon:'📋', label:'Reportes'     },
  { id:'config',   icon:'⚙️', label:'Configuración'},
];

export default function DirectivoApp() {
  const [tab, setTab] = useState('stats');

  const screen = {
    stats:    <DirectivoStats />,
    personal: <DirectivoPersonal />,
    reportes: <DirectivoReportes />,
    config:   <DirectivoConfig />,
  };

  return (
    <div className="dark-shell" style={{ display:'flex', flexDirection:'column' }}>
      <DarkTopbar subtitle="RESUMEN DE ESTADÍSTICAS"/>
      <div className="dark-content">{screen[tab]}</div>
      <nav className="dark-navbar">
        {TABS.map(t => (
          <button key={t.id} className={`dark-nav-btn ${tab===t.id?'active':''}`}
            onClick={()=>setTab(t.id)}>
            <span className="icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
