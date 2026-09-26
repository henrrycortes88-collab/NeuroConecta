import React, { useState } from 'react';
import DarkTopbar       from '../../components/DarkTopbar';
import DocenteAlumnos   from './DocenteAlumnos';
import DocenteActividades from './DocenteActividades';
import DocenteReportes  from './DocenteReportes';

const TABS = [
  { id:'alumnos',     icon:'👦', label:'Alumnos'     },
  { id:'actividades', icon:'📚', label:'Actividades' },
  { id:'reportes',    icon:'📊', label:'Reportes'    },
];

export default function DocenteApp() {
  const [tab, setTab] = useState('alumnos');

  const screen = {
    alumnos:     <DocenteAlumnos />,
    actividades: <DocenteActividades />,
    reportes:    <DocenteReportes />,
  };

  return (
    <div className="dark-shell" style={{ display:'flex', flexDirection:'column' }}>
      <DarkTopbar subtitle="DOCENTE-ACTIVIDADES"/>
      <div className="dark-content">{screen[tab]}</div>
      <nav className="dark-navbar">
        {TABS.map(t => (
          <button key={t.id} className={`dark-nav-btn ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>
            <span className="icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
