// Pestaña "Validar entrada" del mostrador: el control de acceso en la puerta.
//
// Se escanea (acá: se escribe) el número de compra que codifica el QR del comprobante.
// Se validan juntas todas las butacas de esa compra: las DISPONIBLES pasan a UTILIZADA.
// Así un mismo QR compartido no entra dos veces: la segunda lectura da aviso.
//   - No existe ninguna entrada con ese número → "Entrada no encontrada"
//   - Todas sus entradas ya están UTILIZADA     → "Esta compra ya ingresó"

import { useState } from 'react'
import { obtenerEntradas, guardarEntradas, detallesCompra } from '../../data/entradas'
import { formatearFechaHora } from '../../data/formato'

function ValidarEntrada() {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [validada, setValidada] = useState(null) // detalle de las butacas recién validadas

  function handleValidar(e) {
    e.preventDefault()
    const buscado = codigo.trim().toUpperCase()
    if (buscado === '') {
      setError('Ingresá el número de compra.')
      setValidada(null)
      return
    }

    const entradas = obtenerEntradas()
    const deLaCompra = entradas.filter((en) => en.numeroCompra.toUpperCase() === buscado)
    if (deLaCompra.length === 0) {
      setError('Entrada no encontrada.')
      setValidada(null)
      return
    }
    const disponibles = deLaCompra.filter((en) => en.estado === 'DISPONIBLE')
    if (disponibles.length === 0) {
      setError('Esta compra ya ingresó: todas sus entradas ya fueron utilizadas.')
      setValidada(null)
      return
    }

    // Válida: las entradas DISPONIBLES pasan a UTILIZADA (las que ya estaban UTILIZADA no se tocan).
    const ids = disponibles.map((en) => en.id)
    guardarEntradas(entradas.map((en) => (ids.includes(en.id) ? { ...en, estado: 'UTILIZADA' } : en)))
    setError('')
    setValidada(detallesCompra(deLaCompra[0].numeroCompra, disponibles.map((en) => ({ ...en, estado: 'UTILIZADA' }))))
    setCodigo('')
  }

  return (
    <section className="contenedor-form" aria-labelledby="titulo-validar">
      <h2 id="titulo-validar" className="titulo-paso">Validar entrada en la puerta</h2>
      <p>Escaneá el QR del comprobante, o escribí el número de compra. Cada entrada sirve una sola vez.</p>

      <form onSubmit={handleValidar} noValidate>
        <div className="campo">
          <label htmlFor="validar-codigo">Número de compra</label>
          <input
            id="validar-codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'error-validar' : undefined}
          />
        </div>
        {error && (
          <p id="error-validar" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton">Validar</button>
      </form>

      {validada && (
        <article className="comprobante" aria-label="Entrada validada" role="status">
          <p className="comprobante-numero">Entrada válida. Puede ingresar.</p>
          <h3>{validada.pelicula}</h3>
          <p>{formatearFechaHora(validada.inicio)} · {validada.sala} · {validada.sucursal}</p>
          <p>Compra {validada.numeroCompra}</p>
          <ul className="butacas-compra" aria-label="Butacas validadas">
            {validada.butacas.map((b) => (
              <li key={b.butaca} className="butaca-chip">
                {b.butaca} · {b.tipo}
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  )
}

export default ValidarEntrada
