// Compra de entradas: el flujo paso a paso de la zona cliente.
// (Antes vivía directo en pages/Cliente.jsx; ahora Cliente es un contenedor
// con pestañas y este componente es una de ellas.)
//
// Es UN solo componente con varios PASOS. El paso actual vive en un estado:
//   'elegir'    → buscador de funciones con filtros                (Parte 13)
//   'butacas'   → mapa de la sala: elegir las butacas
//   'candy'     → productos de candy (opcional)               (Parte 6c)
//   'confirmar' → resumen para revisar antes de comprar
//   'listo'     → comprobante con el número de entrada y su código QR
// Según el valor de "paso" mostramos una cosa u otra (renderizado condicional).
// No hace falta una ruta por paso.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPeliculas } from '../data/peliculas'
import { formatearPrecio, ahora, generarNumeroEntrada } from '../data/formato'
import { obtenerFunciones, butacasNoDisponibles, etiquetaFuncion } from '../data/funciones'
import { obtenerSucursales } from '../data/sucursales'
import { obtenerProductos } from '../data/candy'
import { obtenerCompras, registrarCompra } from '../data/compras'
import { obtenerSesion } from '../data/sesion'
import { FILTROS_VACIOS } from '../data/busqueda'
import BuscadorFunciones from './BuscadorFunciones'
import EntradaQR from './EntradaQR'
import MapaButacas from './MapaButacas'
import ProductoCandy from './ProductoCandy'

const MAX_BUTACAS = 6
const MAX_POR_PRODUCTO = 10
const PASOS = ['elegir', 'butacas', 'candy', 'confirmar'] // los que se numeran

