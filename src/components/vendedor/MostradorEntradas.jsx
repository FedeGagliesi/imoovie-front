// Pestaña "Vender entradas" del mostrador. Espeja POST /api/vendedor/entradas.
//
// Sirve para atender a alguien que llega al cine y NO compró online:
//   1) el vendedor elige la función (de su sucursal),
//   2) elige las butacas: tocándolas en el mapa, o escribiendo FILA y ASIENTO,
//   3) carga el nombre del cliente (obligatorio, como en el backend), cobra y emite.
//
// La entrada NO queda asociada a una cuenta (usuario = null), pero sí queda
// registrado qué vendedor la emitió y el canal de venta: SUCURSAL.

import { useState } from 'react'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSucursales } from '../../data/sucursales'
import { obtenerSalas } from '../../data/salas'
import { obtenerFunciones, etiquetaFuncion, haComenzado, inicioFuncion } from '../../data/funciones'
import { obtenerEntradas, agregarEntradas, butacasLibres } from '../../data/entradas'
import { armarResultados, filtrarResultados, FILTROS_VACIOS } from '../../data/busqueda'
import { MEDIOS_PAGO } from '../../data/ventas'
import { obtenerSesion } from '../../data/sesion'
import {
  formatearPrecio,
  formatearHora,
  formatearFechaHora,
  esHoy,
  ahora,
  generarNumeroCompra,
  generarCodigoQR,
  siguienteId,
} from '../../data/formato'
import { TIPOS_BUTACA } from '../../data/salas'
import EntradaQR from '../EntradaQR'
import MapaButacas from '../MapaButacas'

const MAX_BUTACAS = 6
const TELEFONO_VALIDO = /^\d{10,20}$/

