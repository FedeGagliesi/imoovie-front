// Mostrador del vendedor (ruta "/vendedor")
//
// Es un CONTENEDOR con dos pestañas, como la zona del cliente y el panel admin:
//   - "Vender entradas"   → MostradorEntradas: vende entradas a quien llega al cine (Parte 15)
//   - "Candy y pedidos"   → MostradorCandy: vende candy y entrega los pedidos online
//
// La SUCURSAL en la que trabaja el vendedor se elige acá, arriba de todo, porque
// las dos pestañas la necesitan. Es el mismo truco de "levantar el estado": el
// estado vive en el padre común y se baja a cada hijo por props.

import { useState } from 'react'
import { obtenerSesion } from '../data/sesion'
import { obtenerSucursales } from '../data/sucursales'
import MostradorEntradas from '../components/vendedor/MostradorEntradas'
import MostradorCandy from '../components/vendedor/MostradorCandy'

function Vendedor() {
  const sesion = obtenerSesion()

  // Se trabaja solo en sucursales activas.
  const sucursalesActivas = obtenerSucursales().filter((s) => s.activa)

  const [sucursalId, setSucursalId] = useState(sucursalesActivas[0].id)
  const [vista, setVista] = useState('entradas')

  return (
    <>
      <h1>Mostrador</h1>
      <p>
        Hola, {sesion.nombre || sesion.usuario}. Vendé entradas y candy, y entregá los pedidos online.
      </p>

      <div className="campo campo-filtro">
        <label htmlFor="vendedor-sucursal">Sucursal en la que trabajás</label>
        <select
          id="vendedor-sucursal"
          value={sucursalId}
          onChange={(e) => setSucursalId(Number(e.target.value))}
        >
          {sucursalesActivas.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="pestanas" role="group" aria-label="Secciones del mostrador">
        <button
          type="button"
          className="pestana"
          aria-pressed={vista === 'entradas'}
          onClick={() => setVista('entradas')}
        >
          Vender entradas
        </button>
        <button
          type="button"
          className="pestana"
          aria-pressed={vista === 'candy'}
          onClick={() => setVista('candy')}
        >
          Candy y pedidos
        </button>
      </div>

      {/* "hidden" oculta una pestaña sin destruirla: así una venta a medio armar
          no se pierde al mirar la otra. Y "key={sucursalId}" hace lo contrario
          cuando conviene: al cambiar de sucursal la key cambia, React crea el
          componente de nuevo y la venta arranca vacía (las funciones y butacas
          de una sucursal no sirven en otra). */}
      <div hidden={vista !== 'entradas'}>
        <MostradorEntradas key={sucursalId} sucursalId={sucursalId} />
      </div>
      <div hidden={vista !== 'candy'}>
        <MostradorCandy key={sucursalId} sucursalId={sucursalId} />
      </div>
    </>
  )
}

export default Vendedor
