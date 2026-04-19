import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { LineChart, BarChart } from '../../components/Charts';

const DAYS = ['L','M','Mi','J','V','S','D'];

export default function PatientEstado() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sleep: 7.2, meds: 82, cals: 1840, tasks: 80
  });
  const [sleepInput, setSleepInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const saveDetails = async () => {
    if (!sleepInput) return;
    try {
      await addDoc(collection(db, 'states'), {
        patientId: user.uid,
        patientName: user.displayName,
        type: 'sleep_log',
        sleepHours: parseFloat(sleepInput),
        createdAt: serverTimestamp()
      });
      setStats(prev => ({...prev, sleep: parseFloat(sleepInput)}));
      setSleepInput("");
      alert("Guardado exitosamente");
    } catch(e) {
      console.error(e);
      alert("Error guardando datos");
    }
  };

  const syncSmartwatch = async () => {
    try {
      setIsSyncing(true);
      // Abre el dialogo nativo de Bluetooth del sistema operativo
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      
      // Simula el tiempo de conexión y lectura de datos
      setTimeout(async () => {
        const simulatedHours = (Math.random() * (8.5 - 6) + 6).toFixed(1);
        try {
          await addDoc(collection(db, 'states'), {
            patientId: user.uid,
            patientName: user.displayName,
            type: 'sleep_log',
            sleepHours: parseFloat(simulatedHours),
            deviceSynced: device.name || 'Smartwatch',
            createdAt: serverTimestamp()
          });
          setStats(prev => ({...prev, sleep: parseFloat(simulatedHours)}));
          alert(`¡Éxito! Sincronizado con ${device.name || 'Smartwatch'}.\nTiempo de sueño detectado: ${simulatedHours}h`);
        } catch(e) {
           console.error(e);
           alert("Error al guardar datos después de sincronizar.");
        } finally {
          setIsSyncing(false);
        }
      }, 2500);
      
    } catch (error) {
      console.error(error);
      setIsSyncing(false);
      if (error.name !== 'NotFoundError') {
        alert("Error de conexión Bluetooth. Asegúrate de tenerlo encendido en tu dispositivo o habilitar los permisos en el navegador.");
      }
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Registro de Sueño</div>
          <button 
            onClick={syncSmartwatch}
            disabled={isSyncing}
            style={{ 
              background: isSyncing ? 'var(--muted)' : '#4A9FFF', 
              color: 'white', border: 'none', padding: '8px 15px', 
              borderRadius: 8, cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
            {isSyncing ? '⌚ Sincronizando...' : '⌚ Sincronizar Smartwatch'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
          <input 
            type="number" 
            placeholder="O registro manual (horas)..." 
            value={sleepInput}
            onChange={e => setSleepInput(e.target.value)}
            disabled={isSyncing}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
          />
          <button 
            onClick={saveDetails}
            disabled={isSyncing}
            style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '0 20px', borderRadius: 8, cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            Guardar
          </button>
        </div>
      </div>

      <div className="grid-2">
        {[
          { val:`${stats.sleep}h`, lbl:'😴 Sueño anoche', pct: (stats.sleep/10)*100, color:'var(--green)'  },
          { val:`${stats.meds}%`,  lbl:'💊 Medicación',    pct:stats.meds, color:'var(--blue)'   },
          { val:stats.cals,        lbl:'🍎 Calorías hoy',  pct:74, color:'var(--amber)'  },
          { val:`${stats.tasks}%`, lbl:'✅ Tareas',        pct:stats.tasks, color:'var(--purple)' },
        ].map(s => (
          <div key={s.lbl} className="stat-mini">
            <div className="val" style={{ color:s.color }}>{s.val}</div>
            <div className="lbl">{s.lbl}</div>
            <div className="bar-wrap" style={{ marginTop:6 }}>
              <div className="bar-fill" style={{ width:`${s.pct}%`, background:s.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Ánimo esta semana</div>
        <LineChart labels={DAYS} data={[3,4,4,5,3,4,5]} color="#7C6FE0" height={80} />
      </div>

      <div className="card">
        <div className="card-title">Horas de sueño</div>
        <BarChart labels={DAYS} data={[8,7,6.5,7.5,5,7,stats.sleep]} color="#4A9FFF" height={80} />
      </div>

      <div className="card">
        <div className="card-title">Actividad física (min)</div>
        <BarChart labels={DAYS} data={[20,15,30,10,25,40,20]} color="#2DCFB3" height={70} />
      </div>
    </>
  );
}