function MostradorEntradas({ sucursalId }) {
  const sesion = obtenerSesion()
  const peliculas = obtenerPeliculas()
  const sucursales = obtenerSucursales()
  const salas = obtenerSalas()
  const entradas = obtenerEntradas()

  // Las funciones de ESTA sucursal que todavía se pueden vender (no comenzaron).
  const resultados = armarResultados({
    funciones: obtenerFunciones(),
    peliculas,
    sucursales,
    salas,
    entradas,
  })
  const funcionesDeLaSucursal = filtrarResultados(resultados, {
    ...FILTROS_VACIOS,
    sucursal: String(sucursalId),
  })

  const [funcionId, setFuncionId] = useState('') // '' = todavía no eligió
  const [butacas, setButacas] = useState([]) // ids elegidos, ej. ['C4', 'C5']
  const [fila, setFila] = useState('')
  const [asiento, setAsiento] = useState('1')
  const [pago, setPago] = useState(MEDIOS_PAGO[0])
  const [cliente, setCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const [comprobante, setComprobante] = useState(null) // la venta recién hecha

  // DATOS DERIVADOS
  const elegido = funcionesDeLaSucursal.find((r) => r.funcion.id === Number(funcionId))
  const salaElegida = elegido ? elegido.sala : null
  const libres = elegido ? butacasLibres(elegido.funcion, salaElegida, entradas).map((b) => b.id) : []
  const ocupadas = salaElegida ? salaElegida.butacas.map((b) => b.id).filter((id) => !libres.includes(id)) : []
  const butacasOrdenadas = [...butacas].sort()
  const total = elegido ? elegido.funcion.precio * butacas.length : 0

  // Filas y asientos de la sala elegida, para el selector "fila + asiento".
  const filasSala = salaElegida ? [...new Set(salaElegida.butacas.map((b) => b.fila))] : []
  const asientosSala = salaElegida
    ? [...new Set(salaElegida.butacas.map((b) => b.numero))].sort((a, b) => a - b)
    : []

  // Entradas vendidas HOY en el mostrador de esta sucursal.
  const vendidasHoy = entradas.filter(
    (e) => e.canal === 'SUCURSAL' && e.sucursalId === sucursalId && esHoy(e.fechaCompra),
  )
  const recaudadoHoy = vendidasHoy.reduce((suma, e) => suma + e.monto, 0)

  const tituloDe = (id) => peliculas.find((p) => p.id === id)?.titulo ?? 'Película retirada'

  function handleFuncion(e) {
    setFuncionId(e.target.value)
    setButacas([]) // cada función tiene su propia sala: se empieza de cero
    setFila('')
    setError('')
  }

  // Agrega una butaca a la venta, validando. La usan el mapa y el selector fila + asiento.
  function agregarButaca(id) {
    if (!salaElegida || !salaElegida.butacas.some((b) => b.id === id)) {
      setError(`La butaca ${id} no existe en esta sala.`)
    } else if (ocupadas.includes(id)) {
      setError(`La butaca ${id} ya está ocupada.`)
    } else if (butacas.includes(id)) {
      setError(`La butaca ${id} ya está en esta venta.`)
    } else if (butacas.length >= MAX_BUTACAS) {
      setError(`Se pueden vender hasta ${MAX_BUTACAS} butacas por venta.`)
    } else {
      setButacas([...butacas, id])
      setError('')
    }
  }

  // Tocar una butaca en el mapa: si ya estaba en la venta se saca, si no se agrega.
  function handleToggle(id) {
    if (butacas.includes(id)) {
      setButacas(butacas.filter((b) => b !== id))
      setError('')
    } else {
      agregarButaca(id)
    }
  }

  // Botón "Agregar butaca" del selector de fila y asiento: la butaca es fila + número ("C5").
  function handleAgregarPorCodigo() {
    if (fila === '') {
      setError('Elegí una fila.')
      return
    }
    agregarButaca(fila + asiento)
  }

  function handleCobrar(e) {
    e.preventDefault()

    if (!elegido) {
      setError('Elegí una función.')
      return
    }
    if (butacas.length === 0) {
      setError('Elegí al menos una butaca.')
      return
    }
    if (cliente.trim() === '') {
      setError('El nombre del cliente es obligatorio.')
      return
    }
    if (telefono.trim() !== '' && !TELEFONO_VALIDO.test(telefono.trim())) {
      setError('El teléfono debe tener entre 10 y 20 dígitos (opcional).')
      return
    }
    if (haComenzado(elegido.funcion)) {
      setError('La función ya comenzó. No se pueden vender entradas.')
      return
    }

    // Volvemos a leer las entradas justo antes de cobrar: pudo haberse vendido una
    // de estas butacas (por ejemplo, online) mientras se armaba la venta.
    const libresAhora = butacasLibres(elegido.funcion, salaElegida, obtenerEntradas()).map((b) => b.id)
    const repetidas = butacas.filter((b) => !libresAhora.includes(b))
    if (repetidas.length > 0) {
      setButacas(butacas.filter((b) => !repetidas.includes(b)))
      setError(`Se acaban de ocupar estas butacas: ${repetidas.join(', ')}. Elegí otras.`)
      return
    }

    const momento = ahora()
    const numeroCompra = generarNumeroCompra()
    const nombreCliente = cliente.trim()
    const entradasActuales = obtenerEntradas()
    let proximoId = siguienteId(entradasActuales)

    // Una entrada por butaca, cada una con su QR. Sin cuenta de cliente (usuario: null).
    const nuevas = butacasOrdenadas.map((butaca) => ({
      id: proximoId++,
      codigoQR: generarCodigoQR(),
      numeroCompra,
      funcionId: elegido.funcion.id,
      sucursalId,
      butaca,
      monto: elegido.funcion.precio,
      canal: 'SUCURSAL',
      usuario: null,
      vendedor: sesion.usuario,
      clienteMostrador: nombreCliente,
      pago,
      estado: 'DISPONIBLE',
      calificacion: 0,
      comentario: '',
      fechaCompra: momento,
    }))
    agregarEntradas(nuevas)

    setComprobante({
      numeroCompra,
      pelicula: elegido.pelicula.titulo,
      sucursal: elegido.sucursal.nombre,
      funcion: etiquetaFuncion(elegido.funcion, salaElegida),
      entradas: nuevas,
      tipos: Object.fromEntries(salaElegida.butacas.map((b) => [b.id, b.tipo])),
      total,
      pago,
      cliente: nombreCliente,
    })
    setError('')
  }

  // Empieza una venta nueva, dejando todo vacío.
  function handleNuevaVenta() {
    setComprobante(null)
    setFuncionId('')
    setButacas([])
    setFila('')
    setCliente('')
    setTelefono('')
    setError('')
  }

  // ---------- Venta hecha: comprobante ----------
  if (comprobante) {
    return (
      <section className="contenedor-form" aria-labelledby="titulo-comprobante-mostrador">
        <h2 id="titulo-comprobante-mostrador" className="titulo-paso">Entradas emitidas</h2>
        <article className="comprobante" aria-label="Comprobante de la venta">
          <p className="comprobante-numero" role="status">
            Venta Nº {comprobante.numeroCompra}
          </p>
          <h3>{comprobante.pelicula}</h3>
          <p>{comprobante.funcion}</p>
          <p>Butacas: {comprobante.entradas.map((e) => e.butaca).join(', ')}</p>
          <p>Cliente: {comprobante.cliente}</p>
          <p>
            <strong>
              Cobrado {formatearPrecio(comprobante.total)} ({comprobante.pago})
            </strong>
          </p>

          {/* Una entrada con QR por butaca, igual que en la compra online */}
          <div className="entradas-qr-lista">
            {comprobante.entradas.map((e) => (
              <EntradaQR
                key={e.id}
                entradaId={e.id}
                codigoQR={e.codigoQR}
                pelicula={comprobante.pelicula}
                sucursal={comprobante.sucursal}
                funcion={comprobante.funcion}
                butaca={`${e.butaca} (${TIPOS_BUTACA[comprobante.tipos[e.butaca]]})`}
              />
            ))}
          </div>
        </article>
        <button type="button" className="boton" onClick={handleNuevaVenta}>
          Nueva venta
        </button>
      </section>
    )
  }

  return (
    <>
      <div className="dos-columnas">
        <section aria-labelledby="titulo-func-butacas">
          <h2 id="titulo-func-butacas" className="titulo-paso">Función y butacas</h2>

          <div className="campo">
            <label htmlFor="mostr-funcion">Función</label>
            <select id="mostr-funcion" value={funcionId} onChange={handleFuncion}>
              <option value="">Elegí una función…</option>
              {funcionesDeLaSucursal.map((r) => (
                <option key={r.funcion.id} value={r.funcion.id} disabled={r.libres === 0}>
                  {r.pelicula.titulo} · {etiquetaFuncion(r.funcion, r.sala)} ·{' '}
                  {formatearPrecio(r.funcion.precio)} ·{' '}
                  {r.libres === 0 ? 'agotada' : `${r.libres} libres`}
                </option>
              ))}
            </select>
          </div>

          {funcionesDeLaSucursal.length === 0 && (
            <p>No hay funciones a la venta en esta sucursal.</p>
          )}

          {elegido && (
            <>
              {/* Dos formas de elegir la butaca: por fila y asiento, o tocándola en el mapa */}
              <fieldset className="agregar-butaca">
                <legend>Agregar por fila y asiento</legend>
                <div className="campo">
                  <label htmlFor="mostr-fila">Fila</label>
                  <select id="mostr-fila" value={fila} onChange={(e) => setFila(e.target.value)}>
                    <option value="">Elegí…</option>
                    {filasSala.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="mostr-asiento">Asiento</label>
                  <select
                    id="mostr-asiento"
                    value={asiento}
                    onChange={(e) => setAsiento(e.target.value)}
                  >
                    {asientosSala.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="boton boton-secundario"
                  onClick={handleAgregarPorCodigo}
                >
                  Agregar butaca
                </button>
              </fieldset>

              <p>O tocá las butacas en el mapa:</p>
              <MapaButacas
                butacas={salaElegida.butacas}
                ocupadas={ocupadas}
                seleccionadas={butacas}
                onToggle={handleToggle}
              />
            </>
          )}
        </section>

        <section aria-labelledby="titulo-cobro" className="venta-actual">
          <h2 id="titulo-cobro" className="titulo-paso">Venta</h2>

          <form onSubmit={handleCobrar} noValidate>
            {elegido ? (
              <p>
                <strong>{elegido.pelicula.titulo}</strong>
                <br />
                {etiquetaFuncion(elegido.funcion, salaElegida)}
                <br />
                {formatearFechaHora(inicioFuncion(elegido.funcion))}
              </p>
            ) : (
              <p>Todavía no elegiste una función.</p>
            )}

            <p aria-live="polite">
              {butacas.length === 0
                ? 'Sin butacas elegidas.'
                : `Butacas: ${butacasOrdenadas.join(', ')}`}
            </p>

            <p className="total-venta" aria-live="polite">
              Total: {formatearPrecio(total)}
            </p>

            <div className="campo">
              <label htmlFor="mostr-cliente">Nombre del cliente</label>
              <input
                id="mostr-cliente"
                type="text"
                maxLength={100}
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="mostr-telefono">Teléfono del cliente (opcional)</label>
              <input
                id="mostr-telefono"
                type="tel"
                maxLength={20}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="mostr-pago">Medio de pago</label>
              <select id="mostr-pago" value={pago} onChange={(e) => setPago(e.target.value)}>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="boton">Cobrar y emitir entradas</button>
          </form>
        </section>
      </div>

      <section aria-labelledby="titulo-vendidas">
        <h2 id="titulo-vendidas" className="titulo-paso historial-titulo">Entradas vendidas hoy</h2>

        <p className="seleccion-resumen">
          {vendidasHoy.length} {vendidasHoy.length === 1 ? 'entrada' : 'entradas'} · Recaudado{' '}
          {formatearPrecio(recaudadoHoy)}
        </p>

        {vendidasHoy.length === 0 ? (
          <p>Todavía no vendiste entradas en el mostrador hoy en esta sucursal.</p>
        ) : (
          <ul className="historial">
            {vendidasHoy.map((e) => {
              const funcion = obtenerFunciones().find((f) => f.id === e.funcionId)
              return (
                <li key={e.id} className="historial-item">
                  <div className="historial-cabecera">
                    <strong>
                      {formatearHora(e.fechaCompra)} · {e.pago}
                    </strong>
                    <strong>{formatearPrecio(e.monto)}</strong>
                  </div>
                  <p className="historial-comentario">
                    {tituloDe(funcion?.peliculaId)} · butaca {e.butaca} · {e.clienteMostrador}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default MostradorEntradas
