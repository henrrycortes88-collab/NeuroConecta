/**
 * ChatRoom.jsx - NeuroConecta
 * -----------------------------------------------
 * Componente de chat reutilizable con sincronización en tiempo real.
 *
 * Funcionalidad:
 *  - Escucha mensajes en `chats/{chatId}/messages` ordenados por fecha.
 *  - Muestra los mensajes con diseño de burbuja: los del usuario actual
 *    aparecen a la derecha (color púrpura) y los de otros a la izquierda.
 *  - Permite al cuidador escribir y enviar mensajes de texto al paciente.
 *  - Los mensajes AAC del paciente (`isAac: true`) aparecen automáticamente
 *    cuando el paciente presiona REPRODUCIR en PatientComunica.
 *
 * Props:
 *  @param {string} chatId   - UID del paciente; define la sala de chat.
 *  @param {string} roomName - Título de la sala (mostrado en el header).
 *
 * Colección Firestore: chats/{chatId}/messages
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function ChatRoom({ chatId, roomName = 'Chat Equipo' }) {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    // Escuchar mensajes de esta sala específica
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return unsub;
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'Usuario',
        senderRole: role,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!chatId) return (
    <div style={{ padding:20, textAlign:'center', color:'var(--muted)' }}>
      Selecciona una conversación para comenzar
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--surface)', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'12px 20px', background:'var(--purple)', color:'white', fontWeight:700, display:'flex', alignItems:'center', gap:10 }}>
        <span>💬</span> {roomName}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:15, display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map(m => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start'
            }}>
              {!isMe && (
                <div style={{ fontSize:10, color:'var(--muted)', marginBottom:2, marginLeft:4 }}>
                  {m.senderName} ({m.senderRole})
                </div>
              )}
              <div style={{ 
                background: isMe ? 'var(--purple)' : 'var(--bg)',
                color: isMe ? 'white' : 'var(--text)',
                padding: '8px 14px',
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                fontSize: 14
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding:15, borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
        <input 
          type="text" 
          placeholder="Escribe un mensaje..." 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          style={{ flex:1, padding:'10px 15px', borderRadius:20, border:'1px solid var(--border)', outline:'none' }}
        />
        <button type="submit" style={{ 
          background:'var(--purple)', color:'white', border:'none', 
          width:40, height:40, borderRadius:'50%', display:'flex', 
          justifyContent:'center', alignItems:'center', cursor:'pointer' 
        }}>
          ➔
        </button>
      </form>
    </div>
  );
}
