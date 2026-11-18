// Paso 3 de la compra: método de pago y términos. El pago es SIMULADO: no se piden
// datos de tarjeta en esta aplicación (la tarjeta solo se elige como método).
//
// PROPS:
//   sesion:        { nombre, usuario } de la cuenta (para precargar los datos)
//   clasificacion: clasificación de la película (define si hay aviso de menores)
//   metodo, onMetodo, menores, onMenores, terminos, onTerminos: estado controlado por la página

import { CLASIFICACIONES } from '../../data/peliculas'
import { METODOS_PAGO } from '../../data/compra'

function PasoPago({ sesion, clasificacion, metodo, onMetodo, menores, onMenores, terminos, onTerminos }) {
  // El aviso de menores solo aparece para películas restringidas (R-13, R-16, R-18).
  const restringida = clasificacion !== 'G' && clasificacion !== 'PG' && CLASIFICACIONES.includes(clasificacion)

  return (
    <section aria-labelledby="titulo-pago">
      <h2 id="titulo-pago" className="titulo-seccion">Pago</h2>

      <h3 className="subtitulo-seccion">Seleccioná método de pago</h3>
      <div className="metodos-pago" role="radiogroup" aria-label="Método de pago">
        {METODOS_PAGO.map((m) => (
          <label key={m.valor} className={`metodo-pago ${metodo === m.valor ? 'metodo-activo' : ''}`}>
            <input
              type="radio"
              name="metodo"
              value={m.valor}
              checked={metodo === m.valor}
              onChange={() => onMetodo(m.valor)}
            />
            <span>{m.nombre}</span>
          </label>
        ))}
      </div>
      <p className="texto-suave">Pago simulado: no se cargan datos de tarjeta en esta demostración.</p>

      <h3 className="subtitulo-seccion">Información</h3>
      <div className="datos-titular">
        <div className="campo">
          <label htmlFor="pago-nombre">Nombre</label>
          <input id="pago-nombre" type="text" value={sesion.nombre ?? ''} readOnly />
        </div>
        <div className="campo">
          <label htmlFor="pago-email">Email</label>
          <input id="pago-email" type="email" value={sesion.usuario ?? ''} readOnly />
        </div>
      </div>

      <h3 className="subtitulo-seccion">Términos y condiciones</h3>
      <div className="terminos">
        {restringida && (
          <label className="opcion-check">
            <input type="checkbox" checked={menores} onChange={(e) => onMenores(e.target.checked)} />
            <span>
              Declaro que los menores de {clasificacion} años ingresan acompañados por un adulto responsable.
            </span>
          </label>
        )}
        <label className="opcion-check">
          <input type="checkbox" checked={terminos} onChange={(e) => onTerminos(e.target.checked)} />
          <span>He leído y acepto los términos y condiciones de la compra.</span>
        </label>
      </div>
    </section>
  )
}

export default PasoPago
