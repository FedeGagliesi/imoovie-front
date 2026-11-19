// Pestaña "Reportes" del panel de administración. Espeja /api/admin/reportes:
//   - Ranking por ventas: películas activas por entradas vendidas (las que no vendieron aparecen con 0).
//   - Ranking por calificación: películas con al menos una calificación.
//   - Alertas de poca venta: funciones activas con menos entradas que el umbral (por defecto 5).
//   - Panel de candy: pedidos pendientes agrupados por horario de retiro, con la recaudación esperada.
//
// Cada entrada emitida cuenta como una venta.

import { useState } from 'react'
import { obtenerEntradas, promedioPelicula } from '../../data/entradas'
import { obtenerFunciones, inicioFuncion } from '../../data/funciones'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSalas } from '../../data/salas'
import { obtenerSucursales } from '../../data/sucursales'
import { obtenerPedidos, montoTotalPedido } from '../../data/pedidos'
import { formatearPrecio, formatearFechaHora, fechaHoraMs } from '../../data/formato'

const UMBRAL_POR_DEFECTO = 5

function AdminReportes() {
  const entradas = obtenerEntradas()
  const funciones = obtenerFunciones()
  const peliculas = obtenerPeliculas()
  const salas = obtenerSalas()
  const sucursales = obtenerSucursales()
  const pedidos = obtenerPedidos()

  const [umbralTexto, setUmbralTexto] = useState(String(UMBRAL_POR_DEFECTO))

  // Entradas vendidas, por función.
  const vendidasPorFuncion = new Map()
  entradas.forEach((e) => vendidasPorFuncion.set(e.funcionId, (vendidasPorFuncion.get(e.funcionId) || 0) + 1))

  // 1) Ranking por ventas: suma las entradas de todas las funciones de cada película.
  const rankingVentas = peliculas
    .filter((p) => p.activa)
    .map((p) => {
      const total = funciones
        .filter((f) => f.peliculaId === p.id)
        .reduce((suma, f) => suma + (vendidasPorFuncion.get(f.id) || 0), 0)
      return { id: p.id, titulo: p.titulo, total }
    })
    .sort((a, b) => b.total - a.total)

  // 2) Ranking por calificación: solo las películas con promedio mayor a 0.
  const rankingCalificacion = peliculas
    .filter((p) => p.activa)
    .map((p) => ({ id: p.id, titulo: p.titulo, promedio: promedioPelicula(p.id, entradas, funciones) }))
    .filter((p) => p.promedio > 0)
    .sort((a, b) => b.promedio - a.promedio)

  // 3) Alertas: funciones activas que venden menos que el umbral, de menor a mayor venta.
  const umbral = Number(umbralTexto)
  const limite = Number.isInteger(umbral) && umbral > 0 ? umbral : UMBRAL_POR_DEFECTO
  const alertas = funciones
    .filter((f) => f.activa)
    .map((f) => {
      const sala = salas.find((s) => s.id === f.salaId)
      return {
        funcion: f,
        pelicula: peliculas.find((p) => p.id === f.peliculaId),
        sala,
        sucursal: sucursales.find((s) => s.id === sala?.sucursalId),
        vendidas: vendidasPorFuncion.get(f.id) || 0,
        capacidad: sala ? sala.butacas.length : 0,
      }
    })
    .filter((a) => a.vendidas < limite)
    .sort((a, b) => a.vendidas - b.vendidas)

  // 4) Panel de candy: pedidos pendientes agrupados por horario de retiro.
  const pendientes = pedidos.filter((p) => !p.retirado && !p.cancelado)
  const recaudacionEsperada = pendientes.reduce((suma, p) => suma + montoTotalPedido(p), 0)
  const porHorario = new Map()
  pendientes
    .sort((a, b) => fechaHoraMs(a.horarioRetiro.slice(0, 10), a.horarioRetiro.slice(11)) - fechaHoraMs(b.horarioRetiro.slice(0, 10), b.horarioRetiro.slice(11)))
    .forEach((p) => {
      if (!porHorario.has(p.horarioRetiro)) porHorario.set(p.horarioRetiro, [])
      porHorario.get(p.horarioRetiro).push(p)
    })

  return (
    <>
      <section aria-labelledby="titulo-ranking-ventas">
        <h2 id="titulo-ranking-ventas" className="titulo-paso">Ranking por ventas</h2>
        {rankingVentas.length === 0 ? (
          <p>No hay películas activas.</p>
        ) : (
          <div className="tabla-contenedor" role="region" aria-labelledby="titulo-ranking-ventas" tabIndex={0}>
            <table className="tabla">
              <caption className="solo-lectores">Películas ordenadas por entradas vendidas</caption>
              <thead>
                <tr>
                  <th scope="col">Película</th>
                  <th scope="col">Entradas vendidas</th>
                </tr>
              </thead>
              <tbody>
                {rankingVentas.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.titulo}</th>
                    <td>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-ranking-calificacion">
        <h2 id="titulo-ranking-calificacion" className="titulo-paso historial-titulo">Ranking por calificación</h2>
        {rankingCalificacion.length === 0 ? (
          <p>Todavía no hay películas calificadas.</p>
        ) : (
          <div className="tabla-contenedor" role="region" aria-labelledby="titulo-ranking-calificacion" tabIndex={0}>
            <table className="tabla">
              <caption className="solo-lectores">Películas ordenadas por calificación promedio</caption>
              <thead>
                <tr>
                  <th scope="col">Película</th>
                  <th scope="col">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {rankingCalificacion.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.titulo}</th>
                    <td>★ {r.promedio.toLocaleString('es-AR')} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-alertas">
        <h2 id="titulo-alertas" className="titulo-paso historial-titulo">Alertas de poca venta</h2>
        <p className="resultado-datos">
          Funciones activas con menos de {limite} entradas vendidas. Sirven para decidir si conviene reprogramarlas o darlas de baja.
        </p>
        <div className="campo campo-filtro">
          <label htmlFor="alerta-umbral">Umbral de entradas</label>
          <input
            id="alerta-umbral"
            type="number"
            min="1"
            value={umbralTexto}
            onChange={(e) => setUmbralTexto(e.target.value)}
          />
        </div>

        {alertas.length === 0 ? (
          <p>No hay funciones con poca venta.</p>
        ) : (
          <div className="tabla-contenedor" role="region" aria-labelledby="titulo-alertas" tabIndex={0}>
            <table className="tabla">
              <caption className="solo-lectores">Funciones con poca venta</caption>
              <thead>
                <tr>
                  <th scope="col">Película</th>
                  <th scope="col">Sucursal y sala</th>
                  <th scope="col">Horario</th>
                  <th scope="col">Vendidas</th>
                  <th scope="col">Capacidad</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => (
                  <tr key={a.funcion.id}>
                    <th scope="row">{a.pelicula?.titulo ?? 'Película retirada'}</th>
                    <td>{a.sucursal?.nombre ?? ''} · {a.sala?.nombre ?? ''}</td>
                    <td>{formatearFechaHora(inicioFuncion(a.funcion))}</td>
                    <td>{a.vendidas}</td>
                    <td>{a.capacidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-panel-candy">
        <h2 id="titulo-panel-candy" className="titulo-paso historial-titulo">Panel de candy</h2>
        <p className="seleccion-resumen">
          {pendientes.length} {pendientes.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'} · Recaudación esperada{' '}
          {formatearPrecio(recaudacionEsperada)}
        </p>

        {porHorario.size === 0 ? (
          <p>No hay pedidos de candy pendientes.</p>
        ) : (
          [...porHorario.entries()].map(([horario, lista]) => (
            <article key={horario} className="formulario-accion" aria-label={`Retiros a las ${horario}`}>
              <h3>
                {formatearFechaHora(fechaHoraMs(horario.slice(0, 10), horario.slice(11)))}
              </h3>
              <ul className="resumen-candy">
                {lista.map((p) => (
                  <li key={p.id}>
                    {p.cantidad} × {p.nombre} · {formatearPrecio(montoTotalPedido(p))} · {p.usuario ?? 'Sin asignar'}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </>
  )
}

export default AdminReportes
