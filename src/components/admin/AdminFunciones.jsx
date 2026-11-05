// Pestaña "Funciones" del panel de administración (Parte 11).
//
// Una función une una película + una sucursal + un día y hora + una sala +
// un precio. El admin puede programar funciones nuevas y eliminarlas.
// Regla de negocio: una sala no puede tener dos funciones al mismo día y hora
// en la misma sucursal.

import { useState } from 'react'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSucursales } from '../../data/sucursales'
import { obtenerFunciones, guardarFunciones, SALAS } from '../../data/funciones'
import { formatearDia, formatearPrecio } from '../../data/formato'

// Devuelve un objeto con los errores (vacío = todo bien).
function validar(datos, lista) {
  const errores = {}

  // toLocaleDateString('sv-SE') da la fecha de hoy como "AAAA-MM-DD" en hora
  // local: justo el mismo formato que guarda <input type="date">. Por eso se
  // pueden comparar como texto: "2026-11-06" < "2026-11-07".
  const hoy = new Date().toLocaleDateString('sv-SE')

  if (datos.fecha === '') {
    errores.fecha = 'Elegí el día de la función.'
  } else if (datos.fecha < hoy) {
    errores.fecha = 'El día no puede ser anterior a hoy.'
  }

  if (datos.hora === '') {
    errores.hora = 'Elegí la hora de inicio.'
  }

  const precio = Number(datos.precio)
  if (datos.precio === '' || !Number.isInteger(precio) || precio < 1000 || precio > 50000) {
    errores.precio = 'El precio debe ser un número entero entre 1.000 y 50.000.'
  }

  // Regla de negocio: la sala tiene que estar libre a ese día y hora.
  const ocupada = lista.some(
    (f) =>
      f.sucursalId === Number(datos.sucursalId) &&
      f.sala === datos.sala &&
      f.fecha === datos.fecha &&
      f.hora === datos.hora,
  )
  if (!errores.fecha && !errores.hora && ocupada) {
    errores.hora = 'Esa sala ya tiene una función a esa hora en esa sucursal.'
  }

  return errores
}

