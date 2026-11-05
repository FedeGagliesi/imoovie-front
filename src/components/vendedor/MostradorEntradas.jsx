// Pestaña "Vender entradas" del mostrador del vendedor (Parte 15).
//
// Sirve para atender a alguien que llega al cine y NO compró online:
//   1) el vendedor elige la función (de su sucursal),
//   2) elige las butacas: tocándolas en el mapa, o escribiendo FILA y ASIENTO,
//   3) cobra (medio de pago) y emite la entrada.
//
// La venta se guarda como una COMPRA más (data/compras.js), marcada con
// origen: 'mostrador'. Por eso:
//   - las butacas quedan ocupadas para todos (también en la compra online),
//   - no aparece como pedido de candy pendiente (no lleva candy).

import { useState } from 'react'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSucursales } from '../../data/sucursales'
import {
  obtenerFunciones,
  butacasNoDisponibles,
  etiquetaFuncion,
  FILAS,
  COLUMNAS,
} from '../../data/funciones'
import { obtenerCompras, registrarCompra } from '../../data/compras'
import { armarResultados, filtrarResultados, FILTROS_VACIOS } from '../../data/busqueda'
import { MEDIOS_PAGO } from '../../data/ventas'
import { obtenerSesion } from '../../data/sesion'
import {
  formatearPrecio,
  formatearHora,
  esHoy,
  ahora,
  generarNumeroEntrada,
} from '../../data/formato'
import EntradaQR from '../EntradaQR'
import MapaButacas from '../MapaButacas'

const MAX_BUTACAS = 6

// Lista de números de asiento: [1, 2, ... 8]
const ASIENTOS = Array.from({ length: COLUMNAS }, (_, i) => i + 1)

