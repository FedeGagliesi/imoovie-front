// Tarjeta de una película en la cartelera: el afiche y, debajo, el título.
// Toda la tarjeta es un botón: al tocarla se abre la ficha con más información.
//
// PROPS: son los "parámetros" de un componente. El padre (Landing) se los
// pasa como si fueran atributos HTML:
//   <PeliculaCard pelicula={algo} onAbrir={funcion} />
// y el componente los recibe como un objeto: { pelicula, onAbrir }.
//
// "onAbrir" es una FUNCIÓN que viene del padre: la tarjeta la llama cuando se
// toca, y así el padre (Landing) se entera de cuál película se eligió.

import Afiche from './Afiche'

function PeliculaCard({ pelicula, onAbrir }) {
  return (
    // Es un <button> y no un <div> con onClick: así se puede usar con el teclado
    // (Tab y Enter) y los lectores de pantalla lo anuncian como botón.
    // aria-haspopup="dialog" avisa que al activarlo se abre una ventana.
    <button
      type="button"
      className="afiche-card"
      aria-haspopup="dialog"
      aria-label={`${pelicula.titulo}. Ver información`}
      onClick={() => onAbrir(pelicula)}
    >
      <Afiche pelicula={pelicula} />
      <span className="afiche-titulo">{pelicula.titulo}</span>
      <span className="afiche-datos">
        {pelicula.genero} · {pelicula.duracion} min
      </span>
    </button>
  )
}

export default PeliculaCard
