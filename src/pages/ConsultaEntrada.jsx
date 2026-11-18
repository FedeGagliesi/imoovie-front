// Consulta pública de una entrada por su código QR (ruta "/consultar").
//
// Espeja GET /api/entradas/qr/{codigoQR} del backend: NO pide sesión, porque quien
// recibe una entrada compartida no necesita cuenta. La vista es reducida: NO muestra
// quién compró ni cuánto pagó (ver detalleEntrada en data/entradas.js).

import { useState } from 'react'
import { obtenerEntradas, detalleEntrada } from '../data/entradas'
import { formatearFechaHora } from '../data/formato'

function ConsultaEntrada() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null) // la vista reducida, o null
  const [error, setError] = useState('')

  function handleBuscar(e) {
    e.preventDefault()
    const buscado = codigo.trim()
    if (buscado === '') {
      setError('Ingresá el código de la entrada.')
      setResultado(null)
      return
    }
    // .find() devuelve la primera entrada con ese código, o undefined si no existe.
    const entrada = obtenerEntradas().find((en) => en.codigoQR === buscado)
    if (!entrada) {
      setError('No encontramos una entrada con ese código.')
      setResultado(null)
      return
    }
    setError('')
    setResultado(detalleEntrada(entrada))
  }

  return (
    <section className="contenedor-form">
      <h1>Consultar entrada</h1>
      <p>
        Ingresá el código que aparece debajo del QR de la entrada para ver sus datos. Quien
        recibió una entrada compartida no necesita tener cuenta.
      </p>

      <form onSubmit={handleBuscar} noValidate>
        <div className="campo">
          <label htmlFor="codigo-qr">Código de la entrada</label>
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
        <article className="comprobante" aria-label="Datos de la entrada" role="status">
          <p className="comprobante-numero">Estado: {resultado.estado}</p>
          <h2>{resultado.pelicula}</h2>
          <p>
            {resultado.clasificacion} · {resultado.duracion} min · {resultado.idioma}
            {resultado.conSubtitulos ? ' · subtitulada' : ''}
          </p>
          <p>{formatearFechaHora(resultado.inicio)} · {resultado.sala}</p>
          <p>{resultado.sucursal} · {resultado.sucursalDireccion}</p>
          <p>Butaca {resultado.butaca} ({resultado.tipo})</p>
        </article>
      )}
    </section>
  )
}

export default ConsultaEntrada
