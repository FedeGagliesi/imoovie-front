// Pestaña "Funciones" del panel de administración. Espeja /api/admin/funciones:
//   - Alta (POST) con idioma y opciones de accesibilidad.
//   - Edición (PUT): cambia horario, precio y opciones. Como en el backend, la
//     película y la sala de una función no se cambian una vez creada.
//   - Duplicar (POST /{id}/duplicar): copia todo a otro horario.
//   - Baja lógica (DELETE → activa = false).
//
// Reglas del backend que se copian:
//   - El horario tiene que ser presente o futuro.
//   - Una sala no puede tener dos funciones solapadas: el intervalo ocupado va desde
//     el inicio hasta inicio + duración + 15 minutos de limpieza.

import { useState } from 'react'
import { obtenerPeliculas } from '../../data/peliculas'
import { obtenerSucursales } from '../../data/sucursales'
import { obtenerSalas } from '../../data/salas'
import {
  obtenerFunciones,
  guardarFunciones,
  errorSolapamiento,
  etiquetaFuncion,
  IDIOMAS,
  FORMATOS,
} from '../../data/funciones'
import { formatearDia, formatearPrecio, ahora, fechaHoraMs, siguienteId } from '../../data/formato'

const FORM_VACIO = {
  peliculaId: '',
  sucursalId: '',
  salaId: '',
  fecha: '',
  hora: '',
  precio: '',
  idioma: IDIOMAS[0],
  formato: FORMATOS[0],
  conSubtitulos: false,
  conDoblaje: false,
  conAccesibilidad: false,
}

// Devuelve un objeto con los errores (vacío = todo bien).
function validar(datos, lista, peliculas, idEditado) {
  const errores = {}

  if (datos.fecha === '') {
    errores.fecha = 'Elegí el día de la función.'
  }
  if (datos.hora === '') {
    errores.hora = 'Elegí la hora de inicio.'
  }
  if (datos.fecha !== '' && datos.hora !== '' && fechaHoraMs(datos.fecha, datos.hora) < ahora()) {
    errores.hora = 'El horario tiene que ser presente o futuro.'
  }

  const precio = Number(datos.precio)
  if (datos.precio === '' || !Number.isInteger(precio) || precio < 1 || precio > 100000) {
    errores.precio = 'El precio debe ser un número entero entre 1 y 100.000.'
  }

  if (!errores.fecha && !errores.hora && datos.salaId !== '') {
    const pelicula = peliculas.find((p) => p.id === Number(datos.peliculaId))
    const solapada = errorSolapamiento(lista, peliculas, {
      salaId: datos.salaId,
      fecha: datos.fecha,
      hora: datos.hora,
      peliculaId: pelicula ? pelicula.id : datos.peliculaId,
      excluirId: idEditado,
    })
    if (solapada) errores.hora = solapada
  }

  return errores
}

