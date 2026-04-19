import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function CaregiverAlertas() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const dismiss = async (id) => {
    try {
      await deleteDoc(doc(db, 'alerts', id));
    } catch(e) {
      console.error("Error dismiss alert:", e);
    }
  };

  const activeAlerts = items.filter(i => i.type === 'sos' || i.type === 'alert').length;

  return (
    <>
      <div className="row-between" style={{ marginBottom:8 }}>
        <span style={{ fontSize:13, color:'var(--muted)' }}>{activeAlerts} alertas activas</span>
      </div>

      {items.map((item) => {
        const isSOS = item.type === 'sos';
        return (
          <div key={item.id} className={isSOS ? 'alert-item' : 'ok-item'} style={{ cursor:'default', background: isSOS ? 'rgba(255,107,138,.15)' : 'var(--surface)' }}>
            <span style={{ fontSize:20 }}>{isSOS ? '🆘' : '🔔'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>{isSOS ? '¡EMERGENCIA!' : item.type}</div>
              <div style={{ fontSize:12, color:'var(--muted)' }}>{item.patientName}: {item.message}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              <span style={{ fontSize:10, color:'var(--muted)' }}>
                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </span>
              <button onClick={() => dismiss(item.id)}
                style={{ background:'none', border:'none', color:'var(--muted)', fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
          <div style={{ fontWeight:700 }}>¡Sin alertas pendientes!</div>
        </div>
      )}
    </>
  );
}
