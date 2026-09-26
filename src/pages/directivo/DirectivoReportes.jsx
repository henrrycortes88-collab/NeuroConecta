import React, { useState } from 'react';

const MESES = ['Enero 2025','Febrero 2025','Marzo 2025','Abril 2025','Mayo 2025','Junio 2025'];
const FILTROS = ['Progreso General','Crisis Nivel 3','Asistencia','Medicación'];

const DESCARGAS = [
  { nombre:'Progreso_General_Abril.pdf', fecha:'21/04/2024', filtro:'Todos los niveles'  },
  { nombre:'Crisis_Nivel3_Marzo.pdf',    fecha:'15/03/2024', filtro:'Filtro: Nivel 3'    },
  { nombre:'Asistencia_Feb.pdf',         fecha:'28/02/2024', filtro:'Todos los grupos'   },
];

export default function DirectivoReportes() {
  const [mes,     setMes]     = useState(MESES[3]);
  const [filtro,  setFiltro]  = useState(FILTROS[0]);
  const [buscar,  setBuscar]  = useState('');

  const filtrados = DESCARGAS.filter(d =>
    d.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <>
      {/* Generar informe */}
      <div className="dark-card">
        <div className="dark-card-title">Generar Informe</div>

        <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:4 }}>Filtrar por Mes:</div>
        <select className="dark-select" value={mes} onChange={e => setMes(e.target.value)}>
          {MESES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:4 }}>Filtrar por:</div>
        <select className="dark-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          {FILTROS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <button
          onClick={() => alert(`📄 Generando: ${filtro} — ${mes}\nDescargando PDF...`)}
          className="dark-btn dark-btn-green"
          style={{ width:'100%' }}>
          Generar PDF
        </button>
      </div>

      {/* Descargas recientes */}
      <div className="dark-card">
        <div className="dark-card-title">Descargas Recientes</div>
        <input
          className="dark-input"
          placeholder="🔍 Buscar reporte por nombre..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          style={{ marginBottom:10 }}
        />
        {filtrados.map((d, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            background:'var(--dark-card)', borderRadius:8,
            border:'1px solid var(--dark-border)', marginBottom:6, cursor:'pointer',
          }}
          onClick={() => alert(`Descargando: ${d.nombre}`)}>
            <span style={{ fontSize:20 }}>📄</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--dark-text)' }}>{d.nombre}</div>
              <div style={{ fontSize:10, color:'var(--dark-muted)' }}>{d.fecha} · {d.filtro}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:'#F85149', flexShrink:0 }}>PDF</span>
          </div>
        ))}
      </div>
    </>
  );
}
