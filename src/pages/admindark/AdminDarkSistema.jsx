import React, { useState, useEffect } from 'react';

const METRICAS_INIT = [
  { key:'cpu',      label:'CPU',       val:34, color:'#2EA043', icon:'⚡' },
  { key:'memoria',  label:'Memoria',   val:61, color:'#F59E0B', icon:'🧠' },
  { key:'storage',  label:'Storage',   val:47, color:'#1F6FEB', icon:'💾' },
  { key:'firebase', label:'Firebase',  val:72, color:'#F85149', icon:'🔥' },
];

const CONFIGS_INIT = [
  { key:'mant',  label:'Modo Mantenimiento', val:false },
  { key:'logs',  label:'Guardar Registros',  val:true  },
  { key:'debug', label:'Modo Depuración',    val:false },
];

const CONSOLA_INIT = [
  '> Sistema iniciado correctamente',
  '> Firebase conectado — proyecto: neuroauds',
  '> Usuarios activos: 12',
  '> Última sincronización: hace 3 min',
];

export default function AdminDarkSistema() {
  const [configs,  setConfigs]  = useState(CONFIGS_INIT);
  const [consola,  setConsola]  = useState(CONSOLA_INIT);
  const [metricas, setMetricas] = useState(METRICAS_INIT);

  // Simular actualizaciones de métricas cada 5 segundos
  useEffect(() => {
    const t = setInterval(() => {
      setMetricas(m => m.map(x => ({
        ...x,
        val: Math.min(99, Math.max(5, x.val + Math.floor(Math.random()*11) - 5))
      })));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const toggleConfig = (key) =>
    setConfigs(c => c.map(x => x.key===key ? { ...x, val:!x.val } : x));

  const limpiarCache = () => {
    setConsola(c => [...c, `> [${new Date().toLocaleTimeString()}] Caché limpiada — 47 entradas eliminadas`]);
    alert('✅ Caché limpiada correctamente');
  };

  const hacerBackup = () => {
    setConsola(c => [...c, `> [${new Date().toLocaleTimeString()}] Backup iniciado... completado en 2.3s`]);
    alert('✅ Backup realizado: 47 documentos guardados');
  };

  const reiniciarServicio = () => {
    setConsola(c => [...c, `> [${new Date().toLocaleTimeString()}] ⚠ Reinicio de servicio solicitado`]);
    alert('⚠ Servicio reiniciado correctamente');
  };

  return (
    <>
      {/* Métricas del sistema */}
      <div className="dark-card">
        <div className="dark-card-title">Estado del Sistema</div>
        {metricas.map(m => (
          <div key={m.key} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'var(--dark-text)', display:'flex',
                alignItems:'center', gap:6 }}>
                {m.icon} {m.label}
              </span>
              <span style={{ fontSize:12, fontWeight:800, color:m.color }}>{m.val}%</span>
            </div>
            <div className="dark-progress-bar">
              <div className="dark-progress-fill"
                style={{ width:`${m.val}%`, background:m.color }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Configuración del sistema */}
      <div className="dark-card">
        <div className="dark-card-title">Configuración</div>
        {configs.map(c => (
          <div key={c.key} style={{ display:'flex', alignItems:'center',
            justifyContent:'space-between', padding:'10px 0',
            borderBottom:'1px solid var(--dark-border)' }}>
            <span style={{ fontSize:13, color:'var(--dark-text)' }}>{c.label}</span>
            <button
              className={`dark-toggle ${c.val ? 'on' : 'off'}`}
              onClick={() => toggleConfig(c.key)}>
              <div className="knob"/>
            </button>
          </div>
        ))}
      </div>

      {/* Acciones de mantenimiento */}
      <div className="dark-card">
        <div className="dark-card-title">Mantenimiento</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={limpiarCache} className="dark-btn dark-btn-blue" style={{ width:'100%' }}>
            🗑️ Limpiar Caché
          </button>
          <button onClick={hacerBackup} className="dark-btn dark-btn-green" style={{ width:'100%' }}>
            💾 Hacer Backup Ahora
          </button>
          <button onClick={reiniciarServicio} className="dark-btn dark-btn-red" style={{ width:'100%' }}>
            ♻️ Reiniciar Servicio
          </button>
        </div>
      </div>

      {/* Consola del sistema */}
      <div className="dark-card">
        <div className="dark-card-title">Consola del Sistema</div>
        <div style={{
          background:'#0D1117', borderRadius:8, padding:12,
          border:'1px solid var(--dark-border)', maxHeight:160, overflowY:'auto',
          fontFamily:'monospace',
        }}>
          {consola.map((l, i) => (
            <div key={i} style={{ fontSize:11, color:'#58A6FF', marginBottom:2 }}>{l}</div>
          ))}
        </div>
      </div>
    </>
  );
}
