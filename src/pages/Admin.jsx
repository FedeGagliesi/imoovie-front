// Panel de administración (ruta "/admin")
//
// Es un CONTENEDOR con pestañas. Cada pestaña es un componente de components/admin/
// y espeja un grupo de endpoints del backend (/api/admin/**):
//   Películas · Funciones · Salas · Sucursales · Candy · Entradas · Reportes
//
// Acá mostramos SOLO el componente activo ({vista === 'x' && <Componente />}), así
// el que se abre siempre vuelve a leer los datos. Si no, "Funciones" podría ofrecer
// una película que acabás de dar de baja en la pestaña anterior.

import { useState } from 'react'
import { obtenerSesion } from '../data/sesion'
import AdminPeliculas from '../components/admin/AdminPeliculas'
import AdminFunciones from '../components/admin/AdminFunciones'
import AdminSalas from '../components/admin/AdminSalas'
import AdminSucursales from '../components/admin/AdminSucursales'
import AdminCandy from '../components/admin/AdminCandy'
import AdminEntradas from '../components/admin/AdminEntradas'
import AdminReportes from '../components/admin/AdminReportes'

// Lista de pestañas: así los botones se generan con .map() y es fácil agregar una.
const PESTANAS = [
  { id: 'peliculas', nombre: 'Películas' },
  { id: 'funciones', nombre: 'Funciones' },
  { id: 'salas', nombre: 'Salas' },
  { id: 'sucursales', nombre: 'Sucursales' },
  { id: 'candy', nombre: 'Candy' },
  { id: 'entradas', nombre: 'Entradas' },
  { id: 'reportes', nombre: 'Reportes' },
]

function Admin() {
  const sesion = obtenerSesion()
  const [vista, setVista] = useState('peliculas')

  return (
    <>
      <h1>Panel admin</h1>
      <p>Hola, {sesion.nombre || sesion.usuario}. Acá gestionás el cine.</p>

      <div className="pestanas" role="group" aria-label="Secciones del panel">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="pestana"
            aria-pressed={vista === p.id}
            onClick={() => setVista(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {vista === 'peliculas' && <AdminPeliculas />}
      {vista === 'funciones' && <AdminFunciones />}
      {vista === 'salas' && <AdminSalas />}
      {vista === 'sucursales' && <AdminSucursales />}
      {vista === 'candy' && <AdminCandy />}
      {vista === 'entradas' && <AdminEntradas />}
      {vista === 'reportes' && <AdminReportes />}
    </>
  )
}

export default Admin