function AdminFunciones() {
  // Solo se pueden programar funciones de películas y sucursales ACTIVAS.
  const todasLasPeliculas = obtenerPeliculas()
  const todasLasSucursales = obtenerSucursales()
  const peliculasActivas = todasLasPeliculas.filter((p) => p.activa)
  const sucursalesActivas = todasLasSucursales.filter((s) => s.activa)

  const [lista, setLista] = useState(() => obtenerFunciones())
  // Los <select> entregan texto, por eso guardamos los ids como texto y los
  // pasamos a número con Number() recién al guardar.
  const [datos, setDatos] = useState({
    peliculaId: String(peliculasActivas[0].id),
    sucursalId: String(sucursalesActivas[0].id),
    fecha: '',
    hora: '',
    sala: SALAS[0],
    precio: '',
  })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [filtro, setFiltro] = useState('') // '' = todas las sucursales

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarFunciones(nueva)
  }

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
    setMensaje('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const erroresEncontrados = validar(datos, lista)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensaje('')
      return
    }

    const nueva = {
      id: Math.max(0, ...lista.map((f) => f.id)) + 1,
      peliculaId: Number(datos.peliculaId),
      sucursalId: Number(datos.sucursalId),
      fecha: datos.fecha,
      hora: datos.hora,
      sala: datos.sala,
      precio: Number(datos.precio),
    }

    actualizarLista([...lista, nueva])
    setMensaje('Se programó la función.')
    // Dejamos película y sucursal elegidas (para cargar varias seguidas) y
    // vaciamos solo lo que cambia de una función a otra.
    setDatos({ ...datos, fecha: '', hora: '', precio: '' })
  }

  function handleEliminar(id) {
    actualizarLista(lista.filter((f) => f.id !== id))
    setMensaje('Se eliminó la función.')
  }

  // Ordenadas por día y hora. [...lista] hace una copia: .sort() modifica el
  // array original y nunca hay que modificar el array del estado.
  // Como "fecha + hora" es un texto tipo "2026-11-0618:30", ordenar como
  // texto equivale a ordenar cronológicamente.
  const visibles = [...lista]
    .filter((f) => filtro === '' || f.sucursalId === Number(filtro))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))

  // Buscan el nombre en TODAS (una película o sucursal dada de baja sigue
  // figurando en funciones ya cargadas).
  const tituloDe = (id) => todasLasPeliculas.find((p) => p.id === id)?.titulo ?? 'Película retirada'
  const sucursalDe = (id) => todasLasSucursales.find((s) => s.id === id)?.nombre ?? 'Sucursal retirada'

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-funcion">
        <h2 id="titulo-alta-funcion" className="titulo-paso">Programar función</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="fun-pelicula">Película</label>
            <select id="fun-pelicula" name="peliculaId" value={datos.peliculaId} onChange={handleChange}>
              {peliculasActivas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-sucursal">Sucursal</label>
            <select id="fun-sucursal" name="sucursalId" value={datos.sucursalId} onChange={handleChange}>
              {sucursalesActivas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-sala">Sala</label>
            <select id="fun-sala" name="sala" value={datos.sala} onChange={handleChange}>
              {SALAS.map((sala) => (
                <option key={sala} value={sala}>
                  {sala}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-fecha">Día</label>
            <input
              id="fun-fecha"
              name="fecha"
              type="date"
              value={datos.fecha}
              onChange={handleChange}
              aria-invalid={errores.fecha ? 'true' : 'false'}
              aria-describedby={errores.fecha ? 'error-fun-fecha' : undefined}
            />
            {errores.fecha && (
              <p id="error-fun-fecha" className="error" role="alert">
                {errores.fecha}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="fun-hora">Hora de inicio</label>
            <input
              id="fun-hora"
              name="hora"
              type="time"
              value={datos.hora}
              onChange={handleChange}
              aria-invalid={errores.hora ? 'true' : 'false'}
              aria-describedby={errores.hora ? 'error-fun-hora' : undefined}
            />
            {errores.hora && (
              <p id="error-fun-hora" className="error" role="alert">
                {errores.hora}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="fun-precio">Precio de la entrada ($)</label>
            <input
              id="fun-precio"
              name="precio"
              type="number"
              min="1000"
              max="50000"
              value={datos.precio}
              onChange={handleChange}
              aria-invalid={errores.precio ? 'true' : 'false'}
              aria-describedby={errores.precio ? 'error-fun-precio' : undefined}
            />
            {errores.precio && (
              <p id="error-fun-precio" className="error" role="alert">
                {errores.precio}
              </p>
            )}
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <button type="submit" className="boton">Programar función</button>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-funciones">
        <h2 id="titulo-lista-funciones" className="titulo-paso historial-titulo">
          Funciones programadas
        </h2>

        <div className="campo campo-filtro">
          <label htmlFor="fun-filtro">Ver funciones de</label>
          <select id="fun-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas las sucursales</option>
            {todasLasSucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <p className="seleccion-resumen" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? 'función' : 'funciones'}
        </p>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-funciones" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de funciones</caption>
            <thead>
              <tr>
                <th scope="col">Película</th>
                <th scope="col">Sucursal</th>
                <th scope="col">Día y hora</th>
                <th scope="col">Sala</th>
                <th scope="col">Precio</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => (
                <tr key={f.id}>
                  <th scope="row">{tituloDe(f.peliculaId)}</th>
                  <td>{sucursalDe(f.sucursalId)}</td>
                  <td>{formatearDia(f.fecha)} · {f.hora}</td>
                  <td>{f.sala}</td>
                  <td>{formatearPrecio(f.precio)}</td>
                  <td>
                    <button
                      type="button"
                      className="boton-texto"
                      aria-label={`Eliminar función de ${tituloDe(f.peliculaId)}, ${formatearDia(f.fecha)} ${f.hora}, ${sucursalDe(f.sucursalId)}`}
                      onClick={() => handleEliminar(f.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && <p>No hay funciones para mostrar.</p>}
      </section>
    </>
  )
}

export default AdminFunciones