function AdminFunciones() {
  // Solo se programan películas, salas y sucursales ACTIVAS.
  const peliculas = obtenerPeliculas()
  const sucursales = obtenerSucursales()
  const salas = obtenerSalas()
  const peliculasActivas = peliculas.filter((p) => p.activa)
  const sucursalesActivas = sucursales.filter((s) => s.activa)

  const [lista, setLista] = useState(() => obtenerFunciones())
  const [datos, setDatos] = useState({
    ...FORM_VACIO,
    peliculaId: String(peliculasActivas[0]?.id ?? ''),
    sucursalId: String(sucursalesActivas[0]?.id ?? ''),
  })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  // Duplicar: qué función se está copiando y el horario nuevo que se escribe.
  const [duplicandoId, setDuplicandoId] = useState(null)
  const [horarioCopia, setHorarioCopia] = useState({ fecha: '', hora: '' })
  const [errorCopia, setErrorCopia] = useState('')
  const [filtro, setFiltro] = useState('') // '' = todas las sucursales

  const editando = editandoId !== null

  // Las salas que se pueden elegir son las activas de la sucursal elegida.
  const salasDeSucursal = salas.filter(
    (s) => s.activa && s.sucursalId === Number(datos.sucursalId),
  )

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarFunciones(nueva)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const nuevoValor = type === 'checkbox' ? checked : value
    // Al cambiar de sucursal, la sala elegida ya no sirve: se vuelve a elegir.
    const cambios = name === 'sucursalId' ? { sucursalId: value, salaId: '' } : { [name]: nuevoValor }
    setDatos({ ...datos, ...cambios })
    setMensaje('')
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setDatos({
      ...FORM_VACIO,
      peliculaId: String(peliculasActivas[0]?.id ?? ''),
      sucursalId: String(sucursalesActivas[0]?.id ?? ''),
    })
    setErrores({})
  }

  // Carga la función en el formulario. Película y sala quedan fijas (como en el backend).
  function handleEditar(funcion) {
    const sala = salas.find((s) => s.id === funcion.salaId)
    setEditandoId(funcion.id)
    setDuplicandoId(null)
    setDatos({
      peliculaId: String(funcion.peliculaId),
      sucursalId: String(sala ? sala.sucursalId : ''),
      salaId: String(funcion.salaId),
      fecha: funcion.fecha,
      hora: funcion.hora,
      precio: String(funcion.precio),
      idioma: funcion.idioma,
      formato: funcion.formato ?? '2D',
      conSubtitulos: funcion.conSubtitulos,
      conDoblaje: funcion.conDoblaje,
      conAccesibilidad: funcion.conAccesibilidad,
    })
    setErrores({})
    setMensaje('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const erroresEncontrados = validar(datos, lista, peliculas, editandoId)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensaje('')
      return
    }

    const opciones = {
      fecha: datos.fecha,
      hora: datos.hora,
      precio: Number(datos.precio),
      idioma: datos.idioma,
      formato: datos.formato,
      conSubtitulos: datos.conSubtitulos,
      conDoblaje: datos.conDoblaje,
      conAccesibilidad: datos.conAccesibilidad,
    }

    if (editando) {
      actualizarLista(lista.map((f) => (f.id === editandoId ? { ...f, ...opciones } : f)))
      setMensaje('Se actualizó la función.')
      cancelarEdicion()
      return
    }

    const nueva = {
      id: siguienteId(lista),
      peliculaId: Number(datos.peliculaId),
      salaId: Number(datos.salaId),
      ...opciones,
      activa: true,
    }
    actualizarLista([...lista, nueva])
    setMensaje('Se programó la función.')
    // Dejamos película y sucursal elegidas (para cargar varias seguidas) y
    // vaciamos solo lo que cambia de una función a otra.
    setDatos({ ...datos, fecha: '', hora: '', precio: '' })
  }

  // Baja lógica: la función deja de venderse, pero sus entradas ya vendidas se conservan.
  function handleDarDeBaja(funcion) {
    actualizarLista(lista.map((f) => (f.id === funcion.id ? { ...f, activa: false } : f)))
    setMensaje('La función fue dada de baja.')
    if (editandoId === funcion.id) cancelarEdicion()
  }

  // ---------- Duplicar ----------
  function abrirDuplicar(funcion) {
    setDuplicandoId(funcion.id)
    setHorarioCopia({ fecha: '', hora: '' })
    setErrorCopia('')
    setMensaje('')
    setEditandoId(null)
  }

  function handleDuplicar(e, original) {
    e.preventDefault()
    if (horarioCopia.fecha === '' || horarioCopia.hora === '') {
      setErrorCopia('Elegí el día y la hora de la copia.')
      return
    }
    if (fechaHoraMs(horarioCopia.fecha, horarioCopia.hora) < ahora()) {
      setErrorCopia('El horario tiene que ser presente o futuro.')
      return
    }
    const choque = errorSolapamiento(lista, peliculas, {
      salaId: original.salaId,
      fecha: horarioCopia.fecha,
      hora: horarioCopia.hora,
      peliculaId: original.peliculaId,
    })
    if (choque) {
      setErrorCopia(choque)
      return
    }

    // Copia todo de la original salvo el horario.
    const copia = {
      ...original,
      id: siguienteId(lista),
      fecha: horarioCopia.fecha,
      hora: horarioCopia.hora,
      activa: true,
    }
    actualizarLista([...lista, copia])
    setMensaje('Se duplicó la función al nuevo horario.')
    setDuplicandoId(null)
    setErrorCopia('')
  }

  // Ordenadas por día y hora. [...lista] hace una copia antes de ordenar.
  const visibles = [...lista]
    .filter((f) => {
      if (filtro === '') return true
      const sala = salas.find((s) => s.id === f.salaId)
      return sala && sala.sucursalId === Number(filtro)
    })
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))

  // Buscan el nombre en TODAS (una película, sala o sucursal dada de baja sigue figurando).
  const tituloDe = (id) => peliculas.find((p) => p.id === id)?.titulo ?? 'Película retirada'
  const salaDe = (id) => salas.find((s) => s.id === id)
  const sucursalDeSala = (sala) => sucursales.find((s) => s.id === sala?.sucursalId)

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-funcion">
        <h2 id="titulo-alta-funcion" className="titulo-paso">
          {editando ? 'Editar función' : 'Programar función'}
        </h2>
        {editando && (
          <p className="resultado-datos">
            Película y sala no se cambian una vez programada la función (igual que en el backend).
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="fun-pelicula">Película</label>
            <select
              id="fun-pelicula"
              name="peliculaId"
              value={datos.peliculaId}
              onChange={handleChange}
              disabled={editando}
            >
              {peliculasActivas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-sucursal">Sucursal</label>
            <select
              id="fun-sucursal"
              name="sucursalId"
              value={datos.sucursalId}
              onChange={handleChange}
              disabled={editando}
            >
              {sucursalesActivas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-sala">Sala</label>
            <select
              id="fun-sala"
              name="salaId"
              value={datos.salaId}
              onChange={handleChange}
              disabled={editando}
            >
              <option value="">Elegí una sala…</option>
              {salasDeSucursal.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.butacas.length} butacas)
                </option>
              ))}
            </select>
            {salasDeSucursal.length === 0 && (
              <p className="resultado-datos">Esta sucursal no tiene salas activas. Cargá una en la pestaña Salas.</p>
            )}
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
              <p id="error-fun-fecha" className="error" role="alert">{errores.fecha}</p>
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
              <p id="error-fun-hora" className="error" role="alert">{errores.hora}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="fun-precio">Precio de la entrada ($)</label>
            <input
              id="fun-precio"
              name="precio"
              type="number"
              min="1"
              max="100000"
              value={datos.precio}
              onChange={handleChange}
              aria-invalid={errores.precio ? 'true' : 'false'}
              aria-describedby={errores.precio ? 'error-fun-precio' : undefined}
            />
            {errores.precio && (
              <p id="error-fun-precio" className="error" role="alert">{errores.precio}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="fun-formato">Formato</label>
            <select id="fun-formato" name="formato" value={datos.formato} onChange={handleChange}>
              {FORMATOS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fun-idioma">Idioma</label>
            <select id="fun-idioma" name="idioma" value={datos.idioma} onChange={handleChange}>
              {IDIOMAS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <fieldset className="agregar-butaca">
            <legend>Opciones de la función</legend>
            <label className="opcion-check">
              <input type="checkbox" name="conSubtitulos" checked={datos.conSubtitulos} onChange={handleChange} />
              Con subtítulos
            </label>
            <label className="opcion-check">
              <input type="checkbox" name="conDoblaje" checked={datos.conDoblaje} onChange={handleChange} />
              Con doblaje
            </label>
            <label className="opcion-check">
              <input type="checkbox" name="conAccesibilidad" checked={datos.conAccesibilidad} onChange={handleChange} />
              Con accesibilidad
            </label>
          </fieldset>

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="hero-acciones">
            <button type="submit" className="boton">
              {editando ? 'Guardar cambios' : 'Programar función'}
            </button>
            {editando && (
              <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
          </div>
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
            {sucursales.map((s) => (
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
                <th scope="col">Sucursal y sala</th>
                <th scope="col">Día y hora</th>
                <th scope="col">Opciones</th>
                <th scope="col">Precio</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => {
                const sala = salaDe(f.salaId)
                const nombreFuncion = `${tituloDe(f.peliculaId)}, ${formatearDia(f.fecha)} ${f.hora}`
                const opciones = [
                  f.formato,
                  f.idioma,
                  f.conSubtitulos ? 'subtítulos' : null,
                  f.conDoblaje ? 'doblaje' : null,
                  f.conAccesibilidad ? 'accesibilidad' : null,
                ].filter(Boolean).join(', ')
                return (
                  <tr key={f.id}>
                    <th scope="row">{tituloDe(f.peliculaId)}</th>
                    <td>{sucursalDeSala(sala)?.nombre ?? 'Sucursal retirada'} · {sala?.nombre ?? 'Sala retirada'}</td>
                    <td>{formatearDia(f.fecha)} · {f.hora}</td>
                    <td>{opciones}</td>
                    <td>{formatearPrecio(f.precio)}</td>
                    <td>
                      <span className={`estado ${f.activa ? 'estado-activa' : 'estado-baja'}`}>
                        {f.activa ? 'Activa' : 'Dada de baja'}
                      </span>
                    </td>
                    <td>
                      {f.activa && (
                        <>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Editar función de ${nombreFuncion}`}
                            onClick={() => handleEditar(f)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Duplicar función de ${nombreFuncion}`}
                            onClick={() => abrirDuplicar(f)}
                          >
                            Duplicar
                          </button>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Dar de baja función de ${nombreFuncion}`}
                            onClick={() => handleDarDeBaja(f)}
                          >
                            Dar de baja
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && <p>No hay funciones para mostrar.</p>}

        {duplicandoId !== null && (() => {
          const original = lista.find((f) => f.id === duplicandoId)
          if (!original) return null
          return (
            <form
              className="formulario-accion"
              aria-label={`Duplicar ${etiquetaFuncion(original)}`}
              onSubmit={(e) => handleDuplicar(e, original)}
              noValidate
            >
              <h3>Duplicar función de {tituloDe(original.peliculaId)}</h3>
              <p className="resultado-datos">La copia tiene la misma película, sala, precio y opciones. Solo cambia el horario.</p>
              <div className="campo">
                <label htmlFor="copia-fecha">Nuevo día</label>
                <input
                  id="copia-fecha"
                  type="date"
                  value={horarioCopia.fecha}
                  onChange={(e) => setHorarioCopia({ ...horarioCopia, fecha: e.target.value })}
                />
              </div>
              <div className="campo">
                <label htmlFor="copia-hora">Nueva hora de inicio</label>
                <input
                  id="copia-hora"
                  type="time"
                  value={horarioCopia.hora}
                  onChange={(e) => setHorarioCopia({ ...horarioCopia, hora: e.target.value })}
                />
              </div>
              {errorCopia && <p className="error" role="alert">{errorCopia}</p>}
              <div className="hero-acciones">
                <button type="submit" className="boton">Crear copia</button>
                <button type="button" className="boton boton-secundario" onClick={() => setDuplicandoId(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          )
        })()}
      </section>
    </>
  )
}

export default AdminFunciones
