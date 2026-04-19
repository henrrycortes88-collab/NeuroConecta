// src/pages/caregiver/CaregiverRutinas.jsx
import React, { useState } from 'react';

const TASKS = [
  { time:'07:00', label:'Despertar y aseo',   icon:'☀️', done:true  },
  { time:'08:00', label:'Medicación matutina', icon:'💊', done:true  },
  { time:'08:30', label:'Desayuno',            icon:'🍳', done:true  },
  { time:'10:00', label:'Ejercicios',          icon:'🏃', done:true  },
  { time:'12:30', label:'Almuerzo',            icon:'🍽️', done:true  },
  { time:'14:00', label:'Medicación tarde',    icon:'💊', done:false },
  { time:'16:00', label:'Juegos cognitivos',   icon:'🎮', done:false },
  { time:'19:00', label:'Cena',                icon:'🥗', done:false },
  { time:'21:00', label:'Medicación noche',    icon:'💊', done:false },
  { time:'22:00', label:'Higiene nocturna',    icon:'🪥', done:false },
];

export default function CaregiverRutinas() {
  const [tasks, setTasks] = useState(TASKS);
  const toggle = idx => setTasks(t => t.map((x,i) => i===idx ? {...x, done:!x.done} : x));

  return (
    <div className="card">
      <div className="card-title">Rutina de hoy — Sofía</div>
      {tasks.map((t,i) => (
        <div key={i} className={t.done ? 'ok-item' : 'alert-item'}
          style={{ cursor:'pointer' }} onClick={() => toggle(i)}>
          <span style={{ fontSize:18 }}>{t.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>{t.time} — {t.label}</div>
            <div style={{ fontSize:11, color: t.done ? 'var(--green)' : 'var(--coral)' }}>
              {t.done ? '✅ Completado' : '⏳ Pendiente'}
            </div>
          </div>
          <span style={{ fontSize:18 }}>{t.done ? '✓' : '○'}</span>
        </div>
      ))}
    </div>
  );
}
