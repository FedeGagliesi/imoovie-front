// Mostrador del vendedor (ruta "/vendedor")
//
// Es un CONTENEDOR con cuatro pestañas, cada una un componente:
//   - "Vender entradas"   → MostradorEntradas (POST /api/vendedor/entradas)
//   - "Candy y pedidos"   → MostradorCandy (venta de candy y pedidos online pendientes)
//   - "Validar entrada"   → ValidarEntrada (POST .../qr/{codigo}/validar, control en la puerta)
//   - "Mis ventas"        → MisVentas (GET .../mis-ventas)
//
// La SUCURSAL en la que trabaja el vendedor se elige acá, arriba de todo, porque
// las pestañas de venta la necesitan. El estado vive en el padre común y se baja
// a cada hijo por props.

import { useState } from 'react'
import { obtenerSesion } from '../data/sesion'
import { obtenerSucursales } from '../data/sucursales'
import MostradorEntradas from '../components/vendedor/MostradorEntradas'
import MostradorCandy from '../components/vendedor/MostradorCandy'
import ValidarEntrada from '../components/vendedor/ValidarEntrada'
import MisVentas from '../components/vendedor/MisVentas'

const PESTANAS = [
  { id: 'entradas', nombre: 'Vender entradas' },
  { id: 'candy', nombre: 'Candy y pedidos' },
  { id: 'validar', nombre: 'Validar entrada' },
  { id: 'ventas', nombre: 'Mis ventas' },
]

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
        Hola, {sesion.nombre || sesion.usuario}. Vendé entradas y candy, validá el ingreso y entregá los pedidos online.
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

      {/* "hidden" oculta una pestaña sin destruirla: así una venta a medio armar
          no se pierde al mirar otra. "key={sucursalId}" hace lo contrario cuando
          conviene: al cambiar de sucursal React crea el componente de nuevo y la
          venta arranca vacía (las funciones y butacas de una sucursal no sirven en otra). */}
      <div hidden={vista !== 'entradas'}>
        <MostradorEntradas key={sucursalId} sucursalId={sucursalId} />
      </div>
      <div hidden={vista !== 'candy'}>
        <MostradorCandy key={sucursalId} sucursalId={sucursalId} />
      </div>
      <div hidden={vista !== 'validar'}>
        <ValidarEntrada />
      </div>
      <div hidden={vista !== 'ventas'}>
        <MisVentas />
      </div>
    </>
  )
}

export default Vendedor