function MostradorEntradas({ sucursalId }) {
  const sesion = obtenerSesion()
  const peliculas = obtenerPeliculas()
  const sucursales = obtenerSucursales()

  // Las funciones de ESTA sucursal, ordenadas por horario. Reutilizamos el mismo
  // cálculo del buscador del cliente: ya trae la película, la sucursal y las
  // butacas libres de cada función.
  const resultados = armarResultados({ funciones: obtenerFunciones(), peliculas, sucursales })
  const funcionesDeLaSucursal = filtrarResultados(resultados, {
    ...FILTROS_VACIOS,
    sucursal: String(sucursalId),
  })

  const [funcionId, setFuncionId] = useState('') // '' = todavía no eligió
  const [butacas, setButacas] = useState([]) // ids elegidos, ej. ['C4', 'C5']
  const [fila, setFila] = useState(FILAS[0])
  const [asiento, setAsiento] = useState('1')
  const [pago, setPago] = useState(MEDIOS_PAGO[0])
  const [cliente, setCliente] = useState('')
  const [error, setError] = useState('')
  const [comprobante, setComprobante] = useState(null) // la venta recién hecha

  // DATOS DERIVADOS
  const elegido = funcionesDeLaSucursal.find((r) => r.funcion.id === Number(funcionId))
  const compras = obtenerCompras()
  // Butacas que no se pueden vender: las simuladas + las ya compradas (online o en mostrador)
  const ocupadas = elegido ? butacasNoDisponibles(elegido.funcion.id, compras) : []
  const butacasOrdenadas = [...butacas].sort()
  const total = elegido ? elegido.funcion.precio * butacas.length : 0

  // Entradas que se vendieron HOY en el mostrador de esta sucursal
  const vendidasHoy = compras.filter(
    (c) => c.origen === 'mostrador' && c.sucursalId === sucursalId && esHoy(c.fecha),
  )
  const recaudadoHoy = vendidasHoy.reduce((suma, c) => suma + c.totalEntradas, 0)

  const tituloDe = (id) => peliculas.find((p) => p.id === id)?.titulo ?? 'Película retirada'

  function handleFuncion(e) {
    setFuncionId(e.target.value)
    setButacas([]) // cada función tiene su propia sala: se empieza de cero
    setError('')
  }

  // Agrega una butaca a la venta, validando. La usan el mapa y el selector fila + asiento.
  function agregarButaca(id) {
    if (ocupadas.includes(id)) {
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

    // Volvemos a leer las compras justo antes de cobrar: pudo haberse vendido una
    // de estas butacas (por ejemplo, online) mientras se armaba la venta.
    const ocupadasAhora = butacasNoDisponibles(elegido.funcion.id, obtenerCompras())
    const repetidas = butacas.filter((b) => ocupadasAhora.includes(b))
    if (repetidas.length > 0) {
      setButacas(butacas.filter((b) => !repetidas.includes(b)))
      setError(`Se acaban de ocupar estas butacas: ${repetidas.join(', ')}. Elegí otras.`)
      return
    }

    const momento = ahora()
    const numero = generarNumeroEntrada()
    const nombreCliente = cliente.trim() || 'Cliente de mostrador'

    registrarCompra({
      id: momento,
      fecha: momento,
      numero,
      usuario: 'mostrador', // no es un cliente con cuenta
      cliente: nombreCliente,
      origen: 'mostrador',
      vendedor: sesion.usuario,
      pago,
      sucursalId,
      peliculaId: elegido.funcion.peliculaId,
      funcionId: elegido.funcion.id,
      butacas: butacasOrdenadas,
      totalEntradas: total,
      lineasCandy: [],
      totalCandy: 0,
      retirado: true, // no lleva candy: no hay nada para entregar
    })

    setComprobante({
      numero,
      pelicula: elegido.pelicula.titulo,
      sucursal: elegido.sucursal.nombre,
      funcion: etiquetaFuncion(elegido.funcion),
      butacas: butacasOrdenadas,
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
    setCliente('')
    setError('')
  }

  // ---------- Venta hecha: comprobante ----------
  if (comprobante) {
    return (
      <section className="contenedor-form" aria-labelledby="titulo-comprobante-mostrador">
        <h2 id="titulo-comprobante-mostrador" className="titulo-paso">Entrada emitida</h2>
        <article className="comprobante" aria-label="Comprobante de la venta">
          <p className="comprobante-numero" role="status">
            Entrada Nº {comprobante.numero}
          </p>
          <h3>{comprobante.pelicula}</h3>
          <p>{comprobante.funcion}</p>
          <p>Butacas: {comprobante.butacas.join(', ')}</p>
          <p>Cliente: {comprobante.cliente}</p>
          <p>
            <strong>
              Cobrado {formatearPrecio(comprobante.total)} ({comprobante.pago})
            </strong>
          </p>

          {/* La persona se lleva su entrada con el mismo QR que en la compra online */}
          <EntradaQR
            numero={comprobante.numero}
            pelicula={comprobante.pelicula}
            sucursal={comprobante.sucursal}
            funcion={comprobante.funcion}
            butacas={comprobante.butacas}
          />
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
                  {r.pelicula.titulo} · {etiquetaFuncion(r.funcion)} ·{' '}
                  {formatearPrecio(r.funcion.precio)} ·{' '}
                  {r.libres === 0 ? 'agotada' : `${r.libres} libres`}
                </option>
              ))}
            </select>
          </div>

          {funcionesDeLaSucursal.length === 0 && (
            <p>No hay funciones programadas en esta sucursal.</p>
          )}

          {elegido && (
            <>
              {/* Dos formas de elegir la butaca: por fila y asiento, o tocándola en el mapa */}
              <fieldset className="agregar-butaca">
                <legend>Agregar por fila y asiento</legend>
                <div className="campo">
                  <label htmlFor="mostr-fila">Fila</label>
                  <select id="mostr-fila" value={fila} onChange={(e) => setFila(e.target.value)}>
                    {FILAS.map((f) => (
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
                    {ASIENTOS.map((n) => (
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
              <MapaButacas ocupadas={ocupadas} seleccionadas={butacas} onToggle={handleToggle} />
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
                {etiquetaFuncion(elegido.funcion)}
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
              <label htmlFor="mostr-cliente">Nombre del cliente (opcional)</label>
              <input
                id="mostr-cliente"
                type="text"
                maxLength={40}
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
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

            <button type="submit" className="boton">Cobrar y emitir entrada</button>
          </form>
        </section>
      </div>

      <section aria-labelledby="titulo-vendidas">
        <h2 id="titulo-vendidas" className="titulo-paso historial-titulo">Entradas vendidas hoy</h2>

        <p className="seleccion-resumen">
          {vendidasHoy.length} {vendidasHoy.length === 1 ? 'venta' : 'ventas'} · Recaudado{' '}
          {formatearPrecio(recaudadoHoy)}
        </p>

        {vendidasHoy.length === 0 ? (
          <p>Todavía no vendiste entradas en el mostrador hoy en esta sucursal.</p>
        ) : (
          <ul className="historial">
            {vendidasHoy.map((c) => (
              <li key={c.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>
                    {formatearHora(c.fecha)} · {c.pago}
                  </strong>
                  <strong>{formatearPrecio(c.totalEntradas)}</strong>
                </div>
                <p className="historial-comentario">
                  {tituloDe(c.peliculaId)} · butacas {c.butacas.join(', ')} · {c.cliente}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default MostradorEntradas
