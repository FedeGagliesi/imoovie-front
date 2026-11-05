// Página "Quiénes somos" (ruta pública "/nosotros").
//
// Es una página simple, como Contacto, y no usa nada que no hayamos visto:
// un componente, props (en IntegranteCard) y .map() para recorrer la lista.

import { Link } from 'react-router-dom'
import { integrantes } from '../data/integrantes'
import IntegranteCard from '../components/IntegranteCard'

function Nosotros() {
  return (
    <>
      {/* Presentación. aria-labelledby une la sección con su título, igual que en Landing. */}
      <section aria-labelledby="nosotros-titulo">
        <h1 id="nosotros-titulo">Quiénes somos</h1>
        <p className="bajada">
          Somos un grupo de estudiantes de Aplicaciones Interactivas (UADE) y construimos
          i-Moovie como proyecto de la materia.
        </p>
      </section>

      {/* INTEGRANTES */}
      <section aria-labelledby="integrantes-titulo">
        <h2 id="integrantes-titulo">Integrantes</h2>

        <div className="integrantes">
          {/* El mismo patrón que la cartelera de Landing: .map() devuelve UNA
              tarjeta por integrante y key (única y estable: el id) le permite
              a React distinguir un elemento de otro dentro de la lista. */}
          {integrantes.map((integrante) => (
            <IntegranteCard key={integrante.id} integrante={integrante} />
          ))}
        </div>
      </section>

      {/* INVITACIÓN A CONTACTARNOS. Se usa <Link> y no un <a> común: así
          cambia de página sin recargar toda la aplicación. */}
      <section aria-labelledby="hablemos-titulo">
        <h2 id="hablemos-titulo">¿Hablamos?</h2>
        <p className="bajada">
          Si tenés una duda, una sugerencia o querés contarnos qué te pareció i-Moovie,{' '}
          <Link to="/contacto" className="enlace-texto">escribinos desde la página de contacto</Link>.
        </p>
      </section>
    </>
  )
}

export default Nosotros
