// Tarjeta de cartelera en formato AFICHE. Toca el afiche o el título y va a la página
// de la película, donde se elige la función.
//
// PROPS:
//   pelicula: los datos de la película
//   formatos: lista de formatos disponibles para la película (ej. ['2D', 'VIP'])
//   estado:   'Estreno' | 'Próximamente' | null (se muestra como barra debajo del afiche)
//   promedio: calificación promedio (0 = sin calificar)

import { Link } from 'react-router-dom'
import Afiche from './Afiche'

function PeliculaCard({ pelicula, formatos, estado, promedio }) {
  const destino = `/pelicula/${pelicula.id}`

  return (
    <article className="pelicula-card">
      <Link to={destino} className="pelicula-enlace" tabIndex={-1}>
        <Afiche pelicula={pelicula} />
      </Link>

      <div className="pelicula-cuerpo">
        <h3>
          <Link to={destino} className="pelicula-titulo-enlace">{pelicula.titulo}</Link>
        </h3>
        <p className="pelicula-datos">{pelicula.genero}</p>
        {formatos.length > 0 && <p className="pelicula-formatos">{formatos.join(' · ')}</p>}
        {promedio > 0 && (
          <p className="pelicula-datos" aria-label={`Calificación promedio ${promedio} de 5`}>
            ★ {promedio.toLocaleString('es-AR')} / 5
          </p>
        )}
      </div>

      {estado && <p className="pelicula-estado">{estado}</p>}
    </article>
  )
}

export default PeliculaCard
