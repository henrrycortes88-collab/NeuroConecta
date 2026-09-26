import React, { useState } from 'react';

const ROLES_OPCIONES = ['Maestro','Paciente','Doctor','Cuidador','Director','Enfermero'];

const ROLE_COLOR = {
  Maestro:   { bg:'rgba(46,160,67,.15)',   color:'#2EA043',  label:'Maestro'   },
  Paciente:  { bg:'rgba(139,92,246,.15)',  color:'#8B5CF6',  label:'Paciente'  },
  Doctor:    { bg:'rgba(31,111,235,.15)',  color:'#58A6FF',  label:'Doctor'    },
  Cuidador:  { bg:'rgba(45,207,179,.15)',  color:'#2DCFB3',  label:'Cuidador'  },
  Director:  { bg:'rgba(245,158,11,.15)',  color:'#F59E0B',  label:'Director'  },
  Enfermero: { bg:'rgba(248,81,73,.15)',   color:'#F85149',  label:'Enfermero' },
};

const USUARIOS_INIT = [
  { id:1, nombre:'María González',   email:'maria@neuroauds.com',  rol:'Maestro',   estado:'Activo'   },
  { id:2, nombre:'Juan Pérez',       email:'juan@neuroauds.com',   rol:'Paciente',  estado:'Activo'   },
  { id:3, nombre:'Dra. Ana López',   email:'ana@neuroauds.com',    rol:'Doctor',    estado:'Activo'   },
  { id:4, nombre:'Laura Martínez',   email:'laura@neuroauds.com',  rol:'Cuidador',  estado:'Activo'   },
  { id:5, nombre:'Carlos Ramírez',   email:'carlos@neuroauds.com', rol:'Director',  estado:'Inactivo' },
  { id:6, nombre:'Enf. Pedro Silva', email:'pedro@neuroauds.com',  rol:'Enfermero', estado:'Activo'   },
  { id:7, nombre:'Lucía Torres',     email:'lucia@neuroauds.com',  rol:'Maestro',   estado:'Inactivo' },
  { id:8, nombre:'Diego Herrera',    email:'diego@neuroauds.com',  rol:'Paciente',  estado:'Activo'   },
];

