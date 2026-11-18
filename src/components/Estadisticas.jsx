// "Mis estadísticas" (el Wrapped) de la zona cliente. Espeja
// GET /api/cliente/entradas/wrapped del backend, que calcula todo a partir de las
// entradas propias:
//   - totalEntradas:        cuántas entradas tiene (incluye las canceladas, como el backend)
//   - totalGastado:         suma de lo pagado
//   - peliculasFavoritas:   títulos distintos que vio
//   - generoFavorito:       el género que más se repite ("No disponible" si no hay)
//   - calificacionPromedio: promedio de sus calificaciones (solo las que tienen)

import { obtenerEntradas } from '../data/entradas'
import { obtenerFunciones } from '../data/funciones'
import { obtenerPeliculas } from '../data/peliculas'
import { obtenerSesion } from '../data/sesion'
import { formatearPrecio } from '../data/formato'

// Calcula las estadísticas de una lista de entradas (función pura: no toca el almacenamiento).
function calcularWrapped(entradas, funciones, peliculas) {
  // Cada entrada se cruza con su función y su película para obtener el título y el género.
  const datos = entradas
    .map((e) => {
      const funcion = funciones.find((f) => f.id === e.funcionId)
      const pelicula = funcion && peliculas.find((p) => p.id === funcion.peliculaId)
      return { entrada: e, pelicula }
    })
    .filter((d) => d.pelicula)

  const totalGastado = entradas.reduce((suma, e) => suma + e.monto, 0)
  const peliculasFavoritas = [...new Set(datos.map((d) => d.pelicula.titulo))]

  // Cuenta cuántas veces aparece cada género y se queda con el de más apariciones.
  const conteoGeneros = new Map()
  datos.forEach((d) => conteoGeneros.set(d.pelicula.genero, (conteoGeneros.get(d.pelicula.genero) || 0) + 1))
  let generoFavorito = 'No disponible'
  let mayor = 0
  conteoGeneros.forEach((cantidad, genero) => {
    if (cantidad > mayor) {
      mayor = cantidad
      generoFavorito = genero
    }
  })

  const calificadas = entradas.filter((e) => e.calificacion > 0).map((e) => e.calificacion)
  const calificacionPromedio = calificadas.length === 0
    ? 0
    : Math.round((calificadas.reduce((s, c) => s + c, 0) / calificadas.length) * 100) / 100

  return {
    totalEntradas: entradas.length,
    totalGastado,
    peliculasFavoritas,
    generoFavorito,
    calificacionPromedio,
  }
}

function Estadisticas() {
  const sesion = obtenerSesion()
  const email = sesion ? sesion.usuario : ''
  const propias = obtenerEntradas().filter((e) => e.usuario === email)
  const wrapped = calcularWrapped(propias, obtenerFunciones(), obtenerPeliculas())

  return (
    <section aria-labelledby="titulo-estadisticas">
      <h2 id="titulo-estadisticas" className="titulo-paso">Mis estadísticas</h2>

      {propias.length === 0 ? (
        <p>Cuando compres tus primeras entradas vas a ver acá tu resumen de películas.</p>
      ) : (
        <dl className="resumen">
          <dt>Entradas compradas</dt>
          <dd>{wrapped.totalEntradas}</dd>
          <dt>Total gastado</dt>
          <dd>{formatearPrecio(wrapped.totalGastado)}</dd>
          <dt>Películas que viste</dt>
          <dd>{wrapped.peliculasFavoritas.join(', ')}</dd>
          <dt>Género favorito</dt>
          <dd>{wrapped.generoFavorito}</dd>
          <dt>Calificación promedio que diste</dt>
          <dd>
            {wrapped.calificacionPromedio > 0
              ? `★ ${wrapped.calificacionPromedio.toLocaleString('es-AR')} / 5`
              : 'Todavía no calificaste películas'}
          </dd>
        </dl>
      )}
    </section>
  )
}

export default Estadisticas
