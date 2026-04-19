/**
 * CaregiverRecetas.jsx - NeuroConecta
 * -----------------------------------------------
 * Pantalla del CUIDADOR para ver e imprimir las recetas médicas
 * enviadas por el médico de los pacientes vinculados.
 *
 * Funcionalidad:
 *  - Escucha en tiempo real la colección 'prescriptions' filtrando por:
 *    · patientId perteneciente a los pacientes vinculados del cuidador.
 *    · caregiverId igual al UID del cuidador autenticado.
 *  - Muestra cada receta con medicamentos, dosis, frecuencia y notas.
 *  - Permite imprimir/generar PDF con un diseño profesional usando
 *    @media print + window.print().
 *
 * Colección Firestore: prescriptions/
 *  Campos relevantes: patientName, doctorName, meds[], notes, createdAt
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function CaregiverRecetas() {
  const { userData } = useAuth();
  const [recetas, setRecetas] = useState([]);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    if (!userData?.linkedPatients || userData.linkedPatients.length === 0) return;

    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', 'in', userData.linkedPatients),
      where('caregiverId', '==', userData.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setRecetas(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return unsub;
  }, [userData]);

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
          <p style={{ margin: 5 }}>Receta Médica Digital</p>
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
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 5 }}>INDICACIONES</h3>
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
            <strong>NOTAS ADICIONALES:</strong>
            <p style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>{selectedReceta.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Recetas Médicas</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Consulta las prescripciones enviadas por el médico.</p>
      </div>

      <div className="grid-1">
        {recetas.length > 0 ? (
          recetas.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple)' }}>{r.patientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Dr. {r.doctorName} · {new Date(r.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handlePrint(r)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  🖨️ Imprimir
                </button>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 10, padding: 12 }}>
                {r.meds.map((m, i) => (
                  <div key={i} style={{ fontSize: 13, marginBottom: 4, display: 'flex', gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>• {m.name}</span>
                    <span style={{ color: 'var(--muted)' }}>({m.dose} - {m.freq})</span>
                  </div>
                ))}
              </div>

              {r.notes && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  "{r.notes}"
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💊</div>
            No hay recetas registradas todavía.
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>
    </div>
  );
}
