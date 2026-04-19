// DoctorCitas.jsx – Gestión de citas médicas y generación de recetas para el MÉDICO.
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db }         from '../../firebase';
import DoctorReceta   from './DoctorReceta'; // Componente de receta médica

export default function DoctorCitas() {
  const [citas, setCitas] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ patientId: '', day: '', hr: '', esp: '', notes: '' });
  const [view, setView] = useState('list'); // 'list' or 'recipe'
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  useEffect(() => {
    // Fetch patients
    const uq = query(collection(db, 'users'), where('role', '==', 'patient'));
    const uUnsub = onSnapshot(uq, snap => setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // Fetch appointments
    const cq = query(collection(db, 'appointments'));
    const cUnsub = onSnapshot(cq, snap => setCitas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { uUnsub(); cUnsub(); };
  }, []);

  const getPatient = (id) => patients.find(p => p.id === id) || { name: 'Paciente Desconocido', initials: '?' };

  const accept = async (id) => {
    try { await updateDoc(doc(db, 'appointments', id), { status: 'confirmed' }); }
    catch (e) { console.error(e); }
  };

  const reject = async (id) => {
    try { await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' }); }
    catch (e) { console.error(e); }
  };

  const createCita = async () => {
    if (!form.patientId) return alert('Selecciona un paciente');
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: form.patientId,
        day: form.day, hr: form.hr, esp: form.esp, notes: form.notes,
        dur: '30 min', doctor: 'Doctor', status: 'confirmed',
        createdAt: serverTimestamp()
      });
      setShowNew(false);
      setForm({ patientId: '', day: '', hr: '', esp: '', notes: '' });
      alert('Cita agendada.');
    } catch (e) { console.error(e); }
  };

  const handlePrescription = (pId, pName) => {
    setSelectedPatientId(pId);
    setSelectedPatientName(pName);
    setView('recipe');
  };

  if (view === 'recipe') {
    return <DoctorReceta 
      patientId={selectedPatientId} 
      patientName={selectedPatientName} 
      onBack={() => setView('list')} 
    />;
  }

  const requests = citas.filter(c => c.status === 'pending');
  const confirmed = citas.filter(c => c.status === 'confirmed');

  return (
    <>
      <div className="row-between" style={{ marginBottom: 14 }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>📅 Gestión de citas</span>
        <button onClick={() => setShowNew(s => !s)} style={{
          background: 'var(--blue)', color: 'white', border: 'none',
          borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 12,
          cursor: 'pointer', fontFamily: "'Nunito',sans-serif"
        }}>+ Agendar</button>
      </div>

      {showNew && (
        <div className="card" style={{ border: '1px solid var(--blue)', marginBottom: 4 }}>
          <div className="card-title">Agendar nueva cita</div>
          <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
            fontFamily: "'Nunito',sans-serif", marginBottom: 8, outline: 'none'
          }}>
            <option value="">Seleccionar paciente</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Fecha" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', marginBottom: 8 }} />
          <input placeholder="Hora" value={form.hr} onChange={e => setForm({ ...form, hr: e.target.value })} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', marginBottom: 8 }} />
          <input placeholder="Especialidad" value={form.esp} onChange={e => setForm({ ...form, esp: e.target.value })} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', marginBottom: 8 }} />
          <button onClick={createCita}
            style={{
              background: 'var(--blue)', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', width: '100%'
            }}>
            Confirmar cita
          </button>
        </div>
      )}

      {requests.length > 0 && (
        <>
          <div className="card-title" style={{ color: 'var(--coral)' }}>
            🔔 Solicitudes pendientes ({requests.length})
          </div>
          {requests.map(r => {
            const p = getPatient(r.patientId);
            return (
              <div key={r.id} className="alert-item" style={{ alignItems: 'center' }}>
                <div className="avatar" style={{ background: 'rgba(124,111,224,.2)', color: 'var(--purple)', fontSize: 12, width: 36, height: 36 }}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.hr} · {r.day} · {r.esp}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => accept(r.id)} style={{
                    background: 'rgba(94,232,160,.15)', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11
                  }}>✓ Aceptar</button>
                  <button onClick={() => reject(r.id)} style={{
                    background: 'rgba(255,107,138,.15)', border: '1px solid var(--coral)', color: 'var(--coral)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11
                  }}>✕ Rechazar</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="card-title" style={{ marginTop: 8 }}>✅ Citas confirmadas ({confirmed.length})</div>
      {confirmed.map(c => {
        const p = getPatient(c.patientId);
        return (
          <div key={c.id} className="appointment-item" style={{ padding: '12px 0' }}>
            <div className="appt-time">
              <div className="hr">{c.hr}</div>
              <div className="ampm">{c.day}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.esp} · {c.dur}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handlePrescription(c.patientId, p.name)} style={{
                background: 'rgba(124,111,224,.1)', border: '1px solid var(--purple)', color: 'var(--purple)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700
              }}>➕ Receta</button>
              <button onClick={() => reject(c.id)} style={{
                background: 'rgba(255,107,138,.1)', border: '1px solid var(--coral)', color: 'var(--coral)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11
              }}>Cancelar</button>
            </div>
          </div>
        );
      })}

      {confirmed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 36 }}>📭</div>
          <div style={{ marginTop: 8 }}>Sin citas programadas</div>
        </div>
      )}
    </>
  );
}
