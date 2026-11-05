// Pestaña "Candy y pedidos" del mostrador del vendedor.
//
// Dos tareas:
//   1) Vender candy en el mostrador, sin cuenta de cliente (Parte 9).
//   2) Entregar el candy que los clientes ya pidieron online al comprar su
//      entrada, y marcarlo como retirado (Parte 12).
//
// La sucursal la elige el vendedor en la página (pages/Vendedor.jsx) y llega
// por props. Reutilizamos el componente ProductoCandy que ya hicimos para el cliente.
// Todo se guarda en localStorage para que no se pierda al cambiar de página.

import { useState } from 'react'
import { obtenerProductos } from '../../data/candy'
import { obtenerCompras, guardarCompras } from '../../data/compras'
import { obtenerVentas, guardarVentas, MEDIOS_PAGO } from '../../data/ventas'
import { formatearPrecio, formatearHora, esHoy, ahora } from '../../data/formato'
import ProductoCandy from '../ProductoCandy'

const MAX_POR_PRODUCTO = 10

function MostradorCandy({ sucursalId }) {
  // Solo se venden los productos activos del catálogo.
  const productos = obtenerProductos().filter((p) => p.activo)

  // La venta actual es un objeto { idProducto: cantidad }, igual que el candy del cliente.
  const [carrito, setCarrito] = useState({})
  const [ventas, setVentas] = useState(() => obtenerVentas())
  const [compras, setCompras] = useState(() => obtenerCompras())
  const [pago, setPago] = useState(MEDIOS_PAGO[0])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mensajePedido, setMensajePedido] = useState('')

  // DATOS DERIVADOS (se calculan en cada render, no se guardan con useState)
  const lineas = productos
    .filter((p) => (carrito[p.id] || 0) > 0)
    .map((p) => ({ ...p, cantidad: carrito[p.id] }))
  const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0)

  // Ventas de ESTA sucursal y de HOY
  const ventasHoy = ventas.filter((v) => v.sucursalId === sucursalId && esHoy(v.fecha))
  const recaudadoHoy = ventasHoy.reduce((suma, v) => suma + v.total, 0)

  // Pedidos online de esta sucursal con candy que todavía no se entregó
  const pedidosPendientes = compras.filter(
    (c) => c.sucursalId === sucursalId && c.lineasCandy.length > 0 && !c.retirado,
  )

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

  // Marca un pedido online como entregado (cambia UN elemento de la lista).
  function handleRetirar(compra) {
    const nuevas = compras.map((c) => (c.id === compra.id ? { ...c, retirado: true } : c))
    setCompras(nuevas)
    guardarCompras(nuevas)
    setMensajePedido(`Pedido ${compra.numero} entregado.`)
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
        <h2 id="titulo-pedidos" className="titulo-paso historial-titulo">Pedidos online por retirar</h2>

        <p className="seleccion-resumen" aria-live="polite">
          {pedidosPendientes.length} {pedidosPendientes.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
        </p>
        {mensajePedido && <p role="status">{mensajePedido}</p>}

        {pedidosPendientes.length === 0 ? (
          <p>No hay pedidos de candy pendientes en esta sucursal.</p>
        ) : (
          <ul className="historial">
            {pedidosPendientes.map((c) => (
              <li key={c.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>{c.numero}</strong>
                  <span>
                    Comprado {formatearHora(c.fecha)} · cliente {c.usuario}
                  </span>
                </div>
                <p className="historial-comentario">
                  {c.lineasCandy.map((l) => `${l.cantidad} × ${l.nombre}`).join(', ')}
                </p>
                <div className="historial-pie">
                  <span>Candy: {formatearPrecio(c.totalCandy)}</span>
                  <button
                    type="button"
                    className="boton-texto"
                    aria-label={`Marcar como entregado el pedido ${c.numero}`}
                    onClick={() => handleRetirar(c)}
                  >
                    Marcar como entregado
                  </button>
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
