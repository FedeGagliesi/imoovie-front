// Buscador de funciones (Parte 13): el primer paso de la compra.
//
// La persona filtra por sucursal, película, día, horario, butacas libres y
// precio, y ve las funciones que cumplen. Al elegir una, pasa al mapa de butacas.
//
// Es un componente CONTROLADO por su padre (CompraEntradas): los filtros viven
// allá ("levantar el estado") y llegan por props. Así, si la persona entra al
// mapa de butacas y vuelve, sus filtros siguen como los dejó.
//   filtros:   objeto con el valor de cada filtro
//   onCambiar: función que recibe los filtros nuevos
//   onElegir:  función que recibe la función elegida

import { obtenerPeliculas } from '../data/peliculas'
import { obtenerSucursales } from '../data/sucursales'
import { obtenerFunciones, etiquetaFuncion, TOTAL_BUTACAS } from '../data/funciones'
import { formatearDia, formatearPrecio } from '../data/formato'
import {
  FILTROS_VACIOS,
  FRANJAS,
  OPCIONES_ASIENTOS,
  OPCIONES_ORDEN,
  armarResultados,
  diasDisponibles,
  filtrarResultados,
} from '../data/busqueda'

function BuscadorFunciones({ filtros, onCambiar, onElegir }) {
  const peliculas = obtenerPeliculas()
  const sucursales = obtenerSucursales()

  // 1) Todas las funciones que se pueden comprar  2) las que cumplen los filtros
  // Son datos derivados: se recalculan en cada render a partir de los filtros.
  const resultados = armarResultados({ funciones: obtenerFunciones(), peliculas, sucursales })
  const visibles = filtrarResultados(resultados, filtros)

  // Un mismo manejador para todos los filtros: el "name" de cada control dice
  // cuál cambió (el mismo patrón que en los formularios anteriores).
  function handleChange(e) {
    onCambiar({ ...filtros, [e.target.name]: e.target.value })
  }

  // ¿Hay algún filtro aplicado? (el orden no cuenta: no descarta funciones)
  const hayFiltros = Object.keys(FILTROS_VACIOS).some(
    (clave) => clave !== 'orden' && filtros[clave] !== '',
  )

  return (
    <>
      {/* role="search" avisa a los lectores de pantalla que este formulario es un buscador */}
      <form
        className="filtros-busqueda"
        role="search"
        aria-label="Buscar funciones"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="campo">
          <label htmlFor="f-sucursal">Sucursal</label>
          <select id="f-sucursal" name="sucursal" value={filtros.sucursal} onChange={handleChange}>
            <option value="">Todas</option>
            {sucursales
              .filter((s) => s.activa)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-pelicula">Película</label>
          <select id="f-pelicula" name="pelicula" value={filtros.pelicula} onChange={handleChange}>
            <option value="">Todas</option>
            {peliculas
              .filter((p) => p.activa)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-dia">Día</label>
          <select id="f-dia" name="dia" value={filtros.dia} onChange={handleChange}>
            <option value="">Todos</option>
            {diasDisponibles(resultados).map((dia) => (
              <option key={dia} value={dia}>
                {formatearDia(dia)}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-franja">Horario</label>
          <select id="f-franja" name="franja" value={filtros.franja} onChange={handleChange}>
            <option value="">Cualquiera</option>
            {FRANJAS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-asientos">Butacas libres</label>
          <select id="f-asientos" name="asientos" value={filtros.asientos} onChange={handleChange}>
            {OPCIONES_ASIENTOS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-precio">Precio máximo ($)</label>
          <input
            id="f-precio"
            name="precioMax"
            type="number"
            min="0"
            step="500"
            placeholder="Sin límite"
            value={filtros.precioMax}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label htmlFor="f-orden">Ordenar por</label>
          <select id="f-orden" name="orden" value={filtros.orden} onChange={handleChange}>
            {OPCIONES_ORDEN.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.nombre}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="resultados-cabecera">
        {/* aria-live: al cambiar un filtro, se anuncia cuántas funciones hay */}
        <p className="seleccion-resumen" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? 'función encontrada' : 'funciones encontradas'}
        </p>
        {hayFiltros && (
          <button type="button" className="boton-texto" onClick={() => onCambiar(FILTROS_VACIOS)}>
            Limpiar filtros
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p>No encontramos funciones con esos filtros. Probá con otros o limpialos.</p>
      ) : (
        <ul className="resultados">
          {visibles.map(({ funcion, pelicula, sucursal, libres }) => {
            // Cuánto de la sala está libre y qué mensaje corresponde
            const porcentaje = (libres / TOTAL_BUTACAS) * 100
            const nivel = libres === 0 ? 'agotada' : porcentaje < 25 ? 'poca' : 'ok'
            const textoLibres =
              libres === 0
                ? 'Agotada'
                : `${libres} de ${TOTAL_BUTACAS} butacas libres${nivel === 'poca' ? ' · ¡Últimas!' : ''}`

            return (
              <li key={funcion.id} className="resultado">
                <div className="resultado-info">
                  <h3>{pelicula.titulo}</h3>
                  <p className="resultado-datos">
                    {pelicula.genero} · {pelicula.duracion} min · {pelicula.clasificacion}
                  </p>
                  <p>
                    {sucursal.nombre} · {etiquetaFuncion(funcion)}
                  </p>
                </div>

                <div className="resultado-compra">
                  <p className="resultado-precio">{formatearPrecio(funcion.precio)}</p>

                  {/* La disponibilidad se dice con TEXTO y también con una barra:
                      no se depende solo del color */}
                  <div className={`disponibilidad disp-${nivel}`}>
                    <span>{textoLibres}</span>
                    <span className="barra-pista" aria-hidden="true">
                      <span className="barra" style={{ width: `${porcentaje}%` }} />
                    </span>
                  </div>

                  <button
                    type="button"
                    className="boton boton-chico"
                    disabled={libres === 0}
                    aria-label={`Elegir butacas: ${pelicula.titulo}, ${sucursal.nombre}, ${etiquetaFuncion(funcion)}`}
                    onClick={() => onElegir(funcion)}
                  >
                    Elegir butacas
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default BuscadorFunciones
