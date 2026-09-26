import React, { useState } from 'react';

const DOCENTES_INIT = [
  { id:1, ini:'AT', color:'#8B5CF6', nombre:'Ana Torres',    rol:'Psicopedagoga',  alumnos:5,  activo:true  },
  { id:2, ini:'CR', color:'#2EA043', nombre:'Carlos Rojas',  rol:'Terapeuta',      alumnos:8,  activo:true  },
  { id:3, ini:'LM', color:'#F59E0B', nombre:'Lucía Méndez',  rol:'Docente Apoyo',  alumnos:12, activo:true  },
  { id:4, ini:'JP', color:'#1F6FEB', nombre:'Jorge Pérez',   rol:'Psicólogo',      alumnos:6,  activo:false },
];

export default function DirectivoPersonal() {
  const [docentes, setDocentes] = useState(DOCENTES_INIT);
  const [showForm, setShowForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre:'', rol:'', alumnos:0 });

  const agregar = () => {
    if (!nuevo.nombre || !nuevo.rol) return;
    setDocentes(d => [...d, {
      id: Date.now(),
      ini: nuevo.nombre.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),
      color: '#2EA043',
      nombre: nuevo.nombre,
      rol: nuevo.rol,
      alumnos: parseInt(nuevo.alumnos) || 0,
      activo: true,
    }]);
    setNuevo({ nombre:'', rol:'', alumnos:0 });
    setShowForm(false);
    alert('✅ Docente agregado correctamente');
  };

  return (
    <>
      {/* Botón agregar */}
      <button
        onClick={() => setShowForm(f => !f)}
        className="dark-btn dark-btn-green"
        style={{ width:'100%', marginBottom:4, display:'flex',
          alignItems:'center', justifyContent:'center', gap:8 }}>
        + Agregar Nuevo Docente
      </button>

      {/* Formulario */}
      {showForm && (
        <div className="dark-card" style={{ border:'1px solid var(--dark-green)' }}>
          <div className="dark-card-title">Nuevo docente</div>
          {[
            { label:'Nombre completo', key:'nombre', type:'text' },
            { label:'Rol / especialidad', key:'rol',  type:'text' },
            { label:'Alumnos asignados', key:'alumnos', type:'number' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>{f.label}</div>
              <input className="dark-input" type={f.type} value={nuevo[f.key]}
                placeholder={f.label}
                onChange={e => setNuevo(n => ({ ...n, [f.key]:e.target.value }))}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={agregar} className="dark-btn dark-btn-green" style={{ flex:1 }}>
              Guardar
            </button>
            <button onClick={() => setShowForm(false)} className="dark-btn dark-btn-ghost" style={{ flex:1 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista docentes activos */}
      <div className="dark-card-title" style={{ paddingLeft:4 }}>
        Docentes activos ({docentes.filter(d=>d.activo).length})
      </div>

      {docentes.map(d => (
        <div key={d.id} className="dark-row">
          <div className="dark-avatar" style={{ background: d.color+'22', color: d.color }}>
            {d.ini}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13 }}>{d.nombre}</div>
            <div style={{ fontSize:11, color:'var(--dark-muted)' }}>
              {d.rol} · {d.alumnos} Alumnos
            </div>
          </div>
          <span className={`dark-badge ${d.activo ? 'dark-badge-green' : 'dark-badge-red'}`}>
            {d.activo ? 'Activo' : 'Inactivo'}
          </span>
          <span style={{ color:'var(--dark-muted)', fontSize:18, marginLeft:4 }}>›</span>
        </div>
      ))}
    </>
  );
}
