/**
 * CaregiverComunica.jsx - NeuroConecta
 * -----------------------------------------------
 * Pantalla de MENSAJES del CUIDADOR.
 *
 * Funcionalidad:
 *  - Muestra el chat en tiempo real con el paciente usando ChatRoom.
 *  - Escucha `chats/{patientUid}/messages` donde el paciente escribe
 *    sus mensajes AAC (pictogramas) con el flag `isAac: true`.
 *  - Si hay más de un paciente vinculado, muestra un selector de paciente.
 *  - El cuidador puede enviar mensajes rápidos predefinidos al paciente.
 *  - Los mensajes rápidos se guardan en `chats/{patientUid}/messages`
 *    con senderRole: 'caregiver'.
 *
 * Colección Firestore: chats/{patientId}/messages
 */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import ChatRoom from '../../components/ChatRoom';

const QUICK = [
  { emoji:'🚶‍♀️', label:'Ya vengo',  msg:'Ya vengo 😊'              },
  { emoji:'🍽️',  label:'Comer',     msg:'Es hora de comer 🍽️'      },
  { emoji:'💊',  label:'Medicina',  msg:'Hora del medicamento 💊'   },
  { emoji:'😴',  label:'Dormir',    msg:'Es hora de descansar 😴'   },
  { emoji:'🛁',  label:'Baño',      msg:'Hora de bañarse 🛁'        },
  { emoji:'❤️',  label:'Te quiero', msg:'Te quiero mucho ❤️'        },
];

export default function CaregiverComunica() {
  const { user, userData } = useAuth();
  const [activePatientId, setActivePatientId] = useState(null);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (!userData?.linkedPatients || userData.linkedPatients.length === 0) return;

    // Buscar los detalles de los pacientes vinculados
    const q = query(collection(db, 'users'), where('uid', 'in', userData.linkedPatients));
    const unsub = onSnapshot(q, (snap) => {
      const p = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPatients(p);
      if (p.length > 0 && !activePatientId) {
        setActivePatientId(p[0].id);
      }
    });
    return unsub;
  }, [userData?.linkedPatients, activePatientId]);

  const sendQuick = async (msgText) => {
    if (!activePatientId) return;
    try {
      await addDoc(collection(db, 'chats', activePatientId, 'messages'), {
        text: `[Rápido]: ${msgText}`,
        senderId: user.uid,
        senderName: user.displayName || 'Cuidador',
        senderRole: 'caregiver',
        createdAt: serverTimestamp()
      });
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display:'flex', flexDirection:'column', gap:15 }}>
      {patients.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:10 }}>
          {patients.map(p => (
            <button 
              key={p.id} 
              onClick={() => setActivePatientId(p.id)}
              style={{
                background: activePatientId === p.id ? 'var(--purple)' : 'var(--surface)',
                color: activePatientId === p.id ? 'white' : 'var(--text)',
                border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
              👤 {p.name}
            </button>
          ))}
        </div>
      )}

      {activePatientId ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:15 }}>
          <div style={{ flex:1 }}>
            <ChatRoom chatId={activePatientId} roomName={`Chat con ${patients.find(p => p.id === activePatientId)?.name || 'Paciente'}`} />
          </div>

          <div className="card">
            <div className="card-title" style={{ fontSize:14 }}>Mensajes rápidos</div>
            <div className="grid-3" style={{ gap:8 }}>
              {QUICK.map(q => (
                <button key={q.label} className="big-btn"
                  style={{ background:'rgba(45,207,179,.08)', border:'1px solid var(--border)', height:80 }}
                  onClick={() => sendQuick(q.msg)}>
                  <span className="em3d" style={{ fontSize:24 }}>{q.emoji}</span>
                  <span style={{ fontSize:10 }}>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding:40, textAlign:'center', color:'var(--muted)' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
          No tienes pacientes vinculados todavía.
        </div>
      )}
    </div>
  );
}
