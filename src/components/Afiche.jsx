// Afiche de una película: la imagen real si la tiene, o un bloque de color con la inicial.
// Muestra la duración y la clasificación sobre la imagen, como en la cartelera de referencia.
//
// Se reutiliza en la cartelera, en la página de la película y en el resumen de compra:
// por eso vive en su propio componente.

import { formatearDuracion } from '../data/formato'

function Afiche({ pelicula, className = '' }) {
  return (
    <div className={`afiche ${className}`.trim()} aria-hidden="true">
      {pelicula.imagen ? (
        <img className="afiche-img" src={pelicula.imagen} alt="" loading="lazy" />
      ) : (
        <div className="afiche-fondo" style={{ background: pelicula.color }}>
          <span className="afiche-inicial">{pelicula.titulo.charAt(0)}</span>
        </div>
      )}
      <span className="afiche-duracion">{formatearDuracion(pelicula.duracion)}</span>
      <span className={`afiche-clasif clasif-${pelicula.clasificacion}`}>{pelicula.clasificacion}</span>
    </div>
  )
}

export default Afiche
