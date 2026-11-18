// Pestaña "Mis ventas" del vendedor. Espeja GET /api/vendedor/entradas/mis-ventas:
// las entradas que emitió el vendedor que inició sesión (de cualquier sucursal).

import { obtenerEntradas, ESTADOS } from '../../data/entradas'
import { obtenerFunciones, etiquetaFuncion } from '../../data/funciones'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSalas, TIPOS_BUTACA } from '../../data/salas'
import { obtenerSesion } from '../../data/sesion'
import { formatearPrecio, formatearHora } from '../../data/formato'

function MisVentas() {
  const sesion = obtenerSesion()
  const email = sesion ? sesion.usuario : ''

  const misVentas = obtenerEntradas()
    .filter((e) => e.vendedor === email)
    .sort((a, b) => b.fechaCompra - a.fechaCompra)
  const recaudado = misVentas.reduce((suma, e) => suma + e.monto, 0)

  const funciones = obtenerFunciones()
  const peliculas = obtenerPeliculas()
  const salas = obtenerSalas()

  return (
    <section aria-labelledby="titulo-mis-ventas">
      <h2 id="titulo-mis-ventas" className="titulo-paso">Mis ventas</h2>

      <p className="seleccion-resumen">
        {misVentas.length} {misVentas.length === 1 ? 'entrada vendida' : 'entradas vendidas'} · Recaudado{' '}
        {formatearPrecio(recaudado)}
      </p>

      {misVentas.length === 0 ? (
        <p>Todavía no emitiste entradas en el mostrador.</p>
      ) : (
        <ul className="historial">
          {misVentas.map((e) => {
            const funcion = funciones.find((f) => f.id === e.funcionId)
            const pelicula = peliculas.find((p) => p.id === funcion?.peliculaId)
            const sala = salas.find((s) => s.id === funcion?.salaId)
            const tipo = sala?.butacas.find((b) => b.id === e.butaca)?.tipo ?? 'NORMAL'
            return (
              <li key={e.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>{formatearHora(e.fechaCompra)} · {e.pago}</strong>
                  <strong>{formatearPrecio(e.monto)}</strong>
                </div>
                <p className="historial-comentario">
                  {pelicula?.titulo ?? 'Película retirada'} · {funcion ? etiquetaFuncion(funcion, sala) : ''} · butaca {e.butaca} ({TIPOS_BUTACA[tipo]})
                </p>
                <p className="historial-comentario">
                  Cliente: {e.clienteMostrador} · Compra {e.numeroCompra} · {ESTADOS[e.estado]}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MisVentas
