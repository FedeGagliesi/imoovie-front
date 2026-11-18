// Visor de códigos QR apilados: se ve UN QR a la vez, con las entradas "apiladas" detrás.
// Se cambia con las flechas (botones) o deslizando con el dedo o el mouse.
//
// PROPS:
//   entradas: [{ id, codigoQR, butaca, tipo }]  → una por butaca de la compra
//   pelicula, sucursal, funcion: textos del comprobante
//
// Accesibilidad: las flechas son botones con nombre, y el contador "1 de 3" se anuncia
// al cambiar. El deslizamiento es un extra: nunca es la única forma de cambiar.

import { useRef, useState } from 'react'
import EntradaQR from './EntradaQR'

const UMBRAL_DESLIZE = 40 // píxeles mínimos para contar como deslizamiento

function CarruselQR({ entradas, pelicula, sucursal, funcion }) {
  const [indice, setIndice] = useState(0)
  const inicioX = useRef(null)
  const total = entradas.length
  const actual = entradas[indice]

  function ir(paso) {
    setIndice((i) => Math.min(total - 1, Math.max(0, i + paso)))
  }

  function handlePointerDown(e) {
    inicioX.current = e.clientX
  }

  function handlePointerUp(e) {
    if (inicioX.current === null) return
    const delta = e.clientX - inicioX.current
    inicioX.current = null
    if (delta <= -UMBRAL_DESLIZE) ir(1)
    else if (delta >= UMBRAL_DESLIZE) ir(-1)
  }

  if (total === 0) return null

  return (
    <section className="carrusel-qr" aria-roledescription="carrusel" aria-label="Códigos QR de la compra">
      <div className="carrusel-controles">
        <button
          type="button"
          className="boton-flecha"
          aria-label="Entrada anterior"
          disabled={indice === 0}
          onClick={() => ir(-1)}
        >
          ‹
        </button>
        <p className="carrusel-contador" aria-live="polite">
          Entrada {indice + 1} de {total}
        </p>
        <button
          type="button"
          className="boton-flecha"
          aria-label="Entrada siguiente"
          disabled={indice === total - 1}
          onClick={() => ir(1)}
        >
          ›
        </button>
      </div>

      {/* Las entradas de atrás se ven apiladas, como capas, debajo de la activa */}
      <div
        className="pila-qr"
        style={{ '--capas': Math.min(total - 1, 3) }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { inicioX.current = null }}
      >
        <div className="pila-qr-activa" key={actual.id}>
          <EntradaQR
            entradaId={actual.id}
            codigoQR={actual.codigoQR}
            pelicula={pelicula}
            sucursal={sucursal}
            funcion={funcion}
            butaca={`${actual.butaca} (${actual.tipo})`}
          />
        </div>
      </div>

      <div className="carrusel-puntos" aria-hidden="true">
        {entradas.map((e, i) => (
          <span key={e.id} className={i === indice ? 'punto punto-activo' : 'punto'} />
        ))}
      </div>
    </section>
  )
}

export default CarruselQR
