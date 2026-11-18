// Pestaña "Candy y pedidos" del mostrador del vendedor.
//
// Dos bloques:
//   1) Venta de candy en el mostrador, sin cuenta de cliente (función propia de la
//      interfaz; el backend no tiene venta de candy en mostrador).
//   2) Pedidos online pendientes de retiro (solo lectura). Como en el backend, el
//      retiro se registra desde el panel de administración: PUT /api/admin/candy/pedidos/{id}/retirar.
//
// Todo se guarda en localStorage para que no se pierda al cambiar de página.

import { useState } from 'react'
import { obtenerProductos } from '../../data/candy'
import { obtenerPedidos, montoTotalPedido } from '../../data/pedidos'
import { obtenerVentas, guardarVentas, MEDIOS_PAGO } from '../../data/ventas'
import { formatearPrecio, formatearFechaHora, formatearHora, esHoy, ahora, fechaHoraMs } from '../../data/formato'
import ProductoCandy from '../ProductoCandy'

const MAX_POR_PRODUCTO = 10

function MostradorCandy({ sucursalId }) {
  // Solo se venden los productos activos del catálogo.
  const productos = obtenerProductos().filter((p) => p.activo)

  // La venta actual es un objeto { idProducto: cantidad }, igual que el candy del cliente.
  const [carrito, setCarrito] = useState({})
  const [ventas, setVentas] = useState(() => obtenerVentas())
  const [pago, setPago] = useState(MEDIOS_PAGO[0])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Pedidos online que todavía no se retiraron (de todas las sucursales, como el backend).
  const pendientes = obtenerPedidos()
    .filter((p) => !p.retirado && !p.cancelado)
    .sort((a, b) => fechaHoraMs(a.horarioRetiro.slice(0, 10), a.horarioRetiro.slice(11)) - fechaHoraMs(b.horarioRetiro.slice(0, 10), b.horarioRetiro.slice(11)))

  // DATOS DERIVADOS (se calculan en cada render, no se guardan con useState)
  const lineas = productos
    .filter((p) => (carrito[p.id] || 0) > 0)
    .map((p) => ({ ...p, cantidad: carrito[p.id] }))
  const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0)

  // Ventas de ESTA sucursal y de HOY
  const ventasHoy = ventas.filter((v) => v.sucursalId === sucursalId && esHoy(v.fecha))
  const recaudadoHoy = ventasHoy.reduce((suma, v) => suma + v.total, 0)

  function handleCambiar(productoId, cambio) {
    const actual = carrito[productoId] || 0
    const nueva = Math.min(MAX_POR_PRODUCTO, Math.max(0, actual + cambio))
    setCarrito({ ...carrito, [productoId]: nueva })
    setError('')
    setMensaje('')
  }

  function handleRegistrar(e) {
    e.preventDefault()

    if (lineas.length === 0) {
      setError('Agregá al menos un producto a la venta.')
      return
    }

    const momento = ahora()
    const venta = {
      id: momento,
      fecha: momento,
      sucursalId,
      pago,
      total,
      // Guardamos una copia de nombre, cantidad y precio: si el precio cambia
      // mañana, esta venta tiene que seguir mostrando lo que se cobró hoy.
      lineas: lineas.map((l) => ({ nombre: l.nombre, cantidad: l.cantidad, precio: l.precio })),
    }

    const nuevas = [venta, ...ventas] // la más nueva primero
    setVentas(nuevas)
    guardarVentas(nuevas)

    setMensaje(`Venta registrada: ${formatearPrecio(total)} (${pago}).`)
    setCarrito({})
    setError('')
  }

  function handleVaciar() {
    setCarrito({})
    setError('')
    setMensaje('')
  }

  return (
    <>
      {/* Dos columnas en pantallas anchas (productos | venta actual);
          en celular se apilan una debajo de la otra. */}
      <div className="dos-columnas">
        <section aria-labelledby="titulo-productos">
          <h2 id="titulo-productos" className="titulo-paso">Productos</h2>
          <ul className="lista-candy">
            {productos.map((p) => (
              <ProductoCandy
                key={p.id}
                producto={p}
                cantidad={carrito[p.id] || 0}
                onCambiar={handleCambiar}
              />
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-venta" className="venta-actual">
          <h2 id="titulo-venta" className="titulo-paso">Venta actual</h2>

          <form onSubmit={handleRegistrar} noValidate>
            {lineas.length === 0 ? (
              <p>Todavía no agregaste productos.</p>
            ) : (
              <ul className="resumen-candy sin-vinetas">
                {lineas.map((l) => (
                  <li key={l.id}>
                    {l.cantidad} × {l.nombre} = {formatearPrecio(l.precio * l.cantidad)}
                  </li>
                ))}
              </ul>
            )}

            <p className="total-venta" aria-live="polite">
              Total: {formatearPrecio(total)}
            </p>

            <div className="campo">
              <label htmlFor="pago">Medio de pago</label>
              <select id="pago" value={pago} onChange={(e) => setPago(e.target.value)}>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {mensaje && <p role="status">{mensaje}</p>}

            <div className="hero-acciones">
              <button type="submit" className="boton">Registrar venta</button>
              <button type="button" className="boton-texto" onClick={handleVaciar}>
                Vaciar
              </button>
            </div>
          </form>
        </section>
      </div>

      <section aria-labelledby="titulo-pedidos">
        <h2 id="titulo-pedidos" className="titulo-paso historial-titulo">Pedidos online pendientes de retiro</h2>

        <p className="seleccion-resumen" aria-live="polite">
          {pendientes.length} {pendientes.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
        </p>
        <p className="resultado-datos">El retiro lo registra el administrador desde el panel de candy.</p>

        {pendientes.length === 0 ? (
          <p>No hay pedidos de candy pendientes.</p>
        ) : (
          <ul className="historial">
            {pendientes.map((p) => (
              <li key={p.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>{p.cantidad} × {p.nombre}</strong>
                  <span>Cliente {p.usuario}</span>
                </div>
                <p className="historial-comentario">
                  Retiro: {formatearFechaHora(fechaHoraMs(p.horarioRetiro.slice(0, 10), p.horarioRetiro.slice(11)))}
                </p>
                <div className="historial-pie">
                  <span>Total {formatearPrecio(montoTotalPedido(p))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-ventas">
        <h2 id="titulo-ventas" className="titulo-paso historial-titulo">Ventas de candy de hoy</h2>

        <p className="seleccion-resumen">
          {ventasHoy.length} {ventasHoy.length === 1 ? 'venta' : 'ventas'} · Recaudado{' '}
          {formatearPrecio(recaudadoHoy)}
        </p>

        {ventasHoy.length === 0 ? (
          <p>Todavía no hay ventas de candy registradas hoy en esta sucursal.</p>
        ) : (
          <ul className="historial">
            {ventasHoy.map((v) => (
              <li key={v.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>
                    {formatearHora(v.fecha)} · {v.pago}
                  </strong>
                  <strong>{formatearPrecio(v.total)}</strong>
                </div>
                <p className="historial-comentario">
                  {v.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default MostradorCandy
