// Pestaña "Entradas" del panel de administración. Espeja GET /api/admin/entradas
// y GET /api/admin/entradas/{id} del backend.
//
// Lista todas las entradas vendidas, de la más reciente a la más antigua. Los filtros
// son excluyentes (como en el backend): o se filtra por función, o por película.

import { useState } from 'react'
import { obtenerEntradas, ESTADOS } from '../../data/entradas'
import { obtenerFunciones, etiquetaFuncion } from '../../data/funciones'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSalas, TIPOS_BUTACA } from '../../data/salas'
import { obtenerSucursales } from '../../data/sucursales'
import { formatearPrecio, formatearFechaHora, fechaHoraMs } from '../../data/formato'

function AdminEntradas() {
  const entradas = obtenerEntradas()
  const funciones = obtenerFunciones()
  const peliculas = obtenerPeliculas()
  const salas = obtenerSalas()
  const sucursales = obtenerSucursales()

  // Solo uno de los dos filtros puede estar activo.
  const [filtro, setFiltro] = useState({ tipo: 'ninguno', valor: '' })
  const [detalleId, setDetalleId] = useState(null)

  const filtradas = entradas
    .filter((e) => {
      if (filtro.tipo === 'funcion' && filtro.valor !== '') return e.funcionId === Number(filtro.valor)
      if (filtro.tipo === 'pelicula' && filtro.valor !== '') {
        const funcion = funciones.find((f) => f.id === e.funcionId)
        return funcion?.peliculaId === Number(filtro.valor)
      }
      return true
    })
    .sort((a, b) => b.fechaCompra - a.fechaCompra) // más reciente primero

  const tituloDe = (id) => peliculas.find((p) => p.id === id)?.titulo ?? 'Película retirada'

  // Al elegir un filtro, el otro se borra (los filtros son excluyentes).
  function cambiarFiltro(tipo, valor) {
    setFiltro({ tipo, valor })
    setDetalleId(null)
  }

  const detalle = detalleId !== null ? entradas.find((e) => e.id === detalleId) : null
  const funcionDetalle = detalle ? funciones.find((f) => f.id === detalle.funcionId) : null
  const salaDetalle = funcionDetalle ? salas.find((s) => s.id === funcionDetalle.salaId) : null
  const sucursalDetalle = salaDetalle ? sucursales.find((s) => s.id === salaDetalle.sucursalId) : null
  const tipoDetalle = salaDetalle?.butacas.find((b) => b.id === detalle?.butaca)?.tipo

  return (
    <>
      <section aria-labelledby="titulo-entradas-admin">
        <h2 id="titulo-entradas-admin" className="titulo-paso">Entradas vendidas</h2>

        <div className="filtros-busqueda">
          <div className="campo">
            <label htmlFor="ent-funcion">Filtrar por función</label>
            <select
              id="ent-funcion"
              value={filtro.tipo === 'funcion' ? filtro.valor : ''}
              onChange={(e) => cambiarFiltro('funcion', e.target.value)}
            >
              <option value="">Todas</option>
              {funciones.map((f) => (
                <option key={f.id} value={f.id}>
                  {tituloDe(f.peliculaId)} · {etiquetaFuncion(f)}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="ent-pelicula">Filtrar por película</label>
            <select
              id="ent-pelicula"
              value={filtro.tipo === 'pelicula' ? filtro.valor : ''}
              onChange={(e) => cambiarFiltro('pelicula', e.target.value)}
            >
              <option value="">Todas</option>
              {peliculas.map((p) => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="seleccion-resumen" aria-live="polite">
          {filtradas.length} {filtradas.length === 1 ? 'entrada' : 'entradas'}
        </p>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-entradas-admin" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de entradas vendidas</caption>
            <thead>
              <tr>
                <th scope="col">Compra</th>
                <th scope="col">Película</th>
                <th scope="col">Función</th>
                <th scope="col">Butaca</th>
                <th scope="col">Canal</th>
                <th scope="col">Monto</th>
                <th scope="col">Estado</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => {
                const funcion = funciones.find((f) => f.id === e.funcionId)
                return (
                  <tr key={e.id}>
                    <th scope="row">{e.numeroCompra}</th>
                    <td>{tituloDe(funcion?.peliculaId)}</td>
                    <td>{funcion ? formatearFechaHora(fechaHoraMs(funcion.fecha, funcion.hora)) : ''}</td>
                    <td>{e.butaca}</td>
                    <td>{e.canal === 'ONLINE' ? 'Online' : 'Sucursal'}</td>
                    <td>{formatearPrecio(e.monto)}</td>
                    <td>{ESTADOS[e.estado]}</td>
                    <td>
                      <button
                        type="button"
                        className="boton-texto"
                        aria-label={`Ver detalle de la entrada ${e.id}, compra ${e.numeroCompra}`}
                        onClick={() => setDetalleId(e.id)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtradas.length === 0 && <p>No hay entradas para mostrar.</p>}
      </section>

      {detalle && (
        <section className="formulario-accion" aria-labelledby="titulo-detalle-entrada">
          <h2 id="titulo-detalle-entrada" className="titulo-paso">Detalle de la entrada</h2>
          <dl className="resumen">
            <dt>Película</dt>
            <dd>{tituloDe(funcionDetalle?.peliculaId)}</dd>
            <dt>Sucursal y sala</dt>
            <dd>{sucursalDetalle?.nombre ?? ''} · {salaDetalle?.nombre ?? ''}</dd>
            <dt>Función</dt>
            <dd>{funcionDetalle ? etiquetaFuncion(funcionDetalle) : ''}</dd>
            <dt>Butaca</dt>
            <dd>{detalle.butaca} ({tipoDetalle ? TIPOS_BUTACA[tipoDetalle] : ''})</dd>
            <dt>Estado</dt>
            <dd>{ESTADOS[detalle.estado]}</dd>
            <dt>Canal</dt>
            <dd>{detalle.canal === 'ONLINE' ? 'Online' : 'Sucursal (mostrador)'}</dd>
            <dt>Cliente</dt>
            <dd>{detalle.usuario ?? detalle.clienteMostrador ?? 'Sin asignar'}</dd>
            <dt>Vendedor</dt>
            <dd>{detalle.vendedor ?? '—'}</dd>
            <dt>Monto</dt>
            <dd>{formatearPrecio(detalle.monto)}</dd>
            <dt>Calificación</dt>
            <dd>{detalle.calificacion > 0 ? `★ ${detalle.calificacion}${detalle.comentario ? ` · “${detalle.comentario}”` : ''}` : 'Sin calificar'}</dd>
            <dt>Código QR</dt>
            <dd><code>{detalle.codigoQR}</code></dd>
          </dl>
          <button type="button" className="boton boton-secundario" onClick={() => setDetalleId(null)}>
            Cerrar detalle
          </button>
        </section>
      )}
    </>
  )
}

export default AdminEntradas
