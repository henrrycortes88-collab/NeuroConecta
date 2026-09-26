import React from 'react';
import { BarChart, LineChart } from '../../components/Charts';

const DAYS = ['L','M','Mi','J','V','S','D'];

const LOGS = [
  { tipo:'ok',   msg:'sofia@mail.com inició sesión'        },
  { tipo:'warn', msg:'Firebase cuota al 72%'               },
  { tipo:'err',  msg:'Permiso denegado uid:xyz'            },
  { tipo:'ok',   msg:'Backup completado (47 documentos)'   },
];

export default function AdminDarkPanel({ onNav }) {
  return (
    <>
      <div style={{ padding:'4px 0 10px' }}>
        <div style={{ fontSize:20, fontWeight:800 }}>Panel 🛡️</div>
        <div style={{ fontSize:12, color:'var(--dark-muted)' }}>
          Control total del sistema NeuroAuds
        </div>
      </div>

      {/* Estadísticas globales */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { val:'47', lbl:'Usuarios',     color:'#58A6FF' },
          { val:'23', lbl:'Pacientes',    color:'#8B5CF6' },
          { val:'12', lbl:'Cuidadores',   color:'#2EA043' },
          { val:'4',  lbl:'Docentes',     color:'#F59E0B' },
        ].map(s => (
          <div key={s.lbl} className="dark-stat">
            <div className="val" style={{ color:s.color }}>{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { icon:'👥', label:'Gestionar usuarios', tab:'usuarios', color:'#1F6FEB' },
          { icon:'⚙️', label:'Sistema',            tab:'sistema',  color:'#F85149' },
        ].map(a => (
          <button key={a.label} onClick={() => onNav(a.tab)}
            className="dark-card"
            style={{ display:'flex', flexDirection:'column', alignItems:'center',
              gap:8, padding:'16px', cursor:'pointer', border:`1px solid ${a.color}22`,
              background:'var(--dark-card)', fontFamily:"'Nunito',sans-serif",
              color:'var(--dark-text)', textAlign:'center', width:'100%' }}>
            <span style={{ fontSize:28 }}>{a.icon}</span>
            <span style={{ fontSize:12, fontWeight:700 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Gráficas */}
      <div className="dark-card">
        <div className="dark-card-title">Logins esta semana</div>
        <BarChart labels={DAYS} data={[12,18,15,22,19,8,5]} color="#1F6FEB" height={70}/>
      </div>

      <div className="dark-card">
        <div className="dark-card-title">Usuarios activos diarios</div>
        <LineChart labels={DAYS} data={[28,35,30,42,38,20,15]} color="#F85149" height={70}/>
      </div>

      {/* Logs recientes */}
      <div className="dark-card">
        <div className="dark-card-title">Logs Recientes</div>
        {LOGS.map((l, i) => (
          <div key={i} className={`dark-log dark-log-${l.tipo==='ok'?'ok':l.tipo==='warn'?'warn':'err'}`}>
            <span style={{ fontSize:10, fontWeight:700, fontFamily:'monospace', flexShrink:0,
              color: l.tipo==='ok'?'#2EA043':l.tipo==='warn'?'#F59E0B':'#F85149' }}>
              [{l.tipo==='ok'?'OK':l.tipo==='warn'?'WARN':'ERR'}]
            </span>
            <span style={{ fontSize:11, color:'var(--dark-text)' }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
