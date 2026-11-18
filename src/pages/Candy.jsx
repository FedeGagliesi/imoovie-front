// Candy (ruta pública "/candy"): la tienda de candy, como en la web del cine.
//
// Cualquiera puede ver los productos. Para pedir hay que ser cliente con sesión: si no,
// el botón lleva a ingresar. El pedido se crea igual que en "Mis pedidos" (crearPedido),
// así aparece en la zona del cliente y en el panel del admin.

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { obtenerProductos } from '../data/candy'
import { obtenerEntradas, funcionesConEntradas } from '../data/entradas'
import { obtenerSesion } from '../data/sesion'
import { crearPedido, horarioRetiroFuturo } from '../data/pedidos'
import { formatearPrecio } from '../data/formato'
import PasoCandy from '../components/compra/PasoCandy'

const MAX_POR_PRODUCTO = 10

function Candy() {
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const esCliente = sesion?.rol === 'cliente'

  const productos = obtenerProductos().filter((p) => p.activo)
  const [cantidades, setCantidades] = useState({})
  const [horario, setHorario] = useState('')
  const [entradaId, setEntradaId] = useState('')
  const [error, setError] = useState('')
  const [confirmado, setConfirmado] = useState(null) // número del pedido recién creado

  const lineas = productos
    .filter((p) => (cantidades[p.id] || 0) > 0)
    .map((p) => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: cantidades[p.id] }))
  const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0)

  // Solo se asocian entradas vigentes del propio cliente.
  const funcionesDelCliente = esCliente ? funcionesConEntradas(sesion.usuario, obtenerEntradas()) : []

  function handleCambiar(id, cambio) {
    const actual = cantidades[id] || 0
    setCantidades({ ...cantidades, [id]: Math.min(MAX_POR_PRODUCTO, Math.max(0, actual + cambio)) })
    setError('')
  }

  function handlePedir() {
    if (!esCliente) {
      navigate('/login')
      return
    }
    if (lineas.length === 0) {
      setError('Elegí al menos un producto.')
      return
    }
    if (!horarioRetiroFuturo(horario)) {
      setError('Elegí un horario de retiro futuro.')
      return
    }
    const numero = crearPedido({
      usuario: sesion.usuario,
      lineas,
      horarioRetiro: horario,
      entradaId: entradaId === '' ? null : Number(entradaId),
    })
    setConfirmado(numero)
    setCantidades({})
    setHorario('')
    setEntradaId('')
    setError('')
  }

  if (confirmado) {
    return (
      <section className="contenedor-compra">
        <h1 className="titulo-seccion">Pedido confirmado</h1>
        <p role="status" className="comprobante-numero">Pedido Nº {confirmado}</p>
        <p>Lo retirás en el horario que elegiste. Podés ver el detalle en tus pedidos.</p>
        <div className="hero-acciones">
          <button type="button" className="boton" onClick={() => navigate('/cliente')}>Ver mis pedidos</button>
          <button type="button" className="boton boton-secundario" onClick={() => setConfirmado(null)}>Hacer otro pedido</button>
        </div>
      </section>
    )
  }

  return (
    <div className="compra-layout">
      <div className="compra-principal">
        <h1 className="titulo-seccion">Candy</h1>
        <PasoCandy
          productos={productos}
          cantidades={cantidades}
          onCambiar={handleCambiar}
          texto="Elegí tus productos y el horario en el que querés retirarlos."
        />
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <aside className="resumen-compra" aria-label="Resumen del pedido de candy">
        <h2 className="resumen-titulo">Tu pedido</h2>

        <section className="resumen-bloque">
          {lineas.length === 0 ? (
            <p className="resumen-linea">Todavía no agregaste productos.</p>
          ) : (
            lineas.map((l) => (
              <p key={l.id} className="resumen-linea">
                {l.cantidad} × {l.nombre} <span className="resumen-monto">{formatearPrecio(l.precio * l.cantidad)}</span>
              </p>
            ))
          )}
          <p className="resumen-linea"><strong>Total {formatearPrecio(total)}</strong></p>
        </section>

        {esCliente ? (
          <section className="resumen-bloque">
            <div className="campo">
              <label htmlFor="candy-horario">Horario de retiro</label>
              <input id="candy-horario" type="datetime-local" value={horario} onChange={(e) => setHorario(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="candy-entrada">Asociar a una función a la que vas (opcional)</label>
              <select id="candy-entrada" value={entradaId} onChange={(e) => setEntradaId(e.target.value)}>
                <option value="">Sin función</option>
                {funcionesDelCliente.map((op) => (
                  <option key={op.funcionId} value={op.entradaId}>
                    {op.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="boton" disabled={lineas.length === 0} onClick={handlePedir}>
              Hacer el pedido
            </button>
          </section>
        ) : (
          <section className="resumen-bloque">
            <p className="resumen-linea">Para pedir candy necesitás una cuenta de cliente.</p>
            <button type="button" className="boton" onClick={handlePedir}>Ingresar para pedir</button>
            <p className="resumen-linea">
              ¿No tenés cuenta? <Link to="/login" className="enlace-texto">Crear cuenta</Link>
            </p>
          </section>
        )}
      </aside>
    </div>
  )
}

export default Candy