export default function AdminDarkUsuarios() {
  const [usuarios, setUsuarios]   = useState(USUARIOS_INIT);
  const [buscar,   setBuscar]     = useState('');
  const [filtroRol,setFiltroRol]  = useState('Todos');
  const [showForm, setShowForm]   = useState(false);
  const [nuevo,    setNuevo]      = useState({ nombre:'', email:'', rol:'Maestro' });

  const filtrados = usuarios.filter(u => {
    const matchBuscar = u.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
                        u.email.toLowerCase().includes(buscar.toLowerCase());
    const matchRol    = filtroRol === 'Todos' || u.rol === filtroRol;
    return matchBuscar && matchRol;
  });

  const toggleEstado = (id) =>
    setUsuarios(us => us.map(u =>
      u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
    ));

  const cambiarRol = (id, nuevoRol) =>
    setUsuarios(us => us.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));

  const eliminar = (id) => {
    if (window.confirm('¿Eliminar este usuario?'))
      setUsuarios(us => us.filter(u => u.id !== id));
  };

  const agregar = () => {
    if (!nuevo.nombre || !nuevo.email) return;
    setUsuarios(us => [...us, {
      id: Date.now(),
      nombre: nuevo.nombre,
      email:  nuevo.email,
      rol:    nuevo.rol,
      estado: 'Activo',
    }]);
    setNuevo({ nombre:'', email:'', rol:'Maestro' });
    setShowForm(false);
    alert('✅ Usuario agregado correctamente');
  };

  return (
    <>
      {/* Barra de búsqueda */}
      <input className="dark-input"
        placeholder="🔍 Buscar usuario por nombre o email..."
        value={buscar} onChange={e => setBuscar(e.target.value)}/>

      {/* Filtro por rol */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, marginBottom:8 }}>
        {['Todos',...ROLES_OPCIONES].map(r => (
          <button key={r}
            onClick={() => setFiltroRol(r)}
            style={{ background: filtroRol===r ? '#1F6FEB' : 'var(--dark-card)',
              color: filtroRol===r ? 'white' : 'var(--dark-muted)',
              border:'1px solid var(--dark-border)', borderRadius:6,
              padding:'4px 12px', fontSize:11, fontWeight:700, whiteSpace:'nowrap',
              cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
            {r}
          </button>
        ))}
      </div>

      {/* Botón agregar */}
      <button onClick={() => setShowForm(f => !f)}
        className="dark-btn dark-btn-green"
        style={{ width:'100%', marginBottom:8, display:'flex',
          alignItems:'center', justifyContent:'center', gap:6 }}>
        + Agregar Usuario
      </button>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="dark-card" style={{ border:'1px solid var(--dark-green)', marginBottom:8 }}>
          <div className="dark-card-title">Nuevo usuario</div>
          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Nombre</div>
          <input className="dark-input" placeholder="Nombre completo"
            value={nuevo.nombre} onChange={e => setNuevo(n=>({...n, nombre:e.target.value}))}/>
          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Email</div>
          <input className="dark-input" type="email" placeholder="correo@ejemplo.com"
            value={nuevo.email} onChange={e => setNuevo(n=>({...n, email:e.target.value}))}/>
          <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:3 }}>Rol</div>
          <select className="dark-select" value={nuevo.rol}
            onChange={e => setNuevo(n=>({...n, rol:e.target.value}))}>
            {ROLES_OPCIONES.map(r => <option key={r}>{r}</option>)}
          </select>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={agregar} className="dark-btn dark-btn-green" style={{ flex:1 }}>Guardar</button>
            <button onClick={() => setShowForm(false)} className="dark-btn dark-btn-ghost" style={{ flex:1 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div style={{ fontSize:11, color:'var(--dark-muted)', marginBottom:6 }}>
        {filtrados.length} usuarios encontrados
      </div>

      {filtrados.map(u => {
        const rc = ROLE_COLOR[u.rol] || { bg:'rgba(255,255,255,.1)', color:'var(--dark-muted)' };
        return (
          <div key={u.id} className="dark-card" style={{ marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:'50%',
                background: rc.bg, color: rc.color,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:16, flexShrink:0 }}>
                {u.nombre.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap',
                  overflow:'hidden', textOverflow:'ellipsis' }}>{u.nombre}</div>
                <div style={{ fontSize:10, color:'var(--dark-muted)', whiteSpace:'nowrap',
                  overflow:'hidden', textOverflow:'ellipsis' }}>{u.email}</div>
              </div>
              <span className={`dark-badge ${u.estado==='Activo'?'dark-badge-green':'dark-badge-red'}`}>
                {u.estado}
              </span>
            </div>

            {/* Cambiar rol */}
            <div style={{ marginTop:10, display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, color:'var(--dark-muted)', flexShrink:0 }}>Rol:</span>
              <select
                value={u.rol}
                onChange={e => cambiarRol(u.id, e.target.value)}
                style={{ flex:1, background:'var(--dark-card)', border:'1px solid var(--dark-border)',
                  borderRadius:6, padding:'4px 8px', color:'var(--dark-text)',
                  fontSize:11, fontFamily:"'Nunito',sans-serif", cursor:'pointer' }}>
                {ROLES_OPCIONES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Acciones */}
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <button onClick={() => toggleEstado(u.id)}
                className={`dark-btn ${u.estado==='Activo'?'dark-btn-ghost':'dark-btn-green'}`}
                style={{ flex:1, padding:'6px', fontSize:11 }}>
                {u.estado==='Activo' ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => eliminar(u.id)}
                className="dark-btn dark-btn-red"
                style={{ flex:1, padding:'6px', fontSize:11 }}>
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
