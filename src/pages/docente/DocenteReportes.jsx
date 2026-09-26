import React from 'react';
import { BarChart, LineChart, MultiBarChart } from '../../components/Charts';

const DAYS = ['L','M','Mi','J','V'];

export default function DocenteReportes() {
  return (
    <>
      <div className="dark-card-title" style={{ paddingLeft:4 }}>
        Resumen de actividades
      </div>

      {/* Stats mini */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { val:'75%', lbl:'Lectura guiada',    color:'#2EA043', extra:'Alta participación'  },
          { val:'53%', lbl:'Juego de memoria',  color:'#F59E0B', extra:'Participación media' },
          { val:'100%',lbl:'Pictogramas',        color:'#1F6FEB', extra:'Excelente'           },
        ].map(s => (
          <div key={s.lbl} className="dark-stat" style={{ textAlign:'left', padding:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>📚</span>
              <div>
                <div style={{ fontWeight:700, fontSize:12 }}>{s.lbl}</div>
                <div style={{ fontSize:10, color:'var(--dark-muted)' }}>Alumnos: 5</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:4 }}>
              Completaron: {Math.round(5 * parseInt(s.val)/100)} · Progreso: {s.val}
            </div>
            <div className="dark-progress-bar">
              <div className="dark-progress-fill"
                style={{ width:s.val, background:s.color }}/>
            </div>
            <span className={`dark-badge ${s.color==='#2EA043'?'dark-badge-green':s.color==='#F59E0B'?'dark-badge-amber':'dark-badge-blue'}`}
              style={{ marginTop:6, display:'inline-block' }}>
              {s.extra}
            </span>
          </div>
        ))}
      </div>

      {/* Participación semanal */}
      <div className="dark-card">
        <div className="dark-card-title">Participación semanal</div>
        <LineChart labels={DAYS} data={[72,78,74,80,76]} color="#2EA043" height={75}/>
      </div>

      {/* Ánimo del grupo */}
      <div className="dark-card">
        <div className="dark-card-title">Ánimo del grupo — esta semana</div>
        <MultiBarChart
          labels={DAYS}
          datasets={[
            { label:'Juan',  data:[4,4,5,4,4], backgroundColor:'#2EA04366', borderColor:'#2EA043', borderWidth:1.5, borderRadius:3 },
            { label:'Ana',   data:[3,3,3,4,3], backgroundColor:'#1F6FEB66', borderColor:'#1F6FEB', borderWidth:1.5, borderRadius:3 },
            { label:'Luis',  data:[2,2,3,2,3], backgroundColor:'#8B5CF666', borderColor:'#8B5CF6', borderWidth:1.5, borderRadius:3 },
          ]}
          height={100}
        />
      </div>

      {/* Actividades por categoría */}
      <div className="dark-card">
        <div className="dark-card-title">Actividades completadas por categoría</div>
        <BarChart
          labels={['Cognitiva','Comunicación','Motora','Social']}
          data={[85,70,90,75]}
          color="#1F6FEB"
          height={75}
        />
      </div>
    </>
  );
}
