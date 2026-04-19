// CaregiverDoctores.jsx – Administración de acceso de los doctores para el CUIDADOR.
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function CaregiverDoctores() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Buscamos a todos los usuarios con el rol 'doctor'
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const unsub = onSnapshot(q, (snap) => {
      const docsArr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDoctors(docsArr);
    });
    return unsub;
  }, []);

  const toggleAccess = async (doctorId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', doctorId), {
        accessGranted: !currentStatus
      });
      console.log(`Acceso para ${doctorId} cambió a ${!currentStatus}`);
    } catch (err) {
      console.error("Error al actualizar acceso:", err);
      alert("Error al actualizar el acceso en Firebase: " + err.message);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Administración de Doctores <span className="emoji-anim">🛡️</span></div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Concede o revoca acceso a los doctores en la plataforma.</div>
      </div>
      
      {doctors.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--muted)' }}>
          No hay doctores registrados en el sistema.
        </div>
      ) : (
        doctors.map(docData => (
          <div key={docData.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: 'rgba(74,159,255,.2)', color: 'var(--blue)' }}>
              {docData.name ? docData.name.substring(0,2).toUpperCase() : 'DR'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{docData.name || 'Doctor sin nombre'}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{docData.email}</div>
              {docData.accessGranted ? (
                <span style={{ 
                  display: 'inline-block', marginTop: 4, fontSize: 11, background: 'rgba(94,232,160,.2)', 
                  color: 'var(--green)', padding: '2px 8px', borderRadius: 12, fontWeight: 700 
                }}>
                  ✅ Acceso Concedido
                </span>
              ) : (
                <span style={{ 
                  display: 'inline-block', marginTop: 4, fontSize: 11, background: 'rgba(255,107,107,.2)', 
                  color: 'var(--coral)', padding: '2px 8px', borderRadius: 12, fontWeight: 700 
                }}>
                  ⏳ Acceso Pendiente
                </span>
              )}
            </div>
            <button 
              onClick={() => toggleAccess(docData.id, docData.accessGranted)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                background: docData.accessGranted ? 'var(--coral)' : 'var(--blue)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {docData.accessGranted ? 'Revocar' : 'Conceder'}
            </button>
          </div>
        ))
      )}
    </>
  );
}
