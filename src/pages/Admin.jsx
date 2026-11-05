// Panel de administración (ruta "/admin")
//
// Es un CONTENEDOR con pestañas, como la zona del cliente. Cada pestaña es
// un componente que vive en components/admin/:
//   Películas · Funciones · Sucursales · Candy
//
// DIFERENCIA con la zona del cliente: allá usamos el atributo "hidden" para
// que una compra a medio hacer NO se pierda al cambiar de pestaña. Acá hacemos
// lo contrario a propósito: mostramos SOLO el componente activo
// ({vista === 'x' && <Componente />}), así el que se abre siempre vuelve a
// leer los datos. Si no, "Funciones" podría ofrecer una película que acabás
// de dar de baja en la pestaña anterior.

import { useState } from 'react'
import { obtenerSesion } from '../data/sesion'
import AdminPeliculas from '../components/admin/AdminPeliculas'
import AdminFunciones from '../components/admin/AdminFunciones'
import AdminSucursales from '../components/admin/AdminSucursales'
import AdminCandy from '../components/admin/AdminCandy'

// Lista de pestañas: así los botones se generan con .map() y es fácil
// agregar una nueva (por ejemplo "Candy") sin repetir código.
const PESTANAS = [
  { id: 'peliculas', nombre: 'Películas' },
  { id: 'funciones', nombre: 'Funciones' },
  { id: 'sucursales', nombre: 'Sucursales' },
  { id: 'candy', nombre: 'Candy' },
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
      {vista === 'sucursales' && <AdminSucursales />}
      {vista === 'candy' && <AdminCandy />}
    </>
  )
}

export default Admin
