// Consulta pública de una compra por su número de compra, el que codifica su QR (ruta "/consultar").
//
// NO pide sesión, porque quien recibe una entrada compartida no necesita cuenta. La vista
// es reducida: NO muestra quién compró ni cuánto pagó (ver detallesCompra en data/entradas.js).

import { useState } from 'react'
import { obtenerEntradas, detallesCompra } from '../data/entradas'
import { formatearFechaHora } from '../data/formato'

function ConsultaEntrada() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null) // la vista reducida, o null
  const [error, setError] = useState('')

  function handleBuscar(e) {
    e.preventDefault()
    const buscado = codigo.trim().toUpperCase()
    if (buscado === '') {
      setError('Ingresá el número de compra.')
      setResultado(null)
      return
    }
    // .find() devuelve la primera entrada con ese número, o undefined si no existe.
    const entrada = obtenerEntradas().find((en) => en.numeroCompra.toUpperCase() === buscado)
    if (!entrada) {
      setError('No encontramos una compra con ese número.')
      setResultado(null)
      return
    }
    setError('')
    setResultado(detallesCompra(entrada.numeroCompra, obtenerEntradas()))
  }

  return (
    <section className="contenedor-form">
      <h1>Consultar entrada</h1>
      <p>
        Ingresá el número de compra que figura en el comprobante junto al QR para ver los datos de la función
        y sus butacas. Quien recibió una entrada compartida no necesita tener cuenta.
      </p>

      <form onSubmit={handleBuscar} noValidate>
        <div className="campo">
          <label htmlFor="codigo-qr">Número de compra</label>
          <input
            id="codigo-qr"
            name="codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'error-codigo' : undefined}
          />
        </div>
        {error && (
          <p id="error-codigo" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton">Consultar</button>
      </form>

      {resultado && (
        <article className="comprobante" aria-label="Datos de la compra" role="status">
          <p className="comprobante-numero">Compra {resultado.numeroCompra}</p>
          <h2>{resultado.pelicula}</h2>
          <p>
            {resultado.clasificacion} · {resultado.duracion} min · {resultado.idioma}
            {resultado.conSubtitulos ? ' · subtitulada' : ''}
          </p>
          <p>{formatearFechaHora(resultado.inicio)} · {resultado.sala}</p>
          <p>{resultado.sucursal} · {resultado.sucursalDireccion}</p>
          <ul className="butacas-compra" aria-label="Butacas de la compra">
            {resultado.butacas.map((b) => (
              <li key={b.butaca} className="butaca-chip">
                {b.butaca} · {b.tipo} · {b.estado}
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  )
}

export default ConsultaEntrada
