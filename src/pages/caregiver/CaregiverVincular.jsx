/**
 * CaregiverVincular.jsx - NeuroConecta
 * -----------------------------------------------
 * Pantalla para que el CUIDADOR vincule la cuenta de un paciente
 * usando su dirección de correo electrónico.
 *
 * Funcionalidad:
 *  - Muestra el listado de pacientes actualmente vinculados.
 *  - Permite buscar y vincular un nuevo paciente ingresando su email.
 *  - Llama a `linkPatientToCaregiver` del AuthContext para actualizar
 *    los documentos de Firestore de ambos usuarios.
 *
 * Estructura de Firestore afectada:
 *  - users/{caregiverUid}.linkedPatients  → array que crece con arrayUnion
 *  - users/{patientUid}.linkedCaregivers  → array que crece con arrayUnion
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function CaregiverVincular() {
  // Función de vinculación del contexto de autenticación
  const { user, userData, linkPatientToCaregiver } = useAuth();

  // Email que el cuidador introduce para buscar al paciente
  const [email, setEmail] = useState('');

  // Estado de carga durante la operación de vinculación
  const [loading, setLoading] = useState(false);

  // Mensaje de resultado (éxito o error) tras intentar vincular
  const [msg, setMsg] = useState(null);

  // Lista de pacientes actualmente vinculados al cuidador
  const [patients, setPatients] = useState([]);

  /**
   * useEffect: carga en tiempo real los pacientes vinculados.
   * Escucha el array `linkedPatients` del cuidador y busca sus perfiles.
   */
  useEffect(() => {
    // Si no hay pacientes vinculados, no hay nada que buscar
    if (!userData?.linkedPatients || userData.linkedPatients.length === 0) {
      setPatients([]);
      return;
    }

    // Consulta los perfiles de los pacientes vinculados en tiempo real
    const q = query(
      collection(db, 'users'),
      where('uid', 'in', userData.linkedPatients)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return unsub; // Limpieza del listener al desmontar
  }, [userData?.linkedPatients]);

  /**
   * handleVincular
   * Ejecuta el proceso de vinculación cuando el cuidador presiona el botón.
   * Valida el email y llama a la función del contexto.
   */
  const handleVincular = async () => {
    if (!email.trim()) return; // No hacer nada si el campo está vacío

    setLoading(true);
    setMsg(null);

    try {
      // Llama al AuthContext para vincular el paciente
      const patientData = await linkPatientToCaregiver(email.trim(), user.uid);
      setMsg({ type: 'success', text: `✅ Paciente "${patientData.name}" vinculado exitosamente.` });
      setEmail(''); // Limpia el campo tras éxito
    } catch (e) {
      // Muestra el error si la vinculación falla
      setMsg({ type: 'error', text: `❌ ${e.message}` });
    }

    setLoading(false);
  };

  return (
    <div className="fade-in">
      {/* ───── Encabezado ───── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🔗 Vincular Paciente</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Ingresa el correo electrónico del paciente para vincularlo a tu cuenta de cuidador.
        </p>
      </div>

      {/* ───── Formulario de vinculación ───── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nuevo vínculo por correo</div>

        {/* Campo de email */}
        <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
          Correo del Paciente
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="paciente@correo.com"
          onKeyDown={e => e.key === 'Enter' && handleVincular()}
          style={{
            width: '100%', padding: '10px 14px', marginBottom: 12,
            border: '1px solid var(--border)', borderRadius: 10,
            background: 'var(--surface)', color: 'var(--text)',
            fontSize: 14, fontFamily: 'inherit', outline: 'none'
          }}
        />

        {/* Botón de acción */}
        <button
          onClick={handleVincular}
          disabled={loading || !email.trim()}
          style={{
            width: '100%', background: 'var(--teal)', color: 'white',
            border: 'none', borderRadius: 10, padding: '12px',
            fontWeight: 800, fontSize: 14, cursor: 'pointer',
            opacity: (loading || !email.trim()) ? 0.6 : 1,
            fontFamily: 'inherit'
          }}
        >
          {loading ? '⏳ Vinculando...' : 'Vincular Paciente'}
        </button>

        {/* Mensaje de resultado */}
        {msg && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13,
            background: msg.type === 'success' ? 'rgba(45,207,179,.12)' : 'rgba(255,107,138,.12)',
            color: msg.type === 'success' ? 'var(--teal)' : 'var(--coral)',
            fontWeight: 600
          }}>
            {msg.text}
          </div>
        )}
      </div>

      {/* ───── Lista de pacientes vinculados ───── */}
      <div className="card">
        <div className="card-title">Pacientes vinculados ({patients.length})</div>
        {patients.length > 0 ? (
          patients.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}
            >
              {/* Avatar del paciente */}
              <div className="avatar" style={{ background: 'rgba(124,111,224,.2)', color: 'var(--purple)' }}>
                {p.name?.substring(0, 2).toUpperCase() || '??'}
              </div>

              {/* Nombre y email */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.email}</div>
              </div>

              {/* Badge de estado */}
              <span style={{
                fontSize: 11, background: 'rgba(45,207,179,.15)',
                color: 'var(--teal)', padding: '3px 10px',
                borderRadius: 20, fontWeight: 700
              }}>
                ✓ Vinculado
              </span>
            </div>
          ))
        ) : (
          // Estado vacío cuando no hay pacientes vinculados
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
            No tienes pacientes vinculados todavía.
          </div>
        )}
      </div>
    </div>
  );
}
