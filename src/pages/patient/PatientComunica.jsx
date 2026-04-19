/**
 * PatientComunica.jsx - NeuroConecta
 * -----------------------------------------------
 * Sistema de Comunicación Aumentativa y Alternativa (CAA/AAC)
 * para el rol PACIENTE.
 *
 * Funcionalidad:
 *  - El paciente selecciona pictogramas agrupados por CONTEXTO y CATEGORÍA
 *    para construir frases de forma visual e intuitiva.
 *  - Al presionar REPRODUCIR:
 *    1. La frase se sintetiza usando Web Speech API (SpeechSynthesisUtterance).
 *    2. El mensaje (emojis + texto) se guarda en Firestore:
 *       `chats/{patientUid}/messages` con el campo `isAac: true`.
 *    3. El cuidador ve el mensaje en tiempo real en su pestaña "Mensajes"
 *       a través del componente ChatRoom.
 *
 * Contextos disponibles: General, En el colegio, En el médico, En casa, Salidas.
 * Categorías: Necesidades básicas, Emociones, Acciones, Lugares, Personas, Comida.
 * Total de pictogramas: 15 por combinación de contexto + categoría.
 */
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { AAC_CONTEXTS, AAC_CATEGORIES, AAC_VOCABULARY } from './PatientComunicaData';

export default function PatientComunica() {
  const { user } = useAuth();
  const [ctx, setCtx] = useState('general');
  const [cat, setCat] = useState('necesidades');
  const [phrase, setPhrase] = useState([]);

  const addWord = (item) => {
    setPhrase(prev => [...prev, item]);
  };

  const removeLast = () => {
    setPhrase(prev => prev.slice(0, -1));
  };


  const reproduceAndSend = async () => {
    if (phrase.length === 0) return;
    const fullText = phrase.map(i => i.txt).join(' ');
    const emojiString = phrase.filter(i => !i.isTextOnly).map(i => i.emoji).join(' ');
    
    // Reproducir con síntesis de voz
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);

    try {
      // Guardar en el chatroom del paciente para que el cuidador lo vea en 'Mensajes'
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        text: `${emojiString} ${fullText}`,
        senderId: user?.uid || 'anon',
        senderName: user?.displayName || 'Paciente',
        senderRole: 'patient',
        createdAt: serverTimestamp(),
        isAac: true
      });
      setPhrase([]);
    } catch(e) {
      console.error('Error al enviar pictograma:', e);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 160px)', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 15, padding: '0 5px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 8 }}>
            Toca una imagen para construir una frase
          </div>
          
          <div style={{ 
            display: 'flex', 
            background: 'var(--surface)', 
            border: '2px solid rgba(124,111,224,.3)',
            borderRadius: 24, padding: 8, alignItems: 'center', minHeight: 60, boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <button onClick={removeLast} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: 'var(--text)', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
            </button>
            <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 10px', alignItems: 'center' }}>
              {phrase.map((p, idx) => (
                <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 'bold' }}>{p.label}</span>
                </div>
              ))}
            </div>
            <button onClick={reproduceAndSend} style={{ background: '#C7D2FE', color: '#4F46E5', border: 'none', borderRadius: 20, padding: '10px 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> REPRODUCIR
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 15 }}>
          {AAC_CONTEXTS.map(c => (
            <button key={c.id} onClick={() => setCtx(c.id)} style={{ background: ctx === c.id ? '#3b82f6' : 'var(--surface)', color: ctx === c.id ? 'white' : 'var(--text)', border: `1px solid ${ctx === c.id ? '#3b82f6' : 'var(--border)'}`, borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontWeight: ctx === c.id ? 700 : 500, cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
          {AAC_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ background: cat === c.id ? c.color : 'var(--surface)', color: cat === c.id ? 'white' : 'var(--text)', border: `1px solid ${cat === c.id ? c.color : 'var(--border)'}`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', fontWeight: 700, cursor: 'pointer', boxShadow: cat === c.id ? `0 4px 10px ${c.color}66` : 'none', transform: cat === c.id ? 'scale(1.05)' : 'none', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 20 }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {(AAC_VOCABULARY[`${ctx}_${cat}`] || AAC_VOCABULARY[`general_${cat}`] || []).map((v, idx) => (
            <button key={idx} className="big-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={() => addWord(v)}>
              <span className="em3d" style={{ fontSize: 36 }}>{v.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{v.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

