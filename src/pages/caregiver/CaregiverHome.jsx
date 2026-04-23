import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function CaregiverHome() {
  useAuth();
  const [messages, setMessages] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    const qMsg = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(3));
    const uMsg = onSnapshot(qMsg, (snap) => setMessages(snap.docs.map(d=>d.data())));
    
    const qState = query(collection(db, 'states'), orderBy('createdAt', 'desc'), limit(1));
    const uState = onSnapshot(qState, (snap) => setStates(snap.docs.map(d=>d.data())));

    return () => { uMsg(); uState(); };
  }, []);

  const latestState = states[0] || {};
  const currentSleep = latestState.sleepHours || 7.2;

  return (
    <>
      <div className="patient-card">
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
          <div className="avatar" style={{ background:'rgba(124,111,224,.3)', color:'var(--purple)', fontSize:22 }}>😊</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>Todos los Pacientes</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>Monitor General</div>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <span style={{ background:'rgba(94,232,160,.2)', color:'var(--green)',
              padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}><span className="emoji-anim">✅</span> Estable</span>
          </div>
        </div>
        <div className="grid-3">
          {[
            { val:`${currentSleep}h`, lbl:'Sueño rec.', color:'var(--green)' },
            { val:'82%',  lbl:'Medicación', color:'var(--blue)' },
            { val:'4/5',  lbl:'Tareas', color:'var(--amber)' },
          ].map(s => (
            <div key={s.lbl} style={{ textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10, color:'var(--muted)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Mensajes recientes</div>
        {messages.map((m, i) => (
          <div key={i} className="ok-item">
            <span className="emoji-anim" style={{ fontSize: 20 }}>{m.emoji || '💬'}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{m.senderName}: {m.text}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>
                {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Próxima actividad</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'rgba(74,159,255,.15)', borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--blue)' }}>14:00</div>
            <div style={{ fontSize:10, color:'var(--muted)' }}>Hoy</div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}><span className="emoji-anim">💊</span> Medicación</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>Recordatorio activo</div>
          </div>
        </div>
      </div>
    </>
  );
}
