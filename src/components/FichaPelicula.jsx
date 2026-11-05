// La ficha de una película: una ventana que se abre al tocar un afiche y muestra
// el género, la duración, la edad recomendada y la sinopsis.
//
// Está hecha con la etiqueta nativa <dialog>. El navegador se encarga de lo
// difícil de una ventana emergente: oscurecer el fondo, dejar el foco del
// teclado adentro, cerrarla con la tecla Esc y devolver el foco al afiche que la
// abrió. Por eso casi no hace falta código.
//
// PROPS: pelicula (cuál mostrar), sesion (quién está logueado, o null) y
// onCerrar (función que el padre usa para saber que la ficha se cerró).

import { Link } from 'react-router-dom'
import Afiche from './Afiche'

// Qué significa cada clasificación, escrito en palabras.
const EDADES = {
  ATP: 'Apta para todo público',
  '+13': 'Mayores de 13 años',
  '+16': 'Mayores de 16 años',
  '+18': 'Mayores de 18 años',
}

function FichaPelicula({ pelicula, sesion, onCerrar }) {
  const esCliente = sesion?.rol === 'cliente'

  return (
    <dialog
      className="ficha"
      aria-labelledby="ficha-titulo"
      // Una "ref" nos da acceso al elemento real del navegador. Esta ref con
      // función se ejecuta cuando el <dialog> aparece en pantalla, y lo abre como
      // ventana modal con showModal(). (El "!el.open" evita abrirlo dos veces.)
      ref={(el) => {
        if (el && !el.open) {
          el.showModal()
        }
      }}
      // El navegador avisa con el evento "close" cuando la ventana se cierra, sea
      // con Esc o con el botón. Entonces le avisamos al padre para que la saque.
      onClose={onCerrar}
      // Tocar afuera de la ventana (en el fondo oscuro) la cierra. Ese clic llega
      // al <dialog> mismo; los clics adentro llegan a sus elementos internos.
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.currentTarget.close()
        }
      }}
    >
      <div className="ficha-contenido">
        <Afiche pelicula={pelicula} />

        <div className="ficha-info">
          <h2 id="ficha-titulo">{pelicula.titulo}</h2>

          {/* <dl> es la lista de "término → definición": ideal para datos con nombre */}
          <dl className="ficha-datos">
            <dt>Género</dt>
            <dd>{pelicula.genero}</dd>
            <dt>Duración</dt>
            <dd>{pelicula.duracion} minutos</dd>
            <dt>Edad</dt>
            <dd>{EDADES[pelicula.clasificacion] || pelicula.clasificacion}</dd>
          </dl>

          <p className="ficha-sinopsis">{pelicula.sinopsis}</p>

          <div className="hero-acciones">
            {/* Según quién mira, se ofrece lo que corresponde */}
            {esCliente && (
              <>
                <Link to="/cliente" className="boton">Comprar entradas</Link>
                {/* "state" le manda datos a la otra página sin ponerlos en la URL:
                    abre directo "Mis calificaciones" con esta película elegida. */}
                <Link
                  to="/cliente"
                  state={{ vista: 'calificaciones', peliculaId: pelicula.id }}
                  className="boton boton-secundario"
                >
                  ★ Calificar
                </Link>
              </>
            )}
            {!sesion && (
              <Link to="/login" className="boton">Ingresar para comprar entradas</Link>
            )}
          </div>
        </div>

        {/* Un formulario con method="dialog" cierra la ventana al enviarse, sin
            escribir nada de JavaScript. */}
        <form method="dialog">
          <button type="submit" className="ficha-cerrar" aria-label="Cerrar la ficha">
            ✕
          </button>
        </form>
      </div>
    </dialog>
  )
}

export default FichaPelicula
