/**
 * DoctorReceta.jsx - NeuroConecta
 * -----------------------------------------------
 * Sistema de generación y gestión de RECETAS MÉDICAS para el rol MÉDICO.
 *
 * Funcionalidad:
 *  - El médico puede crear recetas con múltiples medicamentos (nombre,
 *    dosis, frecuencia) e indicaciones adicionales.
 *  - Selecciona a cuál cuidador vinculado enviar la receta.
 *  - La receta se guarda en Firestore en la colección 'prescriptions'
 *    con los campos: patientId, patientName, doctorId, doctorName,
 *    caregiverId, meds (array), notes, createdAt, status.
 *  - El cuidador recibe la receta en tiempo real en su pestaña "Recetas".
 *  - El médico puede imprimir cualquier receta del historial como PDF
 *    usando @media print y window.print().
 *
 * Props recibidas desde DoctorCitas:
 *  @param {string}   patientId   - UID del paciente
 *  @param {string}   patientName - Nombre del paciente
 *  @param {function} onBack      - Callback para regresar al listado de citas
 *
 * Colección Firestore: prescriptions/
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function DoctorReceta({ patientId, onBack, patientName }) {
  const { user } = useAuth();
  const [meds, setMeds] = useState([{ name: '', dose: '', freq: '' }]);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [caregiverId, setCaregiverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    // Fetch Prescription History
    const qHist = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      where('doctorId', '==', user.uid)
    );
    const unsubHist = onSnapshot(qHist, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    // Fetch Linked Caregivers
    const qCare = query(collection(db, 'users'), where('role', '==', 'caregiver'), where('linkedPatients', 'array-contains', patientId));
    const unsubCare = onSnapshot(qCare, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCaregivers(list);
      if (list.length > 0) setCaregiverId(list[0].id);
    });

    return () => { unsubHist(); unsubCare(); };
  }, [patientId, user.uid]);

  const addMed = () => setMeds([...meds, { name: '', dose: '', freq: '' }]);
  const removeMed = (idx) => setMeds(meds.filter((_, i) => i !== idx));
  const updateMed = (idx, field, val) => {
    const newMeds = [...meds];
    newMeds[idx][field] = val;
    setMeds(newMeds);
  };

  const saveReceta = async () => {
    if (meds.some(m => !m.name)) return alert('Completa al menos el nombre del medicamento');
    if (!caregiverId) return alert('No hay cuidadores vinculados para recibir la receta');
    
    setLoading(true);
    try {
      const recipeData = {
        patientId,
        patientName: patientName || 'Paciente',
        doctorId: user.uid,
        doctorName: user.displayName || 'Médico',
        caregiverId,
        meds,
        notes,
        createdAt: serverTimestamp(),
        status: 'sent'
      };

      console.log('Intentando guardar receta:', recipeData);
      
      await addDoc(collection(db, 'prescriptions'), recipeData);
      setMeds([{ name: '', dose: '', freq: '' }]);
      setNotes('');
      alert('Receta guardada y enviada al cuidador.');
    } catch (e) {
      console.error('ERROR DETALLADO AL GUARDAR RECETA:', e);
      alert(`Error al guardar la receta: ${e.message || 'Error desconocido'}`);
    }
    setLoading(false);
  };

  const handlePrint = (receta) => {
    setSelectedReceta(receta);
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 500);
  };

  if (showPrint && selectedReceta) {
    return (
      <div className="print-only" style={{ padding: '40px', color: 'black', background: 'white', minHeight: '100vh' }}>
        <div style={{ borderBottom: '2px solid black', paddingBottom: 20, marginBottom: 20, textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>NeuroConecta</h1>
          <p style={{ margin: 5 }}>Atención Neurológica Integral</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <strong>MÉDICO:</strong> {selectedReceta.doctorName}<br/>
            <strong>PACIENTE:</strong> {selectedReceta.patientName}
          </div>
          <div>
            <strong>FECHA:</strong> {new Date(selectedReceta.createdAt?.seconds * 1000).toLocaleDateString()}
          </div>
        </div>
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 5 }}>PRESCRIPCIÓN</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid black' }}>
                <th style={{ padding: 5 }}>Medicamento</th>
                <th style={{ padding: 5 }}>Dosis</th>
                <th style={{ padding: 5 }}>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {selectedReceta.meds.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 5 }}>{m.name}</td>
                  <td style={{ padding: 5 }}>{m.dose}</td>
                  <td style={{ padding: 5 }}>{m.freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedReceta.notes && (
          <div style={{ marginBottom: 40 }}>
            <strong>INDICACIONES ADICIONALES:</strong>
            <p style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>{selectedReceta.notes}</p>
          </div>
        )}
        <div style={{ marginTop: 100, textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid black', width: 250, margin: '0 auto', paddingTop: 10 }}>
            Firma del Médico
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="row-between" style={{ marginBottom: 20 }}>
        <button onClick={onBack} className="back-btn">← Volver</button>
        <span style={{ fontWeight: 800 }}>Receta para {patientName}</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nueva Receta</div>
        
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Enviar a Cuidador:</label>
          {caregivers.length > 0 ? (
            <select value={caregiverId} onChange={e => setCaregiverId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}>
              {caregivers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--coral)', padding: '10px', background: 'rgba(255,107,138,.1)', borderRadius: 8 }}>
              ⚠️ No se encontraron cuidadores vinculados a este paciente.
            </div>
          )}
        </div>

        {meds.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Medicamento</label>
              <input value={m.name} onChange={e => updateMed(idx, 'name', e.target.value)} placeholder="Ej: Paracetamol" style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Dosis</label>
              <input value={m.dose} onChange={e => updateMed(idx, 'dose', e.target.value)} placeholder="500mg" style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Frecuencia</label>
              <input value={m.freq} onChange={e => updateMed(idx, 'freq', e.target.value)} placeholder="Cada 8h" style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            {meds.length > 1 && (
              <button onClick={() => removeMed(idx)} style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 18 }}>×</button>
            )}
          </div>
        ))}
        <button onClick={addMed} style={{ background: 'none', border: `1px dashed var(--blue)`, color: 'var(--blue)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 15 }}>+ Añadir Medicamento</button>
        
        <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Indicaciones Adicionales</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', marginBottom: 15, fontFamily: 'inherit' }} placeholder="Reposo, dieta, etc..." />

        <button onClick={saveReceta} disabled={loading} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 800, width: '100%', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar y Enviar al Cuidador'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Historial de Recetas</div>
        {history.length > 0 ? (
          history.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{new Date(r.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.meds.length} medicamentos prescritos</div>
              </div>
              <button onClick={() => handlePrint(r)} style={{ background: 'rgba(124,111,224,.1)', border: 'none', color: 'var(--purple)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                🖨️ PDF
              </button>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No hay recetas previas</div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
