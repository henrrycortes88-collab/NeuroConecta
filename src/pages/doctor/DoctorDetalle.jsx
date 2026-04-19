import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart, LineChart, HBarChart } from '../../components/Charts';

const DAYS  = ['L','M','Mi','J','V','S','D'];
const WEEKS = ['S1','S2','S3','S4'];

const SECTIONS = [
  { id:'sueno',       icon:'😴', label:'Sueño'        },
  { id:'animo',       icon:'😊', label:'Ánimo'         },
  { id:'crisis',      icon:'⚡', label:'Crisis'        },
  { id:'pictogramas', icon:'🖼️', label:'Pictogramas'  },
  { id:'tareas',      icon:'✅', label:'Tareas'        },
  { id:'alimentos',   icon:'🍎', label:'Alimentos'     },
  { id:'higiene',     icon:'🪥', label:'Higiene'       },
];

export default function DoctorDetalle({ patient, onBack }) {
  const [section, setSection] = useState('sueno');
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (!patient) return;
    const q = query(
      collection(db, 'states'),
      where('patientId', '==', patient.id),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsub = onSnapshot(q, (snap) => {
      setStates(snap.docs.map(d => d.data()));
    });
    return unsub;
  }, [patient]);

  if (!patient) return null;

  // Derive charts from firebase states (simplification for demo)
  const sleepDocs = states.filter(s => s.type === 'sleep_log');
  const recentSleep = sleepDocs.length > 0 ? sleepDocs[0].sleepHours : 7.2;

  return (
    <>
      <div className="row-between" style={{ marginBottom:10 }}>
        <button className="back-btn" onClick={onBack}>← Pacientes</button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="avatar" style={{ background:patient.avatarBg, color:patient.avatarColor, fontSize:13, width:32, height:32 }}>
            {patient.initials}
          </div>
          <span style={{ fontWeight:700, fontSize:14 }}>{patient.name}</span>
        </div>
      </div>

      <div className="chips-row">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`section-chip ${section===s.id ? 'active' : ''}`}
            onClick={() => setSection(s.id)}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {section === 'sueno' && (
        <>
          <div className="card">
            <div className="card-title">Horas de sueño — 7 días</div>
            <BarChart labels={DAYS} data={[8.5,7,6.2,7.8,5,6.5,recentSleep]} color="#4A9FFF" height={85} />
            <div className="grid-3" style={{ marginTop:10 }}>
              {[{val:'7.2h',lbl:'Promedio',color:'var(--blue)'},{val:'8.5h',lbl:'Máximo',color:'var(--green)'},{val:'5.0h',lbl:'Mínimo',color:'var(--amber)'}].map(s=>(
                <div key={s.lbl} style={{textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:'var(--muted)'}}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Tendencia mensual (semanas)</div>
            <LineChart labels={WEEKS} data={[6.8,7.1,7.4,7.2]} color="#2DCFB3" height={70} />
          </div>
        </>
      )}

      {section === 'animo' && (
        <>
          <div className="card">
            <div className="card-title">Registro de ánimo — 7 días (1–5)</div>
            <LineChart labels={DAYS} data={[4,3,4,5,3,4,5]} color="#7C6FE0" height={85} />
          </div>
          <div className="card">
            <div className="card-title">Distribución de estados</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'😄 Feliz',   pct:35, color:'var(--green)'  },
                { label:'😐 Normal',  pct:30, color:'var(--blue)'   },
                { label:'😢 Triste',  pct:20, color:'var(--purple)' },
                { label:'😡 Enojado', pct:8,  color:'var(--coral)'  },
                { label:'😰 Nervioso',pct:7,  color:'var(--amber)'  },
              ].map(m => (
                <div key={m.label}>
                  <div className="row-between" style={{marginBottom:3}}>
                    <span style={{fontSize:12}}>{m.label}</span>
                    <span style={{fontSize:11,color:m.color,fontWeight:700}}>{m.pct}%</span>
                  </div>
                  <div className="bar-wrap">
                    <div className="bar-fill" style={{width:`${m.pct}%`,background:m.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {section === 'crisis' && (
        <>
          <div className="card">
            <div className="card-title">Frecuencia de crisis (últimos 6 meses)</div>
            <BarChart labels={['Ene','Feb','Mar','Abr','May','Jun']} data={[2,1,3,1,0,1]} color="#FF6B8A" height={85} />
          </div>
        </>
      )}

      {section === 'pictogramas' && (
        <div className="card">
          <div className="card-title">Pictogramas más usados — semana</div>
          <HBarChart
            labels={['✅ Bien','🍽️ Hambre','😴 Dormir','🙋 Ayuda','😣 Dolor']}
            data={[30,24,18,8,12]}
            color="#2DCFB3"
            height={110}
          />
        </div>
      )}

      {section === 'tareas' && (
        <div className="card">
          <div className="card-title">Cumplimiento de tareas (%) — 7 días</div>
          <LineChart labels={DAYS} data={[90,85,100,80,75,95,88]} color="#5EE8A0" height={85} />
        </div>
      )}

      {section === 'alimentos' && (
        <div className="card">
          <div className="card-title">Calorías diarias (kcal)</div>
          <BarChart labels={DAYS} data={[1800,1950,1700,2100,1840,1900,1750]} color="#FFB347" height={85} />
        </div>
      )}

      {section === 'higiene' && (
        <div className="card">
          <div className="card-title">Registro de higiene — semana</div>
          {[
            { label:'🪥 Cepillado',       days:6, total:7, color:'var(--green)'  },
            { label:'🚿 Baño',             days:5, total:7, color:'var(--blue)'   },
            { label:'👗 Cambio de ropa',   days:7, total:7, color:'var(--teal)'   },
            { label:'💅 Aseo de manos',    days:7, total:7, color:'var(--purple)' },
            { label:'🛏️ Tender cama',      days:4, total:7, color:'var(--amber)'  },
          ].map(h => {
            const pct = Math.round((h.days/h.total)*100);
            return (
              <div key={h.label} style={{marginBottom:10}}>
                <div className="row-between" style={{marginBottom:3}}>
                  <span style={{fontSize:12}}>{h.label}</span>
                  <span style={{fontSize:11,color:h.color,fontWeight:700}}>{h.days}/{h.total} días</span>
                </div>
                <div className="bar-wrap">
                  <div className="bar-fill" style={{width:`${pct}%`,background:h.color}} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
