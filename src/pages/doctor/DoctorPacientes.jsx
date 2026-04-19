/**
 * DoctorPacientes.jsx - NeuroConecta
 * -----------------------------------------------
 * Pantalla principal del MÉDICO que muestra la lista de pacientes
 * vinculados y permite vincular nuevos pacientes por correo electrónico.
 *
 * Funcionalidades:
 *  - Lista en tiempo real de pacientes cuyo `doctorUid` coincide con el
 *    UID del médico autenticado.
 *  - Formulario de vinculación: el médico ingresa el email del paciente
 *    y se llama a `linkPatient` del AuthContext para actualizar ambos
 *    documentos en Firestore.
 *  - Al tocar un paciente se llama a `onSelect` para navegar al detalle.
 *
 * Props:
 *  @param {function} onSelect - Callback que recibe el objeto del paciente
 *                               seleccionado para ver su detalle.
 *
 * Estructura de Firestore afectada al vincular:
 *  - users/{doctorUid}.linkedPatients  → arrayUnion(patientUid)
 *  - users/{patientUid}.doctorUid      → doctorUid
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function DoctorPacientes({ onSelect }) {
  // Extraemos el usuario y la función de vinculación del contexto
  const { user, linkPatient } = useAuth();

  // Lista de pacientes vinculados al médico
  const [patients, setPatients] = useState([]);

  // Controla si se muestra el formulario de vinculación
  const [showAdd, setShowAdd] = useState(false);

  // Email del paciente ingresado en el formulario
  const [email, setEmail] = useState('');

  // Mensaje de error al vincular
  const [error, setError] = useState('');

  // Estado de carga durante la vinculación
  const [loading, setLoading] = useState(false);

  /**
   * useEffect: escucha en tiempo real los pacientes vinculados al doctor.
   * Filtra por `doctorUid == user.uid` en la colección 'users'.
   */
  useEffect(() => {
    if (!user) return;

    // Busca pacientes que tengan este médico asignado
    const q = query(collection(db, 'users'), where('doctorUid', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const p = snap.docs.map(d => {
        const data = d.data();
        return {
          id:           d.id,
          initials:     data.name ? data.name.substring(0, 2).toUpperCase() : 'PT',
          name:         data.name || 'Paciente sin nombre',
          age:          data.age || '-',
          score:        85, // Placeholder; en futuro se calcula dinámicamente
          scoreColor:   'var(--green)',
          scoreBg:      'rgba(94,232,160,.2)',
          avatarBg:     'rgba(124,111,224,.2)',
          avatarColor:  'var(--purple)',
          mood:         data.lastMood  || '😊',
          sleep:        data.lastSleep || '7h',
          status:       'Activo',
          statusColor:  'var(--green)',
          statusBg:     'rgba(94,232,160,.2)',
          ...data
        };
      });
      setPatients(p);
    });

    return unsub; // Limpia el listener al desmontar
  }, [user]);

  /**
   * handleAddPatient
   * Maneja el envío del formulario de vinculación.
   * Llama a `linkPatient` del AuthContext y gestiona estados de carga/error.
   *
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Vincula al paciente buscando por email
      await linkPatient(email, user.uid);
      setEmail('');
      setShowAdd(false);
      alert('✅ Paciente vinculado con éxito. Ya puedes enviarle recetas.');
    } catch (err) {
      // Muestra el error específico si falla (ej. Email no encontrado)
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      {/* ────── Encabezado con nombre del médico y botón para añadir ────── */}
      <div style={{ marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:18, fontWeight:800 }}>
            Dr. {user?.displayName || 'Doctor'} <span className="emoji-anim">👨‍⚕️</span>
          </div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>
            Neurología · {patients.length} pacientes activos
          </div>
        </div>

        {/* Botón para mostrar/ocultar el formulario de vinculación */}
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background:'var(--purple)', color:'white', border:'none',
            borderRadius:12, padding:'8px 16px', fontWeight:700, cursor:'pointer'
          }}>
          + Añadir
        </button>
      </div>

      {/* ────── Formulario de vinculación por email ────── */}
      {showAdd && (
        <div className="card" style={{ marginBottom:20, border:'2px solid var(--purple)' }}>
          <div style={{ fontWeight:700, marginBottom:4 }}>Vincular nuevo paciente</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>
            Ingresa el correo electrónico con el que el paciente inició sesión en NeuroConecta.
          </div>
          <form onSubmit={handleAddPatient} style={{ display:'flex', gap:8 }}>
            {/* Input del email del paciente */}
            <input
              type="email"
              placeholder="paciente@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                flex:1, padding:10, borderRadius:8,
                border:'1px solid var(--border)',
                background:'var(--surface)', color:'var(--text)',
                fontFamily:'inherit', fontSize:13
              }}
            />
            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding:'0 20px', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳' : 'Vincular'}
            </button>
          </form>
          {/* Mensaje de error si la vinculación falla */}
          {error && (
            <div style={{ color:'var(--coral)', fontSize:12, marginTop:8 }}>
              ❌ {error}
            </div>
          )}
        </div>
      )}

      {/* ────── Tarjetas de resumen estadístico ────── */}
      <div className="grid-3" style={{ marginBottom:14 }}>
        {[
          { val: patients.length, lbl:'Pacientes', color:'var(--blue)'  },
          { val:'2',              lbl:'Citas hoy', color:'var(--amber)' },
          { val:'0',              lbl:'Alertas',   color:'var(--coral)' },
        ].map(s => (
          <div key={s.lbl} className="stat-mini">
            <div className="val" style={{ color:s.color }}>{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ────── Lista de pacientes vinculados ────── */}
      <div className="card-title">Mis pacientes</div>
      {patients.length === 0 && (
        <div style={{ textAlign:'center', padding:'30px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
          No tienes pacientes vinculados aún. Usa el botón "Añadir" para vincular uno.
        </div>
      )}
      {patients.map(p => (
        // Al tocar la fila, se navega al detalle del paciente
        <div key={p.id} className="doctor-patient-row" onClick={() => onSelect(p)}>
          {/* Avatar del paciente */}
          <div className="avatar" style={{ background:p.avatarBg, color:p.avatarColor, fontSize:15 }}>
            {p.initials}
          </div>

          {/* Nombre, bienestar y estado */}
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>
              Sueño {p.sleep} · Ánimo: <span className="emoji-anim">{p.mood}</span>
            </div>
            <span style={{
              background:p.statusBg, color:p.statusColor,
              fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700,
              display:'inline-block', marginTop:3
            }}>
              {p.status}
            </span>
          </div>

          {/* Indicador de salud circular */}
          <div className="health-ring" style={{
            background:p.scoreBg, color:p.scoreColor,
            border:`2px solid ${p.scoreColor}`
          }}>
            {p.score}%
          </div>
        </div>
      ))}
    </>
  );
}
