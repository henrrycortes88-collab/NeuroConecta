import React, { useState } from 'react';

const GRUPOS = [
  { id:'A', nombre:'Grupo A', alumnos:8,  prof:'Prof. Laura Hernández', color:'#2EA043' },
  { id:'B', nombre:'Grupo B', alumnos:6,  prof:'Prof. Manuel Torres',   color:'#1F6FEB' },
  { id:'C', nombre:'Grupo C', alumnos:7,  prof:'Prof. Ana Martínez',    color:'#8B5CF6' },
];

const ALUMNOS_POR_GRUPO = {
  A: [
    { id:1, nombre:'Juan Pérez',  edad:8, nivel:'Cognitiva',    estado:'Activo',   foto:'👦' },
    { id:2, nombre:'Ana López',   edad:7, nivel:'Comunicación', estado:'Activo',   foto:'👧' },
    { id:3, nombre:'Luis García', edad:9, nivel:'Cognitiva',    estado:'Inactivo', foto:'👦' },
  ],
  B: [
    { id:4, nombre:'Sofía Ruiz',  edad:10, nivel:'Cognitiva',   estado:'Activo',  foto:'👧' },
    { id:5, nombre:'Diego Cruz',  edad:8,  nivel:'Motora',      estado:'Activo',  foto:'👦' },
  ],
  C: [
    { id:6, nombre:'Valeria Mora',edad:9,  nivel:'Comunicación',estado:'Activo',  foto:'👧' },
  ],
};

export default function DocenteAlumnos() {
  const [vista,       setVista]       = useState('grupos');  // 'grupos' | 'alumnos'
  const [grupoSel,    setGrupoSel]    = useState(null);

  if (vista === 'alumnos' && grupoSel) {
    const alumnos = ALUMNOS_POR_GRUPO[grupoSel.id] || [];
    const grupo   = GRUPOS.find(g => g.id === grupoSel.id);
    return (
      <>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <button onClick={() => setVista('grupos')}
            style={{ background:'none', border:'none', color:'var(--dark-muted)',
              fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
            ← Grupos
          </button>
          <span style={{ fontWeight:700, fontSize:15 }}>Alumnos — {grupo.nombre}</span>
        </div>

        <div className="dark-card-title">Alumnos</div>
        {alumnos.map(a => (
          <div key={a.id} className="dark-card" style={{ marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:44, height:44, borderRadius:'50%',
                background:'var(--dark-card)', border:'1px solid var(--dark-border)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {a.foto}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{a.nombre}</div>
                <div style={{ fontSize:11, color:'var(--dark-muted)' }}>
                  Edad: {a.edad} años
                </div>
                <div style={{ fontSize:11, color:'var(--dark-muted)' }}>
                  Nivel: {a.nivel}
                </div>
              </div>
              <span className={`dark-badge ${a.estado==='Activo'?'dark-badge-green':'dark-badge-red'}`}>
                {a.estado}
              </span>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={() => alert(`Perfil de ${a.nombre}`)}
                className="dark-btn dark-btn-blue" style={{ flex:1, padding:'7px' }}>
                Ver perfil
              </button>
              <button onClick={() => alert(`¿Eliminar a ${a.nombre}?`)}
                className="dark-btn dark-btn-red" style={{ flex:1, padding:'7px' }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="dark-card-title">Grupos</div>
      {GRUPOS.map(g => (
        <div key={g.id} className="dark-card" style={{ marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:8,
              background: g.color+'22', color: g.color,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:20, flexShrink:0 }}>
              {g.id}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{g.nombre}</div>
              <div style={{ fontSize:11, color:'var(--dark-muted)' }}>
                {g.alumnos} alumnos
              </div>
              <div style={{ fontSize:11, color:'var(--dark-muted)' }}>{g.prof}</div>
            </div>
            <button
              onClick={() => { setGrupoSel(g); setVista('alumnos'); }}
              className="dark-btn dark-btn-ghost"
              style={{ fontSize:11, padding:'5px 12px' }}>
              Ver detalles ›
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
