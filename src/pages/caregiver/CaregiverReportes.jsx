// src/pages/caregiver/CaregiverReportes.jsx
import React from 'react';
import { LineChart, BarChart } from '../../components/Charts';

const DAYS = ['L','M','Mi','J','V','S','D'];

export default function CaregiverReportes() {
  return (
    <>
      <div className="grid-2">
        {[
          { val:'92%', lbl:'Cumplimiento rutinas', color:'var(--green)'  },
          { val:'0',   lbl:'Crisis esta semana',    color:'var(--blue)'   },
          { val:'6.8h',lbl:'Sueño promedio',        color:'var(--purple)' },
          { val:'87%', lbl:'Medicación tomada',     color:'var(--amber)'  },
        ].map(s => (
          <div key={s.lbl} className="stat-mini">
            <div className="val" style={{ color:s.color }}>{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Estado de ánimo — 7 días</div>
        <LineChart labels={DAYS} data={[4,3,4,5,3,4,5]} color="#2DCFB3" height={80} />
      </div>

      <div className="card">
        <div className="card-title">Horas de sueño</div>
        <BarChart labels={DAYS} data={[8,6.5,7,7.5,5.5,7,8]} color="#4A9FFF" height={75} />
      </div>

      <div className="card">
        <div className="card-title">Cumplimiento de rutinas (%)</div>
        <BarChart labels={DAYS} data={[100,90,95,85,100,95,90]} color="#5EE8A0" height={75} />
      </div>

      <div className="card">
        <div className="card-title">Medicación tomada (%)</div>
        <BarChart labels={DAYS} data={[100,100,66,100,100,100,66]} color="#FFB347" height={75} />
      </div>
    </>
  );
}