function CompraEntradas() {
  const navigate = useNavigate()

  // La lista de películas la maneja el admin (puede agregar o dar de baja),
  // por eso se pide a obtenerPeliculas() en lugar de importar una lista fija.
  const peliculas = obtenerPeliculas()

  // Lo mismo con las sucursales y las funciones: las administra el admin.
  const sucursales = obtenerSucursales()
  const funciones = obtenerFunciones()

  // El candy que se ofrece son los productos ACTIVOS del catálogo del admin.
  const productosCandy = obtenerProductos().filter((p) => p.activo)

  const [paso, setPaso] = useState('elegir')
  // Los filtros del buscador viven acá (y no dentro del buscador) para que, si
  // la persona va al mapa de butacas y vuelve, sus filtros sigan como los dejó.
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  // Estos tres se completan cuando la persona elige una función del buscador.
  const [sucursalId, setSucursalId] = useState(null)
  const [peliculaId, setPeliculaId] = useState(null)
  const [funcionId, setFuncionId] = useState(null) // null = todavía no eligió
  const [butacas, setButacas] = useState([]) // ids elegidos, ej. ['C4', 'C5']
  // El candy es un OBJETO que guarda cuántas unidades hay de cada producto:
  //   { 3: 2, 4: 1 }  →  2 de "Pochoclo grande" (id 3) y 1 de "Gaseosa" (id 4)
  const [candy, setCandy] = useState({})
  const [error, setError] = useState('')
  const [numeroEntrada, setNumeroEntrada] = useState('')

  // DATOS DERIVADOS: se calculan a partir del estado, en cada render.
  // No los guardamos con useState porque ya se pueden deducir de otros
  // estados; guardarlos dos veces invita a que queden desincronizados.
  const pelicula = peliculas.find((p) => p.id === peliculaId)
  const sucursal = sucursales.find((s) => s.id === sucursalId)
  const funcion = funciones.find((f) => f.id === funcionId)
  // Butacas que no se pueden elegir: las simuladas + las que ya compró otra gente.
  const ocupadas = funcion ? butacasNoDisponibles(funcion.id, obtenerCompras()) : []
  const cantidad = butacas.length
  const totalEntradas = funcion ? funcion.precio * cantidad : 0
  const butacasOrdenadas = [...butacas].sort() // copia ordenada, para mostrar

  // Solo los productos con al menos 1 unidad, con su cantidad agregada.
  const lineasCandy = productosCandy
    .filter((p) => (candy[p.id] || 0) > 0)
    .map((p) => ({ ...p, cantidad: candy[p.id] }))

  // .reduce() recorre el array acumulando un resultado (acá, una suma).
  // Empieza en 0 y en cada vuelta le suma precio × cantidad de la línea.
  const totalCandy = lineasCandy.reduce((suma, l) => suma + l.precio * l.cantidad, 0)
  const totalGeneral = totalEntradas + totalCandy

  // ---------- Manejadores de eventos ----------

  // El buscador llama a esta función cuando la persona elige una función.
  // Una sola función ya trae la película y la sucursal, así que se guardan
  // las tres cosas y se pasa directo al mapa de butacas.
  function handleElegirFuncion(funcionElegida) {
    setSucursalId(funcionElegida.sucursalId)
    setPeliculaId(funcionElegida.peliculaId)
    setFuncionId(funcionElegida.id)
    setButacas([]) // cada función tiene su propia sala: se empieza de cero
    setError('')
    setPaso('butacas')
  }

  // Clic en una butaca: si ya estaba elegida la sacamos; si no, la agregamos.
  function handleToggleButaca(id) {
    setError('')
    if (butacas.includes(id)) {
      // .filter() devuelve un array nuevo SIN esa butaca
      setButacas(butacas.filter((b) => b !== id))
    } else if (butacas.length >= MAX_BUTACAS) {
      setError(`Podés elegir hasta ${MAX_BUTACAS} butacas.`)
    } else {
      // Nunca modificamos el array del estado directamente (nada de .push):
      // creamos uno nuevo con "..." y se lo damos a setButacas.
      setButacas([...butacas, id])
    }
  }

  function handleContinuarButacas() {
    if (butacas.length === 0) {
      setError('Elegí al menos una butaca para continuar.')
      return
    }
    setError('')
    setPaso('candy')
  }

  // Botones + y − del candy. "cambio" vale +1 o −1.
  function handleCambiarCandy(productoId, cambio) {
    const actual = candy[productoId] || 0 // si no hay nada todavía, es 0
    const nueva = Math.min(MAX_POR_PRODUCTO, Math.max(0, actual + cambio)) // entre 0 y 10
    // Igual que con los arrays: creamos un objeto NUEVO (con "...") y
    // cambiamos solo la clave de ese producto.
    setCandy({ ...candy, [productoId]: nueva })
  }

  function handleConfirmar() {
    // Número de entrada simulado. Se genera acá (en un evento) y no durante
    // el render, porque en cada render daría un número distinto.
    const numero = generarNumeroEntrada()

    // Guardamos la compra: el vendedor ve el candy para retirar y las butacas
    // quedan ocupadas para los demás. Se guarda una COPIA de nombre, cantidad y precio del
    // candy: si el precio cambia después, la compra conserva lo que se pagó.
    const sesion = obtenerSesion()
    const momento = ahora()
    registrarCompra({
      id: momento,
      fecha: momento,
      numero,
      usuario: sesion ? sesion.usuario : 'anonimo',
      sucursalId,
      peliculaId,
      funcionId,
      butacas: butacasOrdenadas,
      totalEntradas,
      lineasCandy: lineasCandy.map((l) => ({ nombre: l.nombre, cantidad: l.cantidad, precio: l.precio })),
      totalCandy,
      retirado: false,
    })

    setNumeroEntrada(numero)
    setPaso('listo')
  }

  // Deja todo como al principio.
  function reiniciar() {
    setPaso('elegir')
    setFiltros(FILTROS_VACIOS)
    setSucursalId(null)
    setPeliculaId(null)
    setFuncionId(null)
    setButacas([])
    setCandy({})
    setError('')
    setNumeroEntrada('')
  }

  // Cancelar la compra: borra lo elegido y vuelve al primer paso, pero la
  // persona sigue dentro de su zona de cliente (con la sesión iniciada).
  // Para ir a la landing están el menú de arriba y "Volver al inicio".
  function handleCancelar() {
    reiniciar()
  }

  // Línea "Paso 2 de 4" (indexOf devuelve la posición en el array, desde 0)
  const indicadorPaso = (
    <p className="indicador-paso">
      Paso {PASOS.indexOf(paso) + 1} de {PASOS.length}
    </p>
  )

  // Botón para abandonar la compra, el mismo en todos los pasos.
  const botonCancelar = (
    <button type="button" className="boton-texto" onClick={handleCancelar}>
      Cancelar compra
    </button>
  )

  // ---------- PASO 5: comprobante ----------
  if (paso === 'listo') {
    return (
      <section className="contenedor-form">
        <h2 className="titulo-paso">¡Compra confirmada!</h2>
        <article className="comprobante" aria-label="Comprobante de entrada">
          <p className="comprobante-numero" role="status">
            Entrada Nº {numeroEntrada}
          </p>
          <h3>{pelicula.titulo}</h3>
          <p>{sucursal.nombre} · {etiquetaFuncion(funcion)}</p>
          <p>Butacas: {butacasOrdenadas.join(', ')}</p>
          {lineasCandy.length > 0 && (
            <p>
              Candy: {lineasCandy.map((l) => `${l.cantidad} × ${l.nombre}`).join(', ')}
            </p>
          )}
          <p>
            <strong>Total {formatearPrecio(totalGeneral)}</strong>
          </p>

          {/* El QR lleva los mismos datos de la entrada que se muestran arriba */}
          <EntradaQR
            numero={numeroEntrada}
            pelicula={pelicula.titulo}
            sucursal={sucursal.nombre}
            funcion={etiquetaFuncion(funcion)}
            butacas={butacasOrdenadas}
          />
        </article>
        <div className="hero-acciones">
          <button type="button" className="boton" onClick={reiniciar}>
            Comprar otra entrada
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </section>
    )
  }

  // ---------- PASO 4: confirmar ----------
  if (paso === 'confirmar') {
    return (
      <section className="contenedor-form">
        {indicadorPaso}
        <h2 className="titulo-paso">Confirmá tu compra</h2>
        <dl className="resumen">
          <dt>Película</dt>
          <dd>{pelicula.titulo}</dd>
          <dt>Sucursal</dt>
          <dd>{sucursal.nombre}</dd>
          <dt>Función</dt>
          <dd>{etiquetaFuncion(funcion)}</dd>
          <dt>Butacas</dt>
          <dd>{butacasOrdenadas.join(', ')}</dd>
          <dt>Entradas</dt>
          <dd>{cantidad} × {formatearPrecio(funcion.precio)} = {formatearPrecio(totalEntradas)}</dd>
          <dt>Candy</dt>
          <dd>
            {lineasCandy.length === 0 ? (
              'Sin candy'
            ) : (
              <ul className="resumen-candy">
                {lineasCandy.map((l) => (
                  <li key={l.id}>
                    {l.cantidad} × {l.nombre} = {formatearPrecio(l.precio * l.cantidad)}
                  </li>
                ))}
              </ul>
            )}
          </dd>
          <dt>Total</dt>
          <dd><strong>{formatearPrecio(totalGeneral)}</strong></dd>
        </dl>
        <div className="hero-acciones">
          <button type="button" className="boton" onClick={handleConfirmar}>
            Confirmar compra
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            onClick={() => setPaso('candy')}
          >
            Volver
          </button>
          {botonCancelar}
        </div>
      </section>
    )
  }

  // ---------- PASO 3: candy ----------
  if (paso === 'candy') {
    return (
      <section className="contenedor-form">
        {indicadorPaso}
        <h2 className="titulo-paso">¿Querés algo del candy?</h2>
        <p>Es opcional. Lo retirás en el mostrador con tu entrada.</p>

        <ul className="lista-candy">
          {productosCandy.map((p) => (
            <ProductoCandy
              key={p.id}
              producto={p}
              cantidad={candy[p.id] || 0}
              onCambiar={handleCambiarCandy}
            />
          ))}
        </ul>

        <p className="seleccion-resumen" aria-live="polite">
          Entradas {formatearPrecio(totalEntradas)} · Candy {formatearPrecio(totalCandy)} ·
          Total {formatearPrecio(totalGeneral)}
        </p>

        <div className="hero-acciones">
          <button type="button" className="boton" onClick={() => setPaso('confirmar')}>
            {lineasCandy.length === 0 ? 'Continuar sin candy' : 'Continuar'}
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            onClick={() => setPaso('butacas')}
          >
            Volver
          </button>
          {botonCancelar}
        </div>
      </section>
    )
  }

  // ---------- PASO 2: butacas ----------
  if (paso === 'butacas') {
    return (
      <section>
        {indicadorPaso}
        <h2 className="titulo-paso">Elegí tus butacas</h2>
        <p>
          {pelicula.titulo} · {sucursal.nombre} · {etiquetaFuncion(funcion)}
        </p>

        <MapaButacas
          ocupadas={ocupadas}
          seleccionadas={butacas}
          onToggle={handleToggleButaca}
        />

        {/* aria-live="polite": los lectores de pantalla anuncian los cambios
            de esta línea cada vez que se elige o se quita una butaca */}
        <p className="seleccion-resumen" aria-live="polite">
          {cantidad === 0
            ? 'Todavía no elegiste butacas.'
            : `Elegidas: ${butacasOrdenadas.join(', ')} · Total ${formatearPrecio(totalEntradas)}`}
        </p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="hero-acciones">
          <button type="button" className="boton" onClick={handleContinuarButacas}>
            Continuar
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            onClick={() => setPaso('elegir')}
          >
            Volver
          </button>
          {botonCancelar}
        </div>
      </section>
    )
  }

  // ---------- PASO 1: buscar y elegir una función ----------
  return (
    <section>
      {indicadorPaso}
      <h2 className="titulo-paso">Comprar entradas</h2>
      <p>Buscá tu función con los filtros y elegí tus butacas.</p>

      <BuscadorFunciones
        filtros={filtros}
        onCambiar={setFiltros}
        onElegir={handleElegirFuncion}
      />
    </section>
  )
}

export default CompraEntradas
