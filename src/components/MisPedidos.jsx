// "Mis pedidos de candy" de la zona cliente. Espeja POST /api/cliente/candy/pedidos
// y GET /api/cliente/candy/mis-pedidos del backend.
//
// Cada pedido es UNA tarjeta, con todas sus líneas. El botón "Ver detalle" despliega
// el detalle: cada producto con su precio, el retiro, la entrada asociada y el total.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerPedidos, montoTotalPedido, msDeRetiro } from '../data/pedidos'
import { obtenerEntradas } from '../data/entradas'
import { obtenerFunciones, etiquetaFuncion } from '../data/funciones'
import { obtenerSesion } from '../data/sesion'
import { formatearFechaHora, formatearPrecio } from '../data/formato'

// Agrupa las líneas por número de pedido. Los pedidos viejos (sin número) se agrupan
// por fecha del pedido y entrada, porque una misma compra comparte esos datos.
function agruparPedidos(lineas) {
  const grupos = []
  lineas.forEach((p) => {
    const clave = p.numeroPedido ?? `anterior-${p.fechaPedido}-${p.entradaId}`
    let grupo = grupos.find((g) => g.clave === clave)
    if (!grupo) {
      grupo = { clave, numeroPedido: p.numeroPedido, lineas: [] }
      grupos.push(grupo)
    }
    grupo.lineas.push(p)
  })
  return grupos
}

function MisPedidos() {
  const sesion = obtenerSesion()
  const email = sesion ? sesion.usuario : ''

  // Se relee el almacenamiento en cada render.
  const misLineas = obtenerPedidos()
    .filter((p) => p.usuario === email)
    .sort((a, b) => msDeRetiro(a.horarioRetiro) - msDeRetiro(b.horarioRetiro))
  const grupos = agruparPedidos(misLineas)

  const funciones = obtenerFunciones()

  const [detallesAbiertos, setDetallesAbiertos] = useState([]) // claves de pedidos con detalle visible

  function toggleDetalle(clave) {
    setDetallesAbiertos((abiertos) =>
      abiertos.includes(clave) ? abiertos.filter((c) => c !== clave) : [...abiertos, clave],
    )
  }

  // Función a la que está asociado el pedido (la de la entrada guardada).
  function textoFuncion(entradaId) {
    const entrada = obtenerEntradas().find((e) => e.id === entradaId)
    if (!entrada) return 'Sin función asociada'
    const funcion = funciones.find((f) => f.id === entrada.funcionId)
    return funcion ? `Función: ${etiquetaFuncion(funcion)}` : 'Sin función asociada'
  }

  return (
    <>
      <p className="enlace-volver">
        ¿Querés pedir más candy? <Link to="/candy" className="enlace-texto">Ir a la tienda de Candy</Link>
      </p>

      <section aria-labelledby="titulo-mis-pedidos">
        <h2 id="titulo-mis-pedidos" className="titulo-paso historial-titulo">Mis pedidos</h2>

        {grupos.length === 0 ? (
          <p>Todavía no tenés pedidos de candy.</p>
        ) : (
          <ul className="lista-compras">
            {grupos.map((grupo) => {
              const primera = grupo.lineas[0]
              const total = grupo.lineas.reduce((suma, l) => suma + montoTotalPedido(l), 0)
              const retirados = grupo.lineas.filter((l) => l.retirado).length
              const canceladas = grupo.lineas.filter((l) => l.cancelado).length
              const estado = canceladas === grupo.lineas.length ? 'Cancelado' : retirados === grupo.lineas.length ? 'Retirado' : retirados === 0 ? 'Pendiente' : 'Retiro parcial'
              const abierto = detallesAbiertos.includes(grupo.clave)
              const titulo = grupo.numeroPedido ? `Pedido ${grupo.numeroPedido}` : 'Pedido'

              return (
                <li key={grupo.clave} className="compra-tarjeta">
                  <div className="compra-cabecera-tarjeta">
                    <div>
                      <h3 className="compra-titulo">{titulo}</h3>
                      <p className="compra-detalle">
                        Retiro: {formatearFechaHora(msDeRetiro(primera.horarioRetiro))}
                      </p>
                    </div>
                    <span className={`estado ${estado === 'Retirado' ? 'estado-activa' : 'estado-baja'}`}>{estado}</span>
                  </div>

                  <ul className="butacas-compra" aria-label="Productos del pedido">
                    {grupo.lineas.map((l) => (
                      <li key={l.id} className="butaca-chip">
                        {l.cantidad} × {l.nombre}
                      </li>
                    ))}
                  </ul>

                  <div className="compra-acciones">
                    <strong>Total {formatearPrecio(total)}</strong>
                    <button
                      type="button"
                      className="boton-texto"
                      aria-expanded={abierto}
                      onClick={() => toggleDetalle(grupo.clave)}
                    >
                      {abierto ? 'Ocultar detalle' : 'Ver detalle'}
                    </button>
                  </div>

                  {abierto && (
                    <div className="formulario-accion detalle-pedido">
                      <dl className="resumen">
                        <dt>Número</dt>
                        <dd>{grupo.numeroPedido ?? 'Sin número (pedido anterior)'}</dd>
                        <dt>Fecha del pedido</dt>
                        <dd>{formatearFechaHora(primera.fechaPedido)}</dd>
                        <dt>Retiro</dt>
                        <dd>{formatearFechaHora(msDeRetiro(primera.horarioRetiro))}</dd>
                        <dt>Entrada asociada</dt>
                        <dd>{textoFuncion(primera.entradaId)}</dd>
                      </dl>

                      <table className="tabla">
                        <caption className="solo-lectores">Productos del pedido</caption>
                        <thead>
                          <tr>
                            <th scope="col">Producto</th>
                            <th scope="col">Precio c/u</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Subtotal</th>
                            <th scope="col">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.lineas.map((l) => (
                            <tr key={l.id}>
                              <th scope="row">{l.nombre}</th>
                              <td>{formatearPrecio(l.precioUnitario)}</td>
                              <td>{l.cantidad}</td>
                              <td>{formatearPrecio(montoTotalPedido(l))}</td>
                              <td>{l.cancelado ? 'Cancelado' : l.retirado ? 'Retirado' : 'Pendiente'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default MisPedidos
