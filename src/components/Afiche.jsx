// El "afiche" de una película: un póster dibujado con CSS.
//
// Todavía no tenemos imágenes de afiches reales, así que se arma uno con el
// color de la película (un degradé), su inicial grande, las perforaciones de
// una cinta de cine a los costados y la clasificación de edad en una esquina.
//
// Lo usan dos componentes: la tarjeta de la cartelera (PeliculaCard) y la ficha
// que se abre al tocarla (FichaPelicula). Es un componente "tonto": recibe la
// película por props y dibuja siempre lo mismo.
//
// Es decorativo (aria-hidden="true"): toda su información (título, edad, etc.)
// ya está escrita como texto al lado, así que un lector de pantalla no lo necesita.

function Afiche({ pelicula }) {
  return (
    // Se le pasa el color a CSS como una "variable" (--color-afiche) para que el
    // degradé del afiche se arme con él. Las variables CSS se escriben con "--".
    <div className="afiche" style={{ '--color-afiche': pelicula.color }} aria-hidden="true">
      <span className="afiche-brillo" />
      <span className="afiche-edad">{pelicula.clasificacion}</span>
      <span className="afiche-letra">{pelicula.titulo.charAt(0)}</span>
    </div>
  )
}

export default Afiche
