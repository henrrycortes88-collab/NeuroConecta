import React from 'react';
import { BarChart, DonutChart, LineChart } from '../../components/Charts';

export default function DirectivoStats() {
  return (
    <>
      {/* HOME MENU — 3 stats */}
      <div className="dark-card">
        <div className="dark-card-title">Home Menu</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div className="dark-stat">
            <div className="val" style={{ color:'#2EA043' }}>68</div>
            <div className="lbl">Alumnos</div>
          </div>
          <div className="dark-stat">
            <div className="val" style={{ color:'#58A6FF' }}>14</div>
            <div className="lbl">Docentes</div>
          </div>
          <div className="dark-stat">
            <div className="val" style={{ color:'#F85149' }}>3</div>
            <div className="lbl">Alertas</div>
          </div>
        </div>
      </div>

      {/* IMPACTO INSTITUCIONAL */}
      <div className="dark-card">
        <div className="dark-card-title">Impacto Institucional</div>

        {/* Distribución por Nivel TEA */}
        <div style={{ fontSize:12, fontWeight:700, color:'var(--dark-text)', marginBottom:8 }}>
          Distribución por Nivel TEA
        </div>
        <DonutChart
          labels={['Nivel 1', 'Nivel 2', 'Nivel 3']}
          data={[45, 30, 25]}
          colors={['#2EA043', '#1F6FEB', '#8B5CF6']}
          height={130}
        />
        <div style={{ display:'flex', gap:14, justifyContent:'center', marginTop:8 }}>
          {[
            { color:'#2EA043', label:'Nivel 1: 45%' },
            { color:'#1F6FEB', label:'Nivel 2: 30%' },
            { color:'#8B5CF6', label:'Nivel 3: 25%' },
          ].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--dark-muted)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:l.color }}/>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Actividades completadas */}
      <div className="dark-card">
        <div className="dark-card-title">Actividades Completadas</div>
        <div style={{ fontSize:12, color:'var(--dark-muted)', marginBottom:8 }}>
          75% de la meta semanal
        </div>
        <div className="dark-progress-bar">
          <div className="dark-progress-fill"
            style={{ width:'75%', background:'var(--dark-green)' }}/>
        </div>
        <BarChart
          labels={['L','M','Mi','J','V','S','D']}
          data={[12,18,15,22,19,8,5]}
          color="#2EA043"
          height={80}
        />
      </div>

      {/* Tendencia mensual */}
      <div className="dark-card">
        <div className="dark-card-title">Tendencia mensual</div>
        <LineChart
          labels={['Ene','Feb','Mar','Abr','May','Jun']}
          data={[58,62,65,68,71,68]}
          color="#1F6FEB"
          height={80}
        />
      </div>
    </>
  );
}
