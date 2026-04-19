import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const MOODS = [
  { emoji:'😄', label:'Feliz'      },
  { emoji:'🙂', label:'Bien'       },
  { emoji:'🤩', label:'Genial'     },
  { emoji:'😌', label:'Tranquilo'  },
  { emoji:'😐', label:'Normal'     },
  { emoji:'😑', label:'Aburrido'   },
  { emoji:'🥱', label:'Cansado'    },
  { emoji:'😴', label:'Con sueño'  },
  { emoji:'😢', label:'Triste'     },
  { emoji:'😟', label:'Preocupado' },
  { emoji:'😰', label:'Nervioso'   },
  { emoji:'😱', label:'Asustado'   },
  { emoji:'😡', label:'Enojado'    },
  { emoji:'😫', label:'Frustrado'  },
  { emoji:'😋', label:'Hambre'     }
];

const ACTIONS = [
  { icon:'💬', label:'Comunicar',  tab:'comunicacion', bg:'rgba(124,111,224,.15)', border:'rgba(124,111,224,.3)' },
  { icon:'🏃', label:'Ejercicios', tab:'ejercicios',   bg:'rgba(45,207,179,.15)',  border:'rgba(45,207,179,.3)'  },
  { icon:'🎮', label:'Juegos',     tab:'juegos',       bg:'rgba(255,179,71,.15)',  border:'rgba(255,179,71,.3)'  },
  { icon:'🌟', label:'Mi Estado',  tab:'estado',       bg:'rgba(94,232,160,.15)',  border:'rgba(94,232,160,.3)'  },
];

export default function PatientHome({ name, onNav }) {
  const { user } = useAuth();
  const [mood, setMood] = useState(null);
  const [showAllMoods, setShowAllMoods] = useState(false);
  const [tasks] = useState({
    medsUrl: 66,
    exerciseUrl: 50,
    gamesUrl: 100
  });

  const saveMood = async (selectedMood) => {
    setMood(selectedMood.label);
    try {
      await addDoc(collection(db, 'states'), {
        patientId: user.uid,
        patientName: user.displayName,
        mood: selectedMood.label,
        emoji: selectedMood.emoji,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendSOS = async () => {
    try {
      
      await addDoc(collection(db, 'alerts'), {
        patientId: user.uid,
        patientName: user.displayName || 'Paciente',
        type: 'sos',
        message: '¡EMERGENCIA! El paciente ha activado el botón de pánico.',
        createdAt: serverTimestamp(),
        targetDoctorId: user.doctorUid || null, // Del userData si está disponible
        viewedBy: []
      });
      alert('🚨 EMERGENCIA\nAlertando a cuidadores y médico...\nContacto de emergencia notificado.');
    } catch(e) {
      console.error(e);
      alert('Error enviando la alerta');
    }
  };

  return (
    <>
      <div style={{ padding:'4px 0 10px' }}>
        <div style={{ fontSize:22, fontWeight:800 }}>¡Hola, {name}! <span className="emoji-anim">👋</span></div>
        <div style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>¿Cómo te sientes hoy?</div>
      </div>

      <div className="card">
        <div className="card-title">Estado de Ánimo</div>
        <div className="mood-row">
          {(showAllMoods ? MOODS : MOODS.slice(0, 5)).map(m => (
            <div key={m.label} className={`mood-item ${mood===m.label?'selected':''}`}
              onClick={() => saveMood(m)}>
              <span className="em3d">{m.emoji}</span>
              <span>{m.label}</span>
            </div>
          ))}
          {!showAllMoods ? (
            <div className="mood-item" onClick={() => setShowAllMoods(true)} style={{ background:'rgba(124,111,224,.1)', border:'1px dashed var(--purple)' }}>
              <span className="em3d" style={{ fontSize:28 }}>➕</span>
              <span style={{ fontWeight:700, color:'var(--purple)' }}>Más</span>
            </div>
          ) : (
            <div className="mood-item" onClick={() => setShowAllMoods(false)} style={{ background:'rgba(255,107,138,.1)', border:'1px dashed var(--coral)' }}>
              <span className="em3d" style={{ fontSize:28 }}>➖</span>
              <span style={{ fontWeight:700, color:'var(--coral)' }}>Menos</span>
            </div>
          )}
        </div>
        {mood && <p style={{ fontSize:12, color:'var(--teal)', textAlign:'center', marginTop:8 }}>
          Estado registrado: {mood} ✓
        </p>}
      </div>

      <div className="grid-2">
        {ACTIONS.map(a => (
          <button key={a.tab} className="big-btn"
            style={{ background:a.bg, border:`1px solid ${a.border}` }}
            onClick={() => onNav(a.tab)}>
            <span className="em3d">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      <button className="sos-btn" onClick={sendSOS}>
        <span className="emoji-anim" style={{ fontSize:42 }}>🆘</span>
        <div>
          <div style={{ fontSize:20, fontWeight:800 }}>EMERGENCIA</div>
          <div style={{ fontSize:12, opacity:.8 }}>Toca para pedir ayuda inmediata</div>
        </div>
      </button>

      <div className="card">
        <div className="card-title">Mi progreso de hoy</div>
        {[
          { label:<><span className="emoji-anim">💊</span> Medicamentos</>, pct:tasks.medsUrl, color:'var(--green)'  },
          { label:<><span className="emoji-anim">🏃</span> Ejercicio</>,    pct:tasks.exerciseUrl, color:'var(--teal)'   },
          { label:<><span className="emoji-anim">🎮</span> Juegos</>,       pct:tasks.gamesUrl, color:'var(--purple)' },
        ].map(p => (
          <div key={p.label} style={{ marginBottom:10 }}>
            <div className="row-between" style={{ marginBottom:4 }}>
              <span style={{ fontSize:13 }}>{p.label}</span>
              <span style={{ fontSize:12, color:p.color, fontWeight:700 }}>{p.pct}%</span>
            </div>
            <div className="bar-wrap">
              <div className="bar-fill" style={{ width:`${p.pct}%`, background:p.color }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
