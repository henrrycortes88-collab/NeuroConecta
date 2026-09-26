import React, { useState } from 'react';

const GRUPOS  = ['Grupo A','Grupo B','Grupo C'];

const ACTS_INIT = [
  { id:1, nombre:'Lectura guiada',     icono:'📖', nivel:'Cognitiva',    hora:'09:00 - 11:00', alumnos:8, estado:'activa',     prog:75  },
  { id:2, nombre:'Juego de memoria',   icono:'🧩', nivel:'Cognitiva',    hora:'11:00 - 12:00', alumnos:6, estado:'pendiente',  prog:0   },
  { id:3, nombre:'Pictogramas emoc.',  icono:'🖼️', nivel:'Comunicación', hora:'10:00',          alumnos:5, estado:'completada', prog:100 },
];

const COLOR = {
  activa:     { badge:'dark-badge-green', label:'Activo'     },
  pendiente:  { badge:'dark-badge-amber', label:'Pendiente'  },
  completada: { badge:'dark-badge-blue',  label:'Completada' },
};

export default function DocenteActividades() {
  const [acts,    setActs]    = useState(ACTS_INIT);
  const [showForm,setShowForm]= useState(false);
  const [form,    setForm]    = useState({
    nombre:'', grupo:'Grupo A', nivel:'Cognitiva',
    fecha:'', hora:'', duracion:'60', descripcion:''
  });

  const cambiar = (id, estado) =>
    setActs(a => a.map(x => x.id===id ? {...x, estado} : x));

  const programar = () => {
    if (!form.nombre || !form.fecha) return;
    setActs(a => [...a, {
      id:     Date.now(),
      nombre: form.nombre,
      icono:  '📋',
      nivel:  form.nivel,
      hora:   form.hora,
      alumnos:0,
      estado: 'pendiente',
      prog:   0,
    }]);
    setShowForm(false);
    setForm({ nombre:'', grupo:'Grupo A', nivel:'Cognitiva', fecha:'', hora:'', duracion:'60', descripcion:'' });
    alert('✅ Actividad programada correctamente');
  };

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontWeight:800, fontSize:15 }}>Actividades</span>
        <button onClick={() => setShowForm(f => !f)}
          className="dark-btn dark-btn-green" style={{ padding:'7px 14px', fontSize:12 }}>
          + Nueva
        </button>
      </div>

      {/* Formulario agregar actividad */}
      {showForm && (
        <div className="dark-card" style={{ border:'1px solid var(--dark-green)', marginBottom:8 }}>
          <div className="dark-card-title">Agregar Actividad</div>

          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Grupo</div>
          <select className="dark-select" value={form.grupo}
            onChange={e => setForm(f => ({...f, grupo:e.target.value}))}>
            {GRUPOS.map(g => <option key={g}>{g}</option>)}
          </select>

          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Actividad</div>
          <input className="dark-input" placeholder="Nombre de la actividad"
            value={form.nombre}
            onChange={e => setForm(f => ({...f, nombre:e.target.value}))}/>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Fecha</div>
              <input className="dark-input" type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({...f, fecha:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Hora</div>
              <input className="dark-input" type="time"
                value={form.hora}
                onChange={e => setForm(f => ({...f, hora:e.target.value}))}/>
            </div>
          </div>

          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Duración (min)</div>
          <select className="dark-select" value={form.duracion}
            onChange={e => setForm(f => ({...f, duracion:e.target.value}))}>
            {['30','45','60','90','120'].map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Descripción (opcional)</div>
          <textarea className="dark-input" placeholder="Descripción de la actividad..."
            style={{ resize:'none', minHeight:60 }}
            value={form.descripcion}
            onChange={e => setForm(f => ({...f, descripcion:e.target.value}))}/>

          <button onClick={programar} className="dark-btn dark-btn-green" style={{ width:'100%' }}>
            Programar actividad
          </button>
        </div>
      )}

      {/* Lista de actividades */}
      {acts.map(a => {
        const c = COLOR[a.estado];
        return (
          <div key={a.id} className="dark-card" style={{ marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{a.icono}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{a.nombre}</div>
                <div style={{ fontSize:11, color:'var(--dark-muted)' }}>
                  {a.nivel} · {a.hora} · {a.alumnos} alumnos
                </div>
                {a.prog > 0 && (
                  <div style={{ marginTop:5 }}>
                    <div style={{ fontSize:10, color:'var(--dark-muted)', marginBottom:3 }}>
                      Progreso: {a.prog}%
                    </div>
                    <div className="dark-progress-bar">
                      <div className="dark-progress-fill"
                        style={{ width:`${a.prog}%`,
                          background: a.prog===100?'#2EA043':'#1F6FEB' }}/>
                    </div>
                  </div>
                )}
              </div>
              <span className={`dark-badge ${c.badge}`}>{c.label}</span>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {a.estado !== 'activa' && (
                <button onClick={() => cambiar(a.id,'activa')}
                  className="dark-btn dark-btn-green" style={{ flex:1, padding:'6px', fontSize:11 }}>
                  Activar
                </button>
              )}
              {a.estado !== 'completada' && (
                <button onClick={() => cambiar(a.id,'completada')}
                  className="dark-btn dark-btn-blue" style={{ flex:1, padding:'6px', fontSize:11 }}>
                  Completar
                </button>
              )}
              {a.estado !== 'pendiente' && (
                <button onClick={() => cambiar(a.id,'pendiente')}
                  className="dark-btn dark-btn-ghost" style={{ flex:1, padding:'6px', fontSize:11 }}>
                  Pausar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
