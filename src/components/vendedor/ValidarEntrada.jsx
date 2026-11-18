// Pestaña "Validar entrada" del mostrador: el control de acceso en la puerta.
// Espeja POST /api/vendedor/entradas/qr/{codigoQR}/validar del backend.
//
// Se escanea (acá: se escribe) el código de la entrada. Si es válida, pasa a UTILIZADA.
// Así un mismo QR compartido no entra dos veces: la segunda lectura da error.
//   - No existe              → "Entrada no encontrada"
//   - CANCELADA              → "La entrada está cancelada"
//   - UTILIZADA              → "Esta entrada ya fue utilizada" (409 en el backend)

import { useState } from 'react'
import { obtenerEntradas, guardarEntradas, detalleEntrada } from '../../data/entradas'
import { formatearFechaHora } from '../../data/formato'

function ValidarEntrada() {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [validada, setValidada] = useState(null) // detalle de la última entrada validada

  function handleValidar(e) {
    e.preventDefault()
    const buscado = codigo.trim()
    if (buscado === '') {
      setError('Ingresá el código de la entrada.')
      setValidada(null)
      return
    }

    const entradas = obtenerEntradas()
    const entrada = entradas.find((en) => en.codigoQR === buscado)
    if (!entrada) {
      setError('Entrada no encontrada.')
      setValidada(null)
      return
    }
    if (entrada.estado === 'CANCELADA') {
      setError('La entrada está cancelada. No puede ingresar.')
      setValidada(null)
      return
    }
    if (entrada.estado === 'UTILIZADA') {
      setError('Esta entrada ya fue utilizada. No puede volver a ingresar.')
      setValidada(null)
      return
    }

    // Válida: pasa a UTILIZADA (cambiamos UNA entrada y dejamos las demás igual).
    guardarEntradas(entradas.map((en) => (en.id === entrada.id ? { ...en, estado: 'UTILIZADA' } : en)))
    setError('')
    setValidada(detalleEntrada({ ...entrada, estado: 'UTILIZADA' }))
    setCodigo('')
  }

  return (
    <section className="contenedor-form" aria-labelledby="titulo-validar">
      <h2 id="titulo-validar" className="titulo-paso">Validar entrada en la puerta</h2>
      <p>Escaneá el QR de la entrada, o escribí su código. Cada entrada sirve una sola vez.</p>

      <form onSubmit={handleValidar} noValidate>
        <div className="campo">
          <label htmlFor="validar-codigo">Código de la entrada</label>
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
          <p>Butaca {validada.butaca} ({validada.tipo})</p>
        </article>
      )}
    </section>
  )
}

export default ValidarEntrada
