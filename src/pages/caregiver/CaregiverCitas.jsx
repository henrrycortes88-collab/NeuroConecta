import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const STATUS = {
  confirmed: { label:'Confirmada', color:'var(--green)',  bg:'rgba(94,232,160,.2)'  },
  pending:   { label:'Pendiente',  color:'var(--amber)',  bg:'rgba(255,179,71,.2)'  },
  cancelled: { label:'Cancelada',  color:'var(--coral)',  bg:'rgba(255,107,138,.2)' },
};

export default function CaregiverCitas() {
  const [citas, setCitas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ esp: '', doc: '', day: '', hr: '' });

  useEffect(() => {
    const q = query(collection(db, 'appointments'));
    const unsub = onSnapshot(q, (snap) => {
      setCitas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const cancel = async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    } catch(e) {
      console.error(e);
    }
  };

  const createCita = async () => {
    if (!form.esp || !form.doc || !form.day) return;
    try {
      await addDoc(collection(db, 'appointments'), {
        esp: form.esp, doctor: form.doc, day: form.day, hr: form.hr || 'TBD',
        dur: '30 min',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setForm({esp:'',doc:'',day:'',hr:''});
    } catch(e) {
      console.error(e);
      alert('Error creando cita');
    }
  };

  return (
    <>
      <div className="row-between" style={{ marginBottom:12 }}>
        <span style={{ fontWeight:700, fontSize:15 }}>📅 Citas programadas</span>
        <button onClick={() => setShowForm(f=>!f)} style={{
          background:'var(--teal)', color:'#0B0F1A', border:'none',
          borderRadius:8, padding:'6px 14px', fontWeight:700, fontSize:12,
          cursor:'pointer', fontFamily:"'Nunito',sans-serif"
        }}>+ Nueva</button>
      </div>

      {showForm && (
        <div className="card" style={{ border:'1px solid var(--teal)', marginBottom:4 }}>
          <div className="card-title">Solicitar nueva cita</div>
          <input placeholder="Especialidad" value={form.esp} onChange={e=>setForm({...form, esp:e.target.value})} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', marginBottom:8, outline:'none' }} />
          <input placeholder="Médico" value={form.doc} onChange={e=>setForm({...form, doc:e.target.value})} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', marginBottom:8, outline:'none' }} />
          <input placeholder="Fecha" value={form.day} onChange={e=>setForm({...form, day:e.target.value})} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', marginBottom:8, outline:'none' }} />
          <input placeholder="Hora (ej. 10:00)" value={form.hr} onChange={e=>setForm({...form, hr:e.target.value})} style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', marginBottom:8, outline:'none' }} />
          <button onClick={createCita}
            style={{ background:'var(--teal)', color:'#0B0F1A', border:'none',
              borderRadius:8, padding:'10px 20px', fontWeight:700, fontSize:13,
              cursor:'pointer', width:'100%' }}>
            Enviar solicitud
          </button>
        </div>
      )}

      {citas.length === 0 && <div style={{ fontSize:13, color:'var(--muted)' }}>No hay citas.</div>}

      {citas.map((c) => {
        const s = STATUS[c.status] || STATUS.pending;
        return (
          <div key={c.id} className="appointment-item">
            <div className="appt-time">
              <div className="hr">{c.hr}</div>
              <div className="ampm">{c.day}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{c.doctor}</div>
              <div style={{ fontSize:12, color:'var(--muted)' }}>{c.esp} · {c.dur}</div>
              <span className="tag" style={{ background:s.bg, color:s.color, marginTop:4 }}>{s.label}</span>
            </div>
            {c.status !== 'cancelled' && (
              <button onClick={() => cancel(c.id)} style={{
                background:'rgba(255,107,138,.1)', border:'1px solid var(--coral)',
                color:'var(--coral)', borderRadius:8, padding:'5px 10px',
                cursor:'pointer', fontSize:11, fontFamily:"'Nunito',sans-serif"
              }}>Cancelar</button>
            )}
          </div>
        );
      })}
    </>
  );
}
